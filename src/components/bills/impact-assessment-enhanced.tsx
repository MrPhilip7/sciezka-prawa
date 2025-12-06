'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Briefcase, 
  Scale,
  Leaf,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ImpactAssessmentViewerProps {
  impactData: any // Would be typed from ImpactAssessmentDetailed
  impactUrl?: string
}

export function ImpactAssessmentViewer({ impactData, impactUrl }: ImpactAssessmentViewerProps) {
  if (!impactData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Ocena Skutków Regulacji nie jest jeszcze dostępna
          </p>
          {impactUrl && (
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <a href={impactUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Sprawdź na stronie RCL
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {impactData.summary && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Podsumowanie OSR:</strong> {impactData.summary}
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Impact */}
      {impactData.financialImpact && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>Wpływ Finansowy</CardTitle>
            </div>
            <CardDescription>
              Szacowane skutki ekonomiczne regulacji
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Public Budget */}
            {impactData.financialImpact.publicBudget && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Budżet Państwa</h4>
                  <Badge variant={impactData.financialImpact.publicBudget.amount < 0 ? 'destructive' : 'default'}>
                    {formatCurrency(impactData.financialImpact.publicBudget.amount)} {impactData.financialImpact.publicBudget.currency}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {impactData.financialImpact.publicBudget.description}
                </p>
                {impactData.financialImpact.publicBudget.timeframe && (
                  <p className="text-xs text-muted-foreground">
                    Okres: {impactData.financialImpact.publicBudget.timeframe}
                  </p>
                )}
              </div>
            )}

            {/* Citizens Impact */}
            {impactData.financialImpact.citizensImpact && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <h4 className="font-semibold text-sm">Wpływ na Obywateli</h4>
                  </div>
                  <Badge variant={impactData.financialImpact.citizensImpact.amount < 0 ? 'destructive' : 'default'}>
                    {formatCurrency(impactData.financialImpact.citizensImpact.amount)} PLN
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {impactData.financialImpact.citizensImpact.description}
                </p>
                {impactData.financialImpact.citizensImpact.affectedCount && (
                  <p className="text-xs text-muted-foreground">
                    Dotyczy około {impactData.financialImpact.citizensImpact.affectedCount.toLocaleString('pl-PL')} osób
                  </p>
                )}
              </div>
            )}

            {/* Business Impact */}
            {impactData.financialImpact.businessesImpact && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <h4 className="font-semibold text-sm">Wpływ na Przedsiębiorców</h4>
                  </div>
                  <Badge variant={impactData.financialImpact.businessesImpact.amount < 0 ? 'destructive' : 'default'}>
                    {formatCurrency(impactData.financialImpact.businessesImpact.amount)} PLN
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {impactData.financialImpact.businessesImpact.description}
                </p>
                {impactData.financialImpact.businessesImpact.affectedSectors && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {impactData.financialImpact.businessesImpact.affectedSectors.map((sector: string) => (
                      <Badge key={sector} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Total Impact */}
            {impactData.financialImpact.total !== undefined && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">Całkowity Wpływ Finansowy</h4>
                  <div className="flex items-center gap-2">
                    {impactData.financialImpact.total < 0 ? (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    <span className="text-xl font-bold">
                      {formatCurrency(impactData.financialImpact.total)} PLN
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social Impact */}
      {impactData.socialImpact && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>Wpływ Społeczny</CardTitle>
            </div>
            <CardDescription>
              Skutki dla różnych grup społecznych
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Affected Groups */}
            {impactData.socialImpact.affectedGroups && impactData.socialImpact.affectedGroups.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Grupy Dotkniętych:</h4>
                <div className="flex gap-2 flex-wrap">
                  {impactData.socialImpact.affectedGroups.map((group: string) => (
                    <Badge key={group} variant="secondary">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {impactData.socialImpact.description && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm">{impactData.socialImpact.description}</p>
              </div>
            )}

            {/* Positive Effects */}
            {impactData.socialImpact.positiveEffects && impactData.socialImpact.positiveEffects.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-600">Pozytywne Skutki:</h4>
                <ul className="space-y-1 ml-4">
                  {impactData.socialImpact.positiveEffects.map((effect: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {effect}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative Effects */}
            {impactData.socialImpact.negativeEffects && impactData.socialImpact.negativeEffects.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-red-600">Potencjalne Ryzyka:</h4>
                <ul className="space-y-1 ml-4">
                  {impactData.socialImpact.negativeEffects.map((effect: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      {effect}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Equity Assessment */}
            {impactData.socialImpact.equityAssessment && (
              <Alert>
                <Scale className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ocena równości:</strong> {impactData.socialImpact.equityAssessment}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Economic Impact */}
      {impactData.economicImpact && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <CardTitle>Wpływ Gospodarczy</CardTitle>
            </div>
            <CardDescription>
              Makroekonomiczne skutki regulacji
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {impactData.economicImpact.gdpEffect && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Wpływ na PKB:</span>
                <Badge>{impactData.economicImpact.gdpEffect}</Badge>
              </div>
            )}

            {impactData.economicImpact.employmentEffect && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Wpływ na Zatrudnienie:</span>
                <Badge>{impactData.economicImpact.employmentEffect}</Badge>
              </div>
            )}

            {impactData.economicImpact.competitivenessEffect && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Konkurencyjność:</span>
                <Badge>{impactData.economicImpact.competitivenessEffect}</Badge>
              </div>
            )}

            {impactData.economicImpact.description && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{impactData.economicImpact.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Environmental Impact */}
      {impactData.environmentalImpact && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <CardTitle>Wpływ Środowiskowy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {impactData.environmentalImpact.climateEffect && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Wpływ na Klimat:</span>
                <Badge>{impactData.environmentalImpact.climateEffect}</Badge>
              </div>
            )}

            {impactData.environmentalImpact.biodiversityEffect && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Różnorodność Biologiczna:</span>
                <Badge>{impactData.environmentalImpact.biodiversityEffect}</Badge>
              </div>
            )}

            {impactData.environmentalImpact.resourceUsage && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Zużycie Zasobów:</span>
                <Badge>{impactData.environmentalImpact.resourceUsage}</Badge>
              </div>
            )}

            {impactData.environmentalImpact.description && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{impactData.environmentalImpact.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legal Impact */}
      {impactData.legalImpact && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              <CardTitle>Wpływ Prawny i Administracyjny</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {impactData.legalImpact.conflictingRegulations && impactData.legalImpact.conflictingRegulations.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Konfliktujące Regulacje:</h4>
                <ul className="space-y-1 ml-4">
                  {impactData.legalImpact.conflictingRegulations.map((reg: string, idx: number) => (
                    <li key={idx} className="text-sm">{reg}</li>
                  ))}
                </ul>
              </div>
            )}

            {impactData.legalImpact.administrativeBurden && (
              <div className="p-3 border rounded-lg">
                <span className="text-sm font-medium">Obciążenia Administracyjne: </span>
                <span className="text-sm">{impactData.legalImpact.administrativeBurden}</span>
              </div>
            )}

            {impactData.legalImpact.simplificationPotential && (
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/10">
                <span className="text-sm font-medium">Potencjał Uproszczenia: </span>
                <span className="text-sm">{impactData.legalImpact.simplificationPotential}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {impactData.recommendations && impactData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rekomendacje</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {impactData.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* External Link */}
      {impactUrl && (
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <a href={impactUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Zobacz pełny dokument OSR
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}

function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  
  if (absAmount >= 1_000_000_000) {
    return `${sign}${(absAmount / 1_000_000_000).toFixed(2)} mld`
  } else if (absAmount >= 1_000_000) {
    return `${sign}${(absAmount / 1_000_000).toFixed(2)} mln`
  } else if (absAmount >= 1_000) {
    return `${sign}${(absAmount / 1_000).toFixed(0)} tys.`
  }
  
  return `${sign}${absAmount.toLocaleString('pl-PL')}`
}
