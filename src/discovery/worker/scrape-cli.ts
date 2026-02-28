import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { runHuettenScraper } from './scrape-runner'

/**
 * Parse a URL file: one URL per line, ignoring empty lines and #-comments.
 */
function parseUrlFile(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8')
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      file: {
        type: 'string',
        short: 'f',
      },
      'dry-run': {
        type: 'boolean',
        short: 'd',
        default: false,
      },
    },
    strict: true,
  })

  const filePath = values.file
  const dryRun = values['dry-run'] ?? false

  if (!filePath) {
    console.error('Error: You must provide --file with a path to a URL file.')
    console.error('')
    console.error('Usage:')
    console.error('  npx tsx src/discovery/worker/scrape-cli.ts --file data/huetten-urls.txt')
    console.error('  npx tsx src/discovery/worker/scrape-cli.ts --file data/huetten-urls.txt --dry-run')
    process.exit(1)
  }

  // Parse URLs
  let urls: string[]
  try {
    urls = parseUrlFile(filePath)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error reading file: ${message}`)
    process.exit(1)
  }

  if (urls.length === 0) {
    console.error('No URLs found in the file. Add one URL per line.')
    process.exit(1)
  }

  console.log('=== Hütten Scraper ===')
  console.log(`File:    ${filePath}`)
  console.log(`URLs:    ${urls.length}`)
  console.log(`Dry run: ${dryRun}`)
  console.log('======================')
  console.log('')

  const stats = await runHuettenScraper({ urls, dryRun })

  console.log('')
  console.log('=== Scraper Complete ===')
  console.log(`Created:  ${stats.newCandidates}`)
  console.log(`Skipped:  ${stats.duplicatesSkipped}`)
  console.log(`Errors:   ${stats.errorCount}`)
  console.log('========================')

  process.exit(stats.errorCount > 0 && stats.newCandidates === 0 ? 1 : 0)
}

main()
