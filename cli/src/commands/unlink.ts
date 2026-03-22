import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { findPrimitiveById, removeLink } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { requireQualifiedRef, validateEdgeType } from '../lib/validation.js'

export const unlinkCommand = new Command('unlink')
  .description('Remove a typed edge between two primitives')
  .argument('<source>', 'Qualified ref of the source primitive (prefix:slug)')
  .argument('<edge>', 'Edge type (depends-on, constrains, includes, maps-to, emits, triggers)')
  .argument('<target>', 'Qualified ref of the target primitive (prefix:slug)')
  .action((sourceArg: string, edgeArg: string, targetArg: string) => {
    requireQualifiedRef(sourceArg, 'Source')
    requireQualifiedRef(targetArg, 'Target')
    const edge = validateEdgeType(edgeArg)
    const projectRoot = requireProjectRoot()

    const source = findPrimitiveById(projectRoot, sourceArg)
    if (!source) {
      console.error(`Source '${sourceArg}' not found.`)
      process.exit(1)
    }

    const target = findPrimitiveById(projectRoot, targetArg)
    if (!target) {
      console.error(`Target '${targetArg}' not found.`)
      process.exit(1)
    }

    const removed = removeLink(source, edge, targetArg)
    if (!removed) {
      console.error(`No link found: ${sourceArg} → ${edge} → ${targetArg}.`)
      process.exit(1)
    }

    rebuildIndex(projectRoot)

    console.log(`Unlinked ${sourceArg} → ${edge} → ${targetArg}`)
  })
