'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Reply, 
  Edit2, 
  Trash2, 
  ThumbsUp, 
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ConsultationForumProps {
  billId: string
  billTitle: string
  billStatus: string
  isLoggedIn: boolean
}

interface Comment {
  id: string
  bill_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
  edited_at: string | null
  parent_comment_id: string | null
  profiles: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
  reactions: Array<{
    id: string
    reaction_type: string
    user_id: string
  }>
  replies?: Comment[]
}

export function ConsultationForum({ billId, billTitle, billStatus, isLoggedIn }: ConsultationForumProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const canComment = isLoggedIn && ['co_creation', 'preconsultation', 'consultation'].includes(billStatus)

  useEffect(() => {
    fetchComments()
    fetchCurrentUser()
  }, [billId])

  async function fetchCurrentUser() {
    if (!isLoggedIn) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
  }

  async function fetchComments() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/consultation-comments?billId=${billId}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Nie udało się pobrać komentarzy')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim()) return
    if (newComment.trim().length < 10) {
      toast.error('Komentarz musi mieć minimum 10 znaków')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/consultation-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          content: newComment,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post comment')
      }

      setNewComment('')
      toast.success('Komentarz został dodany')
      await fetchComments()
    } catch (error: any) {
      toast.error(error.message || 'Nie udało się dodać komentarza')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitReply(parentId: string) {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/consultation-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          content: replyContent,
          parentCommentId: parentId,
        }),
      })

      if (!response.ok) throw new Error('Failed to post reply')

      setReplyContent('')
      setReplyingTo(null)
      toast.success('Odpowiedź została dodana')
      await fetchComments()
    } catch (error) {
      toast.error('Nie udało się dodać odpowiedzi')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/consultation-comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          content: editContent,
        }),
      })

      if (!response.ok) throw new Error('Failed to edit comment')

      setEditingId(null)
      setEditContent('')
      toast.success('Komentarz został zaktualizowany')
      await fetchComments()
    } catch (error) {
      toast.error('Nie udało się edytować komentarza')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten komentarz?')) return

    try {
      const response = await fetch(`/api/consultation-comments?commentId=${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      toast.success('Komentarz został usunięty')
      await fetchComments()
    } catch (error) {
      toast.error('Nie udało się usunąć komentarza')
    }
  }

  function getUserInitials(name: string | null, email: string): string {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  function renderComment(comment: Comment, isReply = false) {
    const isAuthor = currentUserId === comment.user_id
    const isEditing = editingId === comment.id
    const likesCount = comment.reactions?.filter(r => r.reaction_type === 'like').length || 0

    return (
      <div key={comment.id} className={isReply ? 'ml-12 mt-4' : ''}>
        <Card className={isReply ? 'bg-muted/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {getUserInitials(comment.profiles.full_name, comment.profiles.email)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">
                      {comment.profiles.full_name || comment.profiles.email.split('@')[0]}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: pl 
                      })}
                    </span>
                    {comment.is_edited && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        edytowano
                      </Badge>
                    )}
                  </div>

                  {isAuthor && !isEditing && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Zapisz'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null)
                          setEditContent('')
                        }}
                        disabled={isSubmitting}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        {likesCount > 0 && <span>{likesCount}</span>}
                      </Button>

                      {canComment && !isReply && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(comment.id)}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Odpowiedz
                        </Button>
                      )}
                    </div>

                    {replyingTo === comment.id && (
                      <div className="mt-4 space-y-2">
                        <Textarea
                          placeholder="Napisz odpowiedź..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[100px]"
                          disabled={isSubmitting}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={isSubmitting || !replyContent.trim()}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Wyślij
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent('')
                            }}
                            disabled={isSubmitting}
                          >
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Forum Konsultacji</CardTitle>
          </div>
          <CardDescription>
            Weź udział w dyskusji nad projektem: <strong>{billTitle}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canComment && (
            <div className="mb-6 p-4 bg-muted rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {!isLoggedIn ? (
                  <p>
                    <strong>Zaloguj się</strong>, aby wziąć udział w dyskusji.
                  </p>
                ) : (
                  <p>
                    Komentarze są dostępne tylko dla projektów w fazie współtworzenia, prekonsultacji lub konsultacji.
                  </p>
                )}
              </div>
            </div>
          )}

          {canComment && (
            <div className="space-y-4 mb-6">
              <Textarea
                placeholder="Podziel się swoją opinią o projekcie ustawy..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px]"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {newComment.length}/5000 znaków (minimum 10)
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || newComment.trim().length < 10}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Dodaj komentarz
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">
                Komentarze ({comments.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Brak komentarzy. Bądź pierwszy!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map(comment => renderComment(comment))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
