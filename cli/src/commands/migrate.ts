import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { runMigrations, MIGRATIONS } from '../lib/migrations.js'

export const migrateCommand = new Command('migrate')
  .description('Run pending spec migrations')
  .option('--confirm <version>', 'confirm the next pending manual migration version')
  .action(async function () {
    const projectRoot = requireProjectRoot()
    const { confirm } = this.opts<{ confirm?: string }>()

    try {
      await runMigrations(projectRoot, MIGRATIONS, confirm)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`error: ${message}`)
      process.exit(1)
    }
  })
