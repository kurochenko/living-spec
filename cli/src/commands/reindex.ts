import { Command } from 'commander'
import { requireProjectRoot } from '../lib/require-with-migration.js'
import { rebuildIndex } from '../lib/index-builder.js'

export const reindexCommand = new Command('reindex')
  .description('Rebuild INDEX.md from all primitive files on disk')
  .action(() => {
    const projectRoot = requireProjectRoot()
    rebuildIndex(projectRoot)
    console.log('INDEX.md rebuilt.')
  })
