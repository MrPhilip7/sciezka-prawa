'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Leaf, 
  Scale,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FinancialImpact {
  publicBudget?: number
  citizens?: number
  businesses?: number
  description?: string
}

interface SocialImpact {
  affectedGroups?: string[]
  description?: string
  estimatedBeneficiaries?: number
}

interface EconomicImpact {
  gdpEffect?: 'positive' | 'negative' | 'neutral'
  employmentEffect?: 'positive' | 'negative' | 'neutral'
  description?: string
}

interface ImpactAssessmentData {
  url?: string
  summary?: string
  financialImpact?: FinancialImpact
  socialImpact?: SocialImpact
  economicImpact?: EconomicImpact
  environmentalImpact?: string
  legalImpact?: string
  lastUpdated?: string
}

interface ImpactAssessmentViewerProps {
  data: ImpactAssessmentData
  billTitle?: string
}

export function ImpactAssessmentViewer({ data, billTitle }: ImpactAssessmentViewerProps) {
  const hasData = data.financialImpact || data.socialImpact || data.economicImpact || 
                  data.environmentalImpact || data.legalImpact

  if (!hasData && !data.url) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ocena Skutków Regulacji (OSR)
            </CardTitle>
            <CardDescription>
              Przewidywane skutki wprowadzenia ustawy
            </CardDescription>
          </div>
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Pełny dokument
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        {data.summary && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{data.summary}</p>
            </div>
          </div>
        )}

        {/* Financial Impact */}
        {data.financialImpact && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold">Skutki finansowe</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {data.financialImpact.publicBudget !== undefined && (
                <ImpactCard
                  label="Budżet państwa"
                  value={formatCurrency(data.financialImpact.publicBudget)}
                  trend={data.financialImpact.publicBudget > 0 ? 'up' : data.financialImpact.publicBudget < 0 ? 'down' : 'neutral'}
                />
              )}
              {data.financialImpact.citizens !== undefined && (
                <ImpactCard
                  label="Obywatele"
                  value={formatCurrency(data.financialImpact.citizens)}
                  trend={data.financialImpact.citizens > 0 ? 'up' : data.financialImpact.citizens < 0 ? 'down' : 'neutral'}
                />
              )}
              {data.financialImpact.businesses !== undefined && (
                <ImpactCard
                  label="Przedsiębiorstwa"
                  value={formatCurrency(data.financialImpact.businesses)}
                  trend={data.financialImpact.businesses > 0 ? 'up' : data.financialImpact.businesses < 0 ? 'down' : 'neutral'}
                />
              )}
            </div>
            {data.financialImpact.description && (
              <p className="text-sm text-muted-foreground">{data.financialImpact.description}</p>
            )}
          </div>
        )}

        {data.financialImpact && data.socialImpact && <Separator />}

        {/* Social Impact */}
        {data.socialImpact && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold">Skutki społeczne</h3>
            </div>
            {data.socialImpact.estimatedBeneficiaries && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base">
                  ~{formatNumber(data.socialImpact.estimatedBeneficiaries)} osób
                </Badge>
                <span className="text-sm text-muted-foreground">przewidywanych beneficjentów</span>
              </div>
            )}
            {data.socialImpact.affectedGroups && data.socialImpact.affectedGroups.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Dotknięte grupy:</p>
                <div className="flex flex-wrap gap-2">
                  {data.socialImpact.affectedGroups.map((group, i) => (
                    <Badge key={i} variant="outline">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {data.socialImpact.description && (
              <p className="text-sm text-muted-foreground">{data.socialImpact.description}</p>
            )}
          </div>
        )}

        {(data.socialImpact && data.economicImpact) && <Separator />}

        {/* Economic Impact */}
        {data.economicImpact && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold">Skutki gospodarcze</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {data.economicImpact.gdpEffect && (
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Wpływ na PKB</span>
                  <EffectBadge effect={data.economicImpact.gdpEffect} />
                </div>
              )}
              {data.economicImpact.employmentEffect && (
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Wpływ na zatrudnienie</span>
                  <EffectBadge effect={data.economicImpact.employmentEffect} />
                </div>
              )}
            </div>
            {data.economicImpact.description && (
              <p className="text-sm text-muted-foreground">{data.economicImpact.description}</p>
            )}
          </div>
        )}

        {((data.economicImpact && data.environmentalImpact) || (data.socialImpact && data.environmentalImpact)) && <Separator />}

        {/* Environmental Impact */}
        {data.environmentalImpact && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold">Skutki środowiskowe</h3>
            </div>
            <p className="text-sm text-muted-foreground">{data.environmentalImpact}</p>
          </div>
        )}

        {data.environmentalImpact && data.legalImpact && <Separator />}

        {/* Legal Impact */}
        {data.legalImpact && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold">Skutki prawne</h3>
            </div>
            <p className="text-sm text-muted-foreground">{data.legalImpact}</p>
          </div>
        )}

        {/* Last Updated */}
        {data.lastUpdated && (
          <p className="text-xs text-muted-foreground text-center pt-4">
            Ostatnia aktualizacja: {new Date(data.lastUpdated).toLocaleDateString('pl-PL')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ImpactCard({ 
  label, 
  value, 
  trend 
}: { 
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-lg font-semibold",
          trend === 'up' && "text-green-600 dark:text-green-400",
          trend === 'down' && "text-red-600 dark:text-red-400"
        )}>
          {value}
        </span>
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
      </div>
    </div>
  )
}

function EffectBadge({ effect }: { effect: 'positive' | 'negative' | 'neutral' }) {
  const config = {
    positive: { label: 'Pozytywny', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    negative: { label: 'Negatywny', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    neutral: { label: 'Neutralny', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  }
  
  const { label, className } = config[effect]
  
  return <Badge className={className}>{label}</Badge>
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : '+'
  
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)} mld zł`
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)} mln zł`
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(0)} tys. zł`
  }
  return `${sign}${absValue} zł`
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} mln`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} tys.`
  }
  return value.toString()
}
