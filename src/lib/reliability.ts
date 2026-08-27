export type ReliabilityBand = 'EXCELLENT' | 'GOOD' | 'WATCH' | 'HIGH_RISK'

export interface ReliabilityInput {
  completed: number
  cancelled: number
  noShows: number
  highRiskThreshold?: number
}

export function getReliability(input: ReliabilityInput) {
  const total = input.completed + input.cancelled + input.noShows
  const noShowRate = total ? input.noShows / total : 0
  const threshold = input.highRiskThreshold ?? 2
  let band: ReliabilityBand = 'EXCELLENT'
  if (input.noShows >= threshold || noShowRate >= 0.25) band = 'HIGH_RISK'
  else if (input.noShows > 0 || noShowRate >= 0.1) band = 'WATCH'
  else if (input.cancelled > 0) band = 'GOOD'
  return { band, total, noShowRate, noShowPercentage: Math.round(noShowRate * 100) }
}

export function getReliabilityLabel(band: ReliabilityBand) {
  return { EXCELLENT: 'Excellent', GOOD: 'Good', WATCH: 'Watch', HIGH_RISK: 'High Risk' }[band]
}

export function getReliabilityTone(band: ReliabilityBand) {
  return { EXCELLENT: 'success', GOOD: 'default', WATCH: 'warning', HIGH_RISK: 'destructive' }[band]
}

export function getReliabilitySummary(input: ReliabilityInput) {
  const result = getReliability(input)
  return { ...result, label: getReliabilityLabel(result.band), tone: getReliabilityTone(result.band) }
}

export default getReliability

// Kept pure so it can be shared by API responses, dashboard UI, and tests.
void getReliabilitySummary
