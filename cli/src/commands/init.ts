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
    console.log('')
    console.log('Add the following to your LLM agent config (CLAUDE.md, .cursorrules, etc.):')
    console.log('')
    console.log('--- copy below this line ---')
    console.log('')
    console.log('This project uses a Living Spec — a structured domain knowledge base in `.spec/`.')
    console.log('Before implementing any feature or behavior change:')
    console.log('')
    console.log('1. Read `.spec/SPEC.md` for the full meta-model and workflow instructions')
    console.log('2. Read `.spec/INDEX.md` for the current graph of all defined primitives')
    console.log('3. Identify the Feature you are implementing and traverse its dependencies')
    console.log('4. If any referenced primitive is missing or incomplete — stop and ask, do not guess')
    console.log('5. Propose spec updates and wait for confirmation before writing any code')
    console.log('')
    console.log('When reviewing code, verify that implementation matches the spec (flows, invariants, rules)')
    console.log('and that no undocumented behavior exists without a corresponding primitive.')
    console.log('')
    console.log('Use the `lore` CLI to query and update the spec. See `.spec/SPEC.md` for the full command reference.')
    console.log('')
    console.log('--- copy above this line ---')
  })
