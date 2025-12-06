import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/proposals?billId=xxx - Pobierz propozycje dla ustawy
// GET /api/proposals?proposalId=xxx - Pobierz konkretną propozycję
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const billId = searchParams.get('billId')
  const proposalId = searchParams.get('proposalId')

  try {
    if (proposalId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: proposal, error } = await (supabase as any)
        .from('amendment_proposals')
        .select(`
          *,
          author:profiles!amendment_proposals_author_id_fkey(id, full_name, avatar_url),
          votes:proposal_votes(
            id,
            vote,
            comment,
            created_at,
            user:profiles!proposal_votes_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('id', proposalId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Policz głosy
      const supportCount = proposal.votes?.filter((v: any) => v.vote === 'support').length || 0
      const opposeCount = proposal.votes?.filter((v: any) => v.vote === 'oppose').length || 0
      const neutralCount = proposal.votes?.filter((v: any) => v.vote === 'neutral').length || 0

      return NextResponse.json({
        ...proposal,
        vote_counts: {
          support: supportCount,
          oppose: opposeCount,
          neutral: neutralCount,
          total: proposal.votes?.length || 0
        }
      })
    }

    if (billId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: proposals, error } = await (supabase as any)
        .from('amendment_proposals')
        .select(`
          id,
          title,
          description,
          status,
          voting_starts_at,
          voting_ends_at,
          vote_threshold,
          created_at,
          author:profiles!amendment_proposals_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('bill_id', billId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Policz głosy dla każdej propozycji
      const proposalsWithVotes = await Promise.all(
        (proposals || []).map(async (proposal: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: votes } = await (supabase as any)
            .from('proposal_votes')
            .select('vote')
            .eq('proposal_id', proposal.id)

          const supportCount = votes?.filter((v: { vote: string }) => v.vote === 'support').length || 0
          const opposeCount = votes?.filter((v: { vote: string }) => v.vote === 'oppose').length || 0
          const neutralCount = votes?.filter((v: { vote: string }) => v.vote === 'neutral').length || 0

          return {
            ...proposal,
            vote_counts: {
              support: supportCount,
              oppose: opposeCount,
              neutral: neutralCount,
              total: votes?.length || 0
            }
          }
        })
      )

      return NextResponse.json(proposalsWithVotes)
    }

    return NextResponse.json({ error: 'Missing billId or proposalId parameter' }, { status: 400 })
  } catch (error) {
    console.error('Proposals fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

// POST /api/proposals - Utwórz nową propozycję zmiany
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { billId, title, description, proposedText, rationale, voteThreshold } = body

    // Walidacja
    if (!billId || !title || !description || title.length < 10 || description.length < 50) {
      return NextResponse.json({ 
        error: 'Invalid input. Title min 10 chars, description min 50 chars.' 
      }, { status: 400 })
    }

    // Utwórz propozycję
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: proposal, error } = await (supabase as any)
      .from('amendment_proposals')
      .insert({
        bill_id: billId,
        author_id: user.id,
        title,
        description,
        proposed_text: proposedText,
        rationale,
        status: 'voting',
        voting_starts_at: new Date().toISOString(),
        voting_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dni
        vote_threshold: voteThreshold || 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, proposalId: proposal.id }, { status: 201 })
  } catch (error) {
    console.error('Proposal creation error:', error)
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}

// PATCH /api/proposals?proposalId=xxx - Zaktualizuj status propozycji (tylko admini)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const proposalId = searchParams.get('proposalId')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!proposalId) {
      return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    // Sprawdź uprawnienia
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Zaktualizuj status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('amendment_proposals')
      .update({ status })
      .eq('id', proposalId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proposal update error:', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}

// DELETE /api/proposals?proposalId=xxx - Usuń propozycję (autor lub admin)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const proposalId = searchParams.get('proposalId')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!proposalId) {
      return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 })
    }

    // Pobierz propozycję
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: proposal, error: fetchError } = await (supabase as any)
      .from('amendment_proposals')
      .select('author_id')
      .eq('id', proposalId)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Sprawdź uprawnienia (autor lub admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAuthor = proposal.author_id === user.id
    const isAdmin = profile && ['admin', 'super_admin', 'moderator'].includes(profile.role)

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Usuń propozycję (kaskadowo usuwa głosy)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('amendment_proposals')
      .delete()
      .eq('id', proposalId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proposal deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 })
  }
}
