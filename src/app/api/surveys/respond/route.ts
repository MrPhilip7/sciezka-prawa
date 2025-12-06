import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/surveys/respond - Prześlij odpowiedzi na ankietę
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()
    const { surveyId, answers, isAnonymous } = body

    // Walidacja
    if (!surveyId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sprawdź czy ankieta jest aktywna
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: survey, error: surveyError } = await (supabase as any)
      .from('consultation_surveys')
      .select('id, status, ends_at, is_anonymous')
      .eq('id', surveyId)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    if (survey.status !== 'active') {
      return NextResponse.json({ error: 'Survey is not active' }, { status: 400 })
    }

    if (survey.ends_at && new Date(survey.ends_at) < new Date()) {
      return NextResponse.json({ error: 'Survey has ended' }, { status: 400 })
    }

    // Dla nielogowanych użytkowników sprawdź czy ankieta pozwala na anonimowe odpowiedzi
    if (!user && !survey.is_anonymous) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Sprawdź czy użytkownik już nie odpowiedział (jeśli nie anonimowo)
    if (user && !isAnonymous) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from('survey_responses')
        .select('id')
        .eq('survey_id', surveyId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'You have already responded to this survey' }, { status: 400 })
      }
    }

    // Utwórz response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: response, error: responseError } = await (supabase as any)
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        user_id: (isAnonymous || !user) ? null : user.id
      })
      .select()
      .single()

    if (responseError) {
      return NextResponse.json({ error: responseError.message }, { status: 400 })
    }

    // Dodaj odpowiedzi na pytania
    const answersToInsert = answers.map((answer: any) => ({
      response_id: response.id,
      question_id: answer.questionId,
      answer_text: answer.answerText || null,
      selected_options: answer.selectedOptions || null,
      rating_value: answer.ratingValue || null
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: answersError } = await (supabase as any)
      .from('survey_answers')
      .insert(answersToInsert)

    if (answersError) {
      // Usuń response jeśli nie udało się dodać odpowiedzi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('survey_responses').delete().eq('id', response.id)
      return NextResponse.json({ error: answersError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, responseId: response.id }, { status: 201 })
  } catch (error) {
    console.error('Survey response error:', error)
    return NextResponse.json({ error: 'Failed to submit survey response' }, { status: 500 })
  }
}
