#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { addCommand } from './commands/add.js'
import { showCommand } from './commands/show.js'
import { linkCommand } from './commands/link.js'
import { unlinkCommand } from './commands/unlink.js'
import { reindexCommand } from './commands/reindex.js'
import { rmCommand } from './commands/rm.js'
import { listCommand } from './commands/list.js'
import { deprecateCommand } from './commands/deprecate.js'
import { checkCommand } from './commands/check.js'
import { renameCommand } from './commands/rename.js'

const program = new Command()
  .name('lore')
  .description('CLI for managing a living-spec knowledge base')
  .version('0.1.0')

program.addCommand(initCommand)
program.addCommand(addCommand)
program.addCommand(showCommand)
program.addCommand(linkCommand)
program.addCommand(unlinkCommand)
program.addCommand(reindexCommand)
program.addCommand(rmCommand)
program.addCommand(listCommand)
program.addCommand(deprecateCommand)
program.addCommand(checkCommand)
program.addCommand(renameCommand)

program.parse()
