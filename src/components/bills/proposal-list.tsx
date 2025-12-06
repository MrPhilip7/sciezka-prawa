'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ThumbsUp, ThumbsDown, Minus, MessageSquare, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Proposal {
  id: string
  title: string
  description: string
  proposed_text?: string
  rationale?: string
  status: 'draft' | 'voting' | 'accepted' | 'rejected' | 'implemented'
  voting_starts_at: string
  voting_ends_at: string
  vote_threshold: number
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url?: string
  }
  vote_counts: {
    support: number
    oppose: number
    neutral: number
    total: number
  }
  votes?: Array<{
    vote: 'support' | 'oppose' | 'neutral'
    comment?: string
    user: {
      full_name: string
      avatar_url?: string
    }
  }>
}

interface ProposalListProps {
  billId: string
  isLoggedIn: boolean
}

const statusConfig = {
  draft: { label: 'Szkic', color: 'bg-gray-500' },
  voting: { label: 'Głosowanie', color: 'bg-blue-600' },
  accepted: { label: 'Zaakceptowana', color: 'bg-green-600' },
  rejected: { label: 'Odrzucona', color: 'bg-red-600' },
  implemented: { label: 'Wdrożona', color: 'bg-purple-600' }
}

export function ProposalList({ billId, isLoggedIn }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    proposedText: '',
    rationale: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProposals()
  }, [billId])

  const fetchProposals = async () => {
    try {
      const res = await fetch(`/api/proposals?billId=${billId}`)
      const data = await res.json()
      
      if (res.ok) {
        setProposals(data)
      }
    } catch (error) {
      console.error('Błąd pobierania propozycji:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proposalId: string, vote: 'support' | 'oppose' | 'neutral', comment?: string) => {
    if (!isLoggedIn) {
      toast.info('Zaloguj się, aby głosować')
      return
    }

    try {
      const res = await fetch('/api/proposals/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, vote, comment })
      })

      if (res.ok) {
        toast.success('Głos oddany!')
        fetchProposals()
        if (selectedProposal?.id === proposalId) {
          const detailRes = await fetch(`/api/proposals?proposalId=${proposalId}`)
          const detailData = await detailRes.json()
          setSelectedProposal(detailData)
        }
      } else {
        const error = await res.json()
        toast.error(error.error || 'Nie udało się oddać głosu')
      }
    } catch (error) {
      toast.error('Błąd głosowania')
    }
  }

  const handleSubmitProposal = async () => {
    if (!isLoggedIn) {
      toast.info('Zaloguj się, aby zgłaszać propozycje')
      return
    }

    if (newProposal.title.length < 10 || newProposal.description.length < 50) {
      toast.error('Tytuł min. 10 znaków, opis min. 50 znaków')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, ...newProposal })
      })

      if (res.ok) {
        toast.success('Propozycja zgłoszona!')
        setNewProposal({ title: '', description: '', proposedText: '', rationale: '' })
        fetchProposals()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Nie udało się zgłosić propozycji')
      }
    } catch (error) {
      toast.error('Błąd zgłaszania propozycji')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (proposalId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę propozycję? Wszystkie głosy zostaną utracone.')) {
      return
    }

    try {
      const res = await fetch(`/api/proposals?proposalId=${proposalId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Propozycja usunięta')
        fetchProposals()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Nie udało się usunąć propozycji')
      }
    } catch (error) {
      toast.error('Błąd usuwania propozycji')
    }
  }

  const getProgress = (proposal: Proposal) => {
    const { support, total } = proposal.vote_counts
    return total > 0 ? (support / proposal.vote_threshold) * 100 : 0
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Ładowanie propozycji...</div>
  }

  return (
    <div className="space-y-6">
      {/* Formularz nowej propozycji */}
      {isLoggedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Zgłoś propozycję zmiany
            </CardTitle>
            <CardDescription>
              Twoja propozycja zostanie poddana pod głosowanie społeczności
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tytuł (min. 10 znaków)</label>
              <input
                type="text"
                value={newProposal.title}
                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Tytuł propozycji..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Opis (min. 50 znaków)</label>
              <Textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={4}
                placeholder="Szczegółowy opis proponowanej zmiany..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Proponowana treść (opcjonalnie)</label>
              <Textarea
                value={newProposal.proposedText}
                onChange={(e) => setNewProposal(prev => ({ ...prev, proposedText: e.target.value }))}
                className="mt-1"
                rows={3}
                placeholder="Konkretna propozycja brzmienia przepisu..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Uzasadnienie (opcjonalnie)</label>
              <Textarea
                value={newProposal.rationale}
                onChange={(e) => setNewProposal(prev => ({ ...prev, rationale: e.target.value }))}
                className="mt-1"
                rows={3}
                placeholder="Dlaczego ta zmiana jest potrzebna..."
              />
            </div>
            <Button onClick={handleSubmitProposal} disabled={submitting}>
              {submitting ? 'Wysyłanie...' : 'Zgłoś propozycję'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista propozycji */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Propozycje zmian ({proposals.length})</h3>
        
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              Brak propozycji. Bądź pierwszy i zgłoś swoją!
            </CardContent>
          </Card>
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusConfig[proposal.status].color}>
                        {statusConfig[proposal.status].label}
                      </Badge>
                      {proposal.status === 'voting' && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Koniec: {new Date(proposal.voting_ends_at).toLocaleDateString('pl-PL')}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                    <CardDescription className="mt-2">{proposal.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={proposal.author.avatar_url} />
                      <AvatarFallback>{proposal.author.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{proposal.author.full_name}</div>
                      <div className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true, locale: pl })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pasek postępu */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Postęp do progu głosów</span>
                    <span className="font-medium">
                      {proposal.vote_counts.support} / {proposal.vote_threshold}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${Math.min(getProgress(proposal), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Statystyki głosów */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-semibold">{proposal.vote_counts.support}</span>
                    <span className="text-sm text-muted-foreground">Popieram</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <ThumbsDown className="h-4 w-4" />
                    <span className="font-semibold">{proposal.vote_counts.oppose}</span>
                    <span className="text-sm text-muted-foreground">Sprzeciwiam się</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Minus className="h-4 w-4" />
                    <span className="font-semibold">{proposal.vote_counts.neutral}</span>
                    <span className="text-sm text-muted-foreground">Neutralny</span>
                  </div>
                </div>

                {/* Przyciski głosowania */}
                {proposal.status === 'voting' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(proposal.id, 'support')}
                      className="flex-1"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Popieram
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(proposal.id, 'neutral')}
                      className="flex-1"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Neutralny
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(proposal.id, 'oppose')}
                      className="flex-1"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Sprzeciwiam się
                    </Button>
                  </div>
                )}

                {/* Przycisk usuwania (autor lub admin) */}
                {isLoggedIn && proposal.status !== 'implemented' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(proposal.id)}
                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Usuń propozycję
                  </Button>
                )}

                {/* Przycisk szczegółów */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="mt-2 w-full">
                      Zobacz szczegóły
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{proposal.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Opis</h4>
                        <p className="text-sm text-muted-foreground">{proposal.description}</p>
                      </div>
                      {proposal.proposed_text && (
                        <div>
                          <h4 className="font-semibold mb-2">Proponowana treść</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.proposed_text}</p>
                        </div>
                      )}
                      {proposal.rationale && (
                        <div>
                          <h4 className="font-semibold mb-2">Uzasadnienie</h4>
                          <p className="text-sm text-muted-foreground">{proposal.rationale}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
