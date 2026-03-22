import { Command } from 'commander'
import { isValidEdge } from '../lib/constants.js'
import { requireProjectRoot } from '../lib/spec-root.js'
import { findPrimitiveById, addLink } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { requireQualifiedRef, validateEdgeType } from '../lib/validation.js'

export const linkCommand = new Command('link')
  .description('Add a typed edge between two primitives')
  .argument('<source>', 'Qualified ref of the source primitive (prefix:slug)')
  .argument('<edge>', 'Edge type (depends-on, constrains, includes, maps-to, emits, triggers)')
  .argument('<target>', 'Qualified ref of the target primitive (prefix:slug)')
  .action((sourceArg: string, edgeArg: string, targetArg: string) => {
    const sourceRef = requireQualifiedRef(sourceArg, 'Source')
    const targetRef = requireQualifiedRef(targetArg, 'Target')
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

    if (!isValidEdge(edge, sourceRef.type, targetRef.type)) {
      console.error(`Edge '${edge}' is not allowed from ${sourceRef.type} to ${targetRef.type}.`)
      process.exit(1)
    }

    const duplicate = source.frontmatter.links.some(
      (l) => l.edge === edge && l.target === targetArg
    )
    if (duplicate) {
      console.error(`Link already exists: ${sourceArg} → ${edge} → ${targetArg}.`)
      process.exit(1)
    }

    addLink(source, edge, targetArg)
    rebuildIndex(projectRoot)

    console.log(`Linked ${sourceArg} → ${edge} → ${targetArg}`)
  })
