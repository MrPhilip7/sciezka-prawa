'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Bill, UserRole } from '@/types/supabase'

interface BillsManagementContentProps {
  bills: Bill[]
  totalCount: number
  currentPage: number
  userRole: UserRole
  filters: {
    query: string
    hidden: string
  }
}

export function BillsManagementContent({ 
  bills, 
  totalCount, 
  currentPage, 
  userRole,
  filters 
}: BillsManagementContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(filters.query)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    bill: Bill | null
  }>({ open: false, bill: null })
  const [editForm, setEditForm] = useState({ title: '', description: '' })
  
  // Hide dialog state
  const [hideDialog, setHideDialog] = useState<{
    open: boolean
    billId: string
    billTitle: string
  }>({ open: false, billId: '', billTitle: '' })
  const [hideReason, setHideReason] = useState('')
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    billId: string
    billTitle: string
  }>({ open: false, billId: '', billTitle: '' })

  const limit = 20
  const totalPages = Math.ceil(totalCount / limit)
  const canDelete = userRole === 'admin' || userRole === 'super_admin'

  const updateFilters = (updates: Partial<typeof filters & { page?: string }>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key === 'query' ? 'q' : key, value)
      } else {
        params.delete(key === 'query' ? 'q' : key)
      }
    })
    
    if (!updates.hasOwnProperty('page')) {
      params.delete('page')
    }
    
    router.push(`/admin/bills?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ query: searchQuery })
  }

  const handleEdit = async () => {
    if (!editDialog.bill) return
    setIsLoading(editDialog.bill.id)
    
    try {
      const response = await fetch(`/api/admin/bills/${editDialog.bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
        }),
      })

      if (!response.ok) throw new Error('Failed to update bill')

      toast.success('Ustawa została zaktualizowana')
      setEditDialog({ open: false, bill: null })
      router.refresh()
    } catch (error) {
      toast.error('Wystąpił błąd podczas aktualizacji')
    } finally {
      setIsLoading(null)
    }
  }

  const handleHide = async () => {
    setIsLoading(hideDialog.billId)
    
    try {
      const response = await fetch(`/api/admin/bills/${hideDialog.billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hide',
          reason: hideReason,
        }),
      })

      if (!response.ok) throw new Error('Failed to hide bill')

      toast.success('Ustawa została ukryta')
      setHideDialog({ open: false, billId: '', billTitle: '' })
      setHideReason('')
      router.refresh()
    } catch (error) {
      toast.error('Wystąpił błąd')
    } finally {
      setIsLoading(null)
    }
  }

  const handleUnhide = async (billId: string) => {
    setIsLoading(billId)
    
    try {
      const response = await fetch(`/api/admin/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unhide' }),
      })

      if (!response.ok) throw new Error('Failed to unhide bill')

      toast.success('Ustawa jest ponownie widoczna')
      router.refresh()
    } catch (error) {
      toast.error('Wystąpił błąd')
    } finally {
      setIsLoading(null)
    }
  }

  const handleDelete = async () => {
    setIsLoading(deleteDialog.billId)
    
    try {
      const response = await fetch(`/api/admin/bills/${deleteDialog.billId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete bill')

      toast.success('Ustawa została usunięta')
      setDeleteDialog({ open: false, billId: '', billTitle: '' })
      router.refresh()
    } catch (error) {
      toast.error('Wystąpił błąd podczas usuwania')
    } finally {
      setIsLoading(null)
    }
  }

  const openEditDialog = (bill: Bill) => {
    setEditForm({ title: bill.title, description: bill.description || '' })
    setEditDialog({ open: true, bill })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Zarządzanie ustawami
          </h2>
          <p className="text-muted-foreground">
            Edytuj, ukrywaj i usuwaj projekty ustaw
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po tytule lub numerze druku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Szukaj</Button>
            </form>
            
            <Select
              value={filters.hidden}
              onValueChange={(value) => updateFilters({ hidden: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status widoczności" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="false">Widoczne</SelectItem>
                <SelectItem value="true">Ukryte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawy ({totalCount})</CardTitle>
          <CardDescription>Kliknij na trzy kropki aby zarządzać ustawą</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Nr druku</TableHead>
                <TableHead>Tytuł</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead className="w-[80px] text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id} className={bill.is_hidden ? 'opacity-60' : ''}>
                  <TableCell>
                    <Badge variant="outline">{bill.sejm_id}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium line-clamp-1">{bill.title}</p>
                      {bill.is_hidden && (
                        <div className="flex items-center gap-1 mt-1">
                          <EyeOff className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-500">
                            Ukryta{bill.hidden_reason && `: ${bill.hidden_reason}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{bill.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {bill.submission_date && format(new Date(bill.submission_date), 'd MMM yyyy', { locale: pl })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={isLoading === bill.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/bills/${bill.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            Podgląd
                          </Link>
                        </DropdownMenuItem>
                        {bill.external_url && (
                          <DropdownMenuItem asChild>
                            <a href={bill.external_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Sejm.gov.pl
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(bill)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edytuj
                        </DropdownMenuItem>
                        {bill.is_hidden ? (
                          <DropdownMenuItem onClick={() => handleUnhide(bill.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Pokaż
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => setHideDialog({ 
                              open: true, 
                              billId: bill.id, 
                              billTitle: bill.title 
                            })}
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Ukryj
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteDialog({
                                open: true,
                                billId: bill.id,
                                billTitle: bill.title,
                              })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Usuń
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => updateFilters({ page: String(currentPage - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Strona {currentPage} z {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => updateFilters({ page: String(currentPage + 1) })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, bill: editDialog.bill })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edytuj ustawę</DialogTitle>
            <DialogDescription>
              {editDialog.bill?.sejm_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tytuł</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                rows={5}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, bill: null })}>
              Anuluj
            </Button>
            <Button onClick={handleEdit} disabled={isLoading !== null}>
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hide Dialog */}
      <Dialog open={hideDialog.open} onOpenChange={(open) => setHideDialog({ ...hideDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ukryj ustawę</DialogTitle>
            <DialogDescription>
              Ustawa nie będzie widoczna dla zwykłych użytkowników.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">{hideDialog.billTitle}</p>
            <div className="space-y-2">
              <Label htmlFor="reason">Powód ukrycia (opcjonalnie)</Label>
              <Input
                id="reason"
                placeholder="np. Duplikat, błędne dane..."
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHideDialog({ open: false, billId: '', billTitle: '' })}>
              Anuluj
            </Button>
            <Button onClick={handleHide} disabled={isLoading !== null}>
              Ukryj ustawę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć ustawę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Ustawa <strong>{deleteDialog.billTitle}</strong> zostanie trwale usunięta z bazy danych.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
