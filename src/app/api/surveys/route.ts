import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/surveys?billId=xxx - Pobierz ankiety dla ustawy
// GET /api/surveys?surveyId=xxx - Pobierz konkretną ankietę z pytaniami
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const billId = searchParams.get('billId')
  const surveyId = searchParams.get('surveyId')

  try {
    // Pobierz konkretną ankietę z pytaniami
    if (surveyId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: survey, error: surveyError } = await (supabase as any)
        .from('consultation_surveys')
        .select(`
          *,
          created_by_profile:profiles!consultation_surveys_created_by_fkey(id, full_name, avatar_url),
          questions:survey_questions(
            id,
            question_text,
            question_type,
            is_required,
            order_index,
            options
          )
        `)
        .eq('id', surveyId)
        .single()

      if (surveyError) {
        return NextResponse.json({ error: surveyError.message }, { status: 400 })
      }

      // Policz odpowiedzi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', surveyId)

      return NextResponse.json({
        ...survey,
        response_count: count || 0,
        questions: survey.questions?.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index) || []
      })
    }

    // Pobierz ankiety dla ustawy
    if (billId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: surveys, error } = await (supabase as any)
        .from('consultation_surveys')
        .select(`
          id,
          title,
          description,
          status,
          starts_at,
          ends_at,
          is_anonymous,
          created_at,
          created_by_profile:profiles!consultation_surveys_created_by_fkey(id, full_name)
        `)
        .eq('bill_id', billId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Policz odpowiedzi dla każdej ankiety
      const surveysWithCounts = await Promise.all(
        (surveys || []).map(async (survey: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { count } = await (supabase as any)
            .from('survey_responses')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', survey.id)

          return { ...survey, response_count: count || 0 }
        })
      )

      return NextResponse.json(surveysWithCounts)
    }

    return NextResponse.json({ error: 'Missing billId or surveyId parameter' }, { status: 400 })
  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 })
  }
}

// POST /api/surveys - Utwórz nową ankietę (tylko admini)
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sprawdź uprawnienia
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { billId, title, description, startsAt, endsAt, isAnonymous, questions } = body

    // Walidacja
    if (!billId || !title || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Utwórz ankietę
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: survey, error: surveyError } = await (supabase as any)
      .from('consultation_surveys')
      .insert({
        bill_id: billId,
        title,
        description,
        status: 'active',
        starts_at: startsAt,
        ends_at: endsAt,
        created_by: user.id,
        is_anonymous: isAnonymous || false
      })
      .select()
      .single()

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 400 })
    }

    // Dodaj pytania
    const questionsToInsert = questions.map((q: any, index: number) => ({
      survey_id: survey.id,
      question_text: q.questionText,
      question_type: q.questionType,
      is_required: q.isRequired || false,
      order_index: index,
      options: q.options || null
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: questionsError } = await (supabase as any)
      .from('survey_questions')
      .insert(questionsToInsert)

    if (questionsError) {
      // Usuń ankietę jeśli nie udało się dodać pytań
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('consultation_surveys').delete().eq('id', survey.id)
      return NextResponse.json({ error: questionsError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, surveyId: survey.id }, { status: 201 })
  } catch (error) {
    console.error('Survey creation error:', error)
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 })
  }
}
