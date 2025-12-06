'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Clock, Users, CheckCircle2 } from 'lucide-react'

interface SurveyQuestion {
  id: string
  question_text: string
  question_type: 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'yes_no'
  is_required: boolean
  order_index: number
  options?: string[]
}

interface Survey {
  id: string
  title: string
  description?: string
  status: string
  ends_at?: string
  is_anonymous: boolean
  response_count: number
  questions: SurveyQuestion[]
}

interface SurveyViewerProps {
  surveyId: string
  onComplete?: () => void
}

export function SurveyViewer({ surveyId, onComplete }: SurveyViewerProps) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys?surveyId=${surveyId}`)
      const data = await res.json()
      
      if (res.ok) {
        setSurvey(data)
      } else {
        toast.error('Nie udało się pobrać ankiety')
      }
    } catch (error) {
      toast.error('Błąd pobierania ankiety')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const validateAnswers = () => {
    if (!survey) return false

    for (const question of survey.questions) {
      if (question.is_required && !answers[question.id]) {
        toast.error(`Pytanie "${question.question_text}" jest wymagane`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateAnswers()) return

    setSubmitting(true)

    try {
      // Przekształć odpowiedzi do formatu API
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
        const question = survey?.questions.find(q => q.id === questionId)
        
        if (question?.question_type === 'text') {
          return { questionId, answerText: value }
        } else if (question?.question_type === 'rating') {
          return { questionId, ratingValue: value }
        } else if (question?.question_type === 'multiple_choice') {
          return { questionId, selectedOptions: value }
        } else {
          return { questionId, selectedOptions: [value] }
        }
      })

      const res = await fetch('/api/surveys/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          answers: formattedAnswers,
          isAnonymous: survey?.is_anonymous
        })
      })

      if (res.ok) {
        setCompleted(true)
        toast.success('Dziękujemy za udział w ankiecie!')
        onComplete?.()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Nie udało się wysłać odpowiedzi')
      }
    } catch (error) {
      toast.error('Błąd wysyłania ankiety')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Ładowanie ankiety...</div>
        </CardContent>
      </Card>
    )
  }

  if (!survey) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Nie znaleziono ankiety</div>
        </CardContent>
      </Card>
    )
  }

  if (completed) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Dziękujemy za udział!</h3>
          <p className="text-muted-foreground">Twoja odpowiedź została zapisana.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        {survey.description && (
          <CardDescription>{survey.description}</CardDescription>
        )}
        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{survey.response_count} odpowiedzi</span>
          </div>
          {survey.ends_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Do {new Date(survey.ends_at).toLocaleDateString('pl-PL')}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {survey.questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">
              {index + 1}. {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {question.question_type === 'single_choice' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                    <Label htmlFor={`${question.id}-${idx}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.question_type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-${idx}`}
                      checked={(answers[question.id] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const current = answers[question.id] || []
                        const updated = checked
                          ? [...current, option]
                          : current.filter((o: string) => o !== option)
                        handleAnswerChange(question.id, updated)
                      }}
                    />
                    <Label htmlFor={`${question.id}-${idx}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {question.question_type === 'yes_no' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Tak" id={`${question.id}-yes`} />
                  <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer">Tak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nie" id={`${question.id}-no`} />
                  <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer">Nie</Label>
                </div>
              </RadioGroup>
            )}

            {question.question_type === 'text' && (
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Twoja odpowiedź..."
                rows={4}
              />
            )}

            {question.question_type === 'rating' && (
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                className="flex gap-2"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex flex-col items-center">
                    <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                    <Label htmlFor={`${question.id}-${rating}`} className="text-xs mt-1 cursor-pointer">
                      {rating}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Wysyłanie...' : 'Wyślij odpowiedzi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
