import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/proposals/vote - Zagłosuj na propozycję
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { proposalId, vote, comment } = body

    // Walidacja
    if (!proposalId || !vote || !['support', 'oppose', 'neutral'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Sprawdź czy propozycja jest w fazie głosowania
    const { data: proposal, error: proposalError } = await supabase
      .from('amendment_proposals')
      .select('status, voting_ends_at')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (proposal.status !== 'voting') {
      return NextResponse.json({ error: 'Proposal is not in voting phase' }, { status: 400 })
    }

    if (proposal.voting_ends_at && new Date(proposal.voting_ends_at) < new Date()) {
      return NextResponse.json({ error: 'Voting has ended' }, { status: 400 })
    }

    // Dodaj lub zaktualizuj głos (upsert)
    const { error } = await supabase
      .from('proposal_votes')
      .upsert({
        proposal_id: proposalId,
        user_id: user.id,
        vote,
        comment
      }, {
        onConflict: 'proposal_id,user_id'
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
  }
}

// DELETE /api/proposals/vote?proposalId=xxx - Usuń swój głos
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

    const { error } = await supabase
      .from('proposal_votes')
      .delete()
      .eq('proposal_id', proposalId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 })
  }
}
