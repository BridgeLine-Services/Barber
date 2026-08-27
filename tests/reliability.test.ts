import { getReliability, getReliabilityLabel } from '../src/lib/reliability'

let passed = 0
let failed = 0
function assert(condition: boolean, message: string) {
  if (condition) { console.log(`  PASS ${message}`); passed++ }
  else { console.error(`  FAIL ${message}`); failed++ }
}

assert(getReliability({ completed: 10, noShows: 0, cancelled: 0 }).band === 'EXCELLENT', 'perfect attendance is excellent')
assert(getReliability({ completed: 8, noShows: 1, cancelled: 1 }).band === 'WATCH', 'a no-show moves the customer to watch')
assert(getReliability({ completed: 0, noShows: 0, cancelled: 0 }).noShowPercentage === 0, 'new customers have zero no-show percentage')
assert(getReliabilityLabel('EXCELLENT') === 'Excellent', 'excellent band has a readable label')
assert(getReliabilityLabel('HIGH_RISK') === 'High Risk', 'high risk band has a readable label')

console.log(`\nReliability tests: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
