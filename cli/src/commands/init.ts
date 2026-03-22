import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { Command } from 'commander'
import { SPEC_DIR, SPEC_MARKER, TYPE_TO_FOLDER, PRIMITIVE_TYPES } from '../lib/constants.js'
import { specContent } from '../lib/seed/spec.js'
import { indexContent } from '../lib/seed/index-seed.js'
import { templateContents } from '../lib/seed/templates.js'

export const initCommand = new Command('init')
  .description('Initialize a living-spec in the current directory')
  .option('-d, --dir <path>', 'Directory to initialize in', '.')
  .action((opts: { dir: string }) => {
    const projectRoot = resolve(opts.dir)

    if (existsSync(join(projectRoot, SPEC_MARKER))) {
      console.log(`.spec/ already exists at ${projectRoot}`)
      return
    }

    const spec = join(projectRoot, SPEC_DIR)

    // create .spec/ with templates dir
    mkdirSync(join(spec, 'templates'), { recursive: true })

    // create primitive folders inside .spec/
    for (const type of PRIMITIVE_TYPES) {
      const folder = join(spec, TYPE_TO_FOLDER[type])
      mkdirSync(folder, { recursive: true })
      writeFileSync(join(folder, '.gitkeep'), '')
    }

    // write seed files
    writeFileSync(join(spec, 'SPEC.md'), specContent)
    writeFileSync(join(spec, 'INDEX.md'), indexContent)

    // write templates
    for (const type of PRIMITIVE_TYPES) {
      writeFileSync(join(spec, 'templates', `${type}.md`), templateContents[type])
    }

    console.log(`Initialized .spec/ at ${projectRoot}`)
  })
