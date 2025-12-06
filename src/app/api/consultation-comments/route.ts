import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/consultation-comments?billId={id}
 * Pobierz komentarze dla danej ustawy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billId = searchParams.get('billId')

    if (!billId) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Pobierz komentarze z informacjami o użytkownikach
    const { data: comments, error } = await supabase
      .from('consultation_comments')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url
        ),
        reactions:consultation_comment_reactions (
          id,
          reaction_type,
          user_id
        )
      `)
      .eq('bill_id', billId)
      .is('parent_comment_id', null) // Tylko komentarze główne
      .order('created_at', { ascending: false })

    if (error) throw error

    // Pobierz odpowiedzi dla każdego komentarza
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('consultation_comments')
          .select(`
            *,
            profiles:user_id (
              id,
              email,
              full_name,
              avatar_url
            ),
            reactions:consultation_comment_reactions (
              id,
              reaction_type,
              user_id
            )
          `)
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || []
        }
      })
    )

    return NextResponse.json({ comments: commentsWithReplies })

  } catch (error: any) {
    console.error('[Consultation Comments API] Error fetching comments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/consultation-comments
 * Dodaj nowy komentarz
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { billId, content, parentCommentId } = body

    if (!billId || !content) {
      return NextResponse.json(
        { error: 'Bill ID and content are required' },
        { status: 400 }
      )
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Komentarz musi mieć minimum 10 znaków' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Komentarz może mieć maksymalnie 5000 znaków' },
        { status: 400 }
      )
    }

    // Dodaj komentarz
    const { data: comment, error } = await supabase
      .from('consultation_comments')
      .insert({
        bill_id: billId,
        user_id: user.id,
        parent_comment_id: parentCommentId || null,
        content: content.trim(),
      })
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ comment }, { status: 201 })

  } catch (error: any) {
    console.error('[Consultation Comments API] Error creating comment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/consultation-comments
 * Edytuj komentarz
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { commentId, content } = body

    if (!commentId || !content) {
      return NextResponse.json(
        { error: 'Comment ID and content are required' },
        { status: 400 }
      )
    }

    // Sprawdź czy użytkownik jest właścicielem komentarza
    const { data: existing } = await supabase
      .from('consultation_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Edytuj komentarz
    const { data: comment, error } = await supabase
      .from('consultation_comments')
      .update({
        content: content.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ comment })

  } catch (error: any) {
    console.error('[Consultation Comments API] Error updating comment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/consultation-comments?commentId={id}
 * Usuń komentarz
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Sprawdź czy użytkownik jest właścicielem
    const { data: existing } = await supabase
      .from('consultation_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Usuń komentarz (kaskadowo usunie też odpowiedzi)
    const { error } = await supabase
      .from('consultation_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Consultation Comments API] Error deleting comment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
