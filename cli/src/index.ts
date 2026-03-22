#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { addCommand } from './commands/add.js'
import { showCommand } from './commands/show.js'
import { linkCommand } from './commands/link.js'
import { unlinkCommand } from './commands/unlink.js'

const program = new Command()
  .name('lore')
  .description('CLI for managing a living-spec knowledge base')
  .version('0.1.0')

program.addCommand(initCommand)
program.addCommand(addCommand)
program.addCommand(showCommand)
program.addCommand(linkCommand)
program.addCommand(unlinkCommand)

program.parse()
