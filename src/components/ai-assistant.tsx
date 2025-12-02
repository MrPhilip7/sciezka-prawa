'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { X, Send, Loader2, Minimize2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Formalna ikona asystenta prawnego
function AssistantIcon({ className, isThinking }: { className?: string; isThinking?: boolean }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-full h-full transition-transform duration-300",
          isThinking && "animate-pulse"
        )}
      >
        {/* Tło - gradientowy okrąg w kolorach aplikacji */}
        <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" />
        <circle cx="50" cy="50" r="44" fill="url(#innerGradient)" />
        
        {/* Stylizowana waga sprawiedliwości / paragraf */}
        <g transform="translate(50, 50)" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Paragraf § */}
          <path 
            d="M-8,-20 Q-8,-28 0,-28 Q8,-28 8,-20 Q8,-12 0,-12 Q-8,-12 -8,-4 Q-8,4 0,4 Q8,4 8,12 Q8,20 0,20 Q-8,20 -8,12"
            className={cn(isThinking && "animate-pulse")}
          />
          
          {/* Dekoracyjne linie po bokach */}
          <line x1="-22" y1="-15" x2="-22" y2="15" strokeWidth="1.5" opacity="0.6" />
          <line x1="22" y1="-15" x2="22" y2="15" strokeWidth="1.5" opacity="0.6" />
          
          {/* Górna linia dekoracyjna */}
          <line x1="-15" y1="-32" x2="15" y2="-32" strokeWidth="1.5" opacity="0.4" />
          <line x1="-12" y1="-35" x2="12" y2="-35" strokeWidth="1" opacity="0.3" />
          
          {/* Dolna linia dekoracyjna */}
          <line x1="-15" y1="32" x2="15" y2="32" strokeWidth="1.5" opacity="0.4" />
          <line x1="-12" y1="35" x2="12" y2="35" strokeWidth="1" opacity="0.3" />
        </g>
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.9)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Subtelny pulsujący efekt gdy myśli */}
      {isThinking && (
        <div className="absolute inset-0 animate-ping opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  )
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Witaj! Jestem asystentem Ścieżki Prawa 🦅 Mogę pomóc Ci zrozumieć proces legislacyjny w Polsce lub odpowiedzieć na pytania dotyczące działania aplikacji. O co chcesz zapytać?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll do najnowszej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus na input po otwarciu
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Przepraszam, mam chwilowe problemy z połączeniem. Spróbuj ponownie za chwilę.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Przycisk orła (gdy chat zamknięty)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Otwórz asystenta AI"
      >
        <div className="relative">
          <AssistantIcon className="w-16 h-16 drop-shadow-lg transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
        </div>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Zapytaj asystenta 🦅
        </span>
      </button>
    )
  }

  // Zminimalizowany widok
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="flex items-center gap-3 p-3 shadow-xl cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setIsMinimized(false)}>
          <AssistantIcon className="w-10 h-10" />
          <span className="font-medium">Asystent Ścieżki Prawa</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}>
            <X className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    )
  }

  // Pełny widok chatu
  return (
    <Card className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 shrink-0">
        <AssistantIcon className="w-10 h-10" isThinking={isLoading} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">Asystent Ścieżki Prawa</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Myślę...' : 'Gotowy do pomocy'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsMinimized(true)}>
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              {message.role === 'assistant' && (
                <AssistantIcon className="w-8 h-8 shrink-0" />
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <AssistantIcon className="w-8 h-8 shrink-0" isThinking />
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Zadaj pytanie..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
