import { parseArgs } from 'node:util'
import { runDiscovery } from '@/discovery/worker/runner'

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      preset: {
        type: 'string',
        short: 'p',
      },
      country: {
        type: 'string',
        short: 'c',
      },
      limit: {
        type: 'string',
        short: 'l',
        default: '100',
      },
      'dry-run': {
        type: 'boolean',
        short: 'd',
        default: false,
      },
    },
    strict: true,
  })

  const preset = values.preset
  const country = values.country
  const limit = parseInt(values.limit ?? '100', 10)
  const dryRun = values['dry-run'] ?? false

  // Validation
  if (!preset && !country) {
    console.error('Error: You must provide either --preset or --country.')
    console.error('')
    console.error('Usage:')
    console.error('  npx tsx src/discovery/worker/cli.ts --preset south-tyrol')
    console.error('  npx tsx src/discovery/worker/cli.ts --country AT --limit 50')
    console.error('  npx tsx src/discovery/worker/cli.ts --preset tyrol --dry-run')
    console.error('')
    console.error('Options:')
    console.error('  --preset, -p   Region preset key (e.g., south-tyrol, tyrol, salzburg)')
    console.error('  --country, -c  Country code (AT, CH, DE, IT)')
    console.error('  --limit, -l    Max candidates to process (default: 100)')
    console.error('  --dry-run, -d  Run without writing to database')
    process.exit(1)
  }

  if (isNaN(limit) || limit <= 0) {
    console.error('Error: --limit must be a positive number.')
    process.exit(1)
  }

  console.log('=== Stille Orte Discovery Engine ===')
  console.log(`Preset:  ${preset ?? '(all for country)'}`)
  console.log(`Country: ${country ?? '(from preset)'}`)
  console.log(`Limit:   ${limit}`)
  console.log(`Dry run: ${dryRun}`)
  console.log('==============================')
  console.log('')

  try {
    const stats = await runDiscovery({
      preset,
      country,
      limit,
      dryRun,
    })

    console.log('')
    console.log('=== Discovery Complete ===')
    console.log(`Candidates found:   ${stats.candidatesFound}`)
    console.log(`New candidates:     ${stats.newCandidates}`)
    console.log(`Duplicates skipped: ${stats.duplicatesSkipped}`)
    console.log(`Errors:             ${stats.errors}`)
    console.log('==========================')

    process.exit(0)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Fatal error: ${message}`)
    process.exit(1)
  }
}

main()
