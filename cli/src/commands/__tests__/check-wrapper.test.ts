import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
  run(['add', 'term', 'beta', '-n', 'Beta', '-b', 'Second term.'], dir)
  run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)
  run(['add', 'feature', 'my-feat', '-n', 'My Feature', '-b', 'A feature.'], dir)
  run(['link', 'feat:my-feat', 'includes', 'flow:do-stuff'], dir)
  run(['link', 'flow:do-stuff', 'depends-on', 'term:alpha'], dir)

  const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
  const featurePath = join(dir, '.spec', 'features', 'my-feat.md')
  const flow = matter(readFileSync(flowPath, 'utf-8'))
  const feature = matter(readFileSync(featurePath, 'utf-8'))

  writeFileSync(
    flowPath,
    matter.stringify('A flow that uses [[term:alpha]].', flow.data)
  )
  writeFileSync(
    featurePath,
    matter.stringify('A feature that includes [[flow:do-stuff]].', feature.data)
  )
})
afterEach(() => { removeTempDir(dir) })

describe('wrapper validation', { concurrency: false }, () => {
  it('valid wrapper - no warning', () => {
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const featurePath = join(dir, '.spec', 'features', 'my-feat.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    const feature = matter(readFileSync(featurePath, 'utf-8'))
    data.links.push({ edge: 'depends-on', target: 'term:beta' })
    const newContent = content.replace(
      'A flow that uses [[term:alpha]].',
      'A flow that uses [[term:alpha]] and [[term:beta]].'
    )
    writeFileSync(flowPath, matter.stringify(newContent, data))
    const newFeatureContent = feature.content
    writeFileSync(featurePath, matter.stringify(newFeatureContent, feature.data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(!r.stdout.includes('linked but not wrapped'))
    assert.ok(!r.stdout.includes('not linked'))
  })

  it('invalid wrapper - error', () => {
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    const newContent = content + '\n\nSee [[term:nonexistent]] for details.'
    writeFileSync(flowPath, matter.stringify(newContent, data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('invalid ref'))
    assert.ok(r.stdout.includes('term:nonexistent'))
  })

  it('contextual primitive wrapper must use context-qualified form', () => {
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'Billing status.'], dir)

    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    const newContent = content + '\n\nSee [[term:status]] for details.'
    writeFileSync(flowPath, matter.stringify(newContent, data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('invalid ref'))
    assert.ok(r.stdout.includes('term:status'))
  })

  it('linked but not wrapped - warning', () => {
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    data.links.push({ edge: 'depends-on', target: 'term:beta' })
    writeFileSync(flowPath, matter.stringify(content, data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('linked but not wrapped'))
    assert.ok(r.stdout.includes('term:beta'))
  })

  it('not linked in frontmatter - error', () => {
    run(['add', 'term', 'gamma', '-n', 'Gamma', '-b', 'Third term.'], dir)

    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const featurePath = join(dir, '.spec', 'features', 'my-feat.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    const feature = matter(readFileSync(featurePath, 'utf-8'))
    const newContent = content.replace('A flow that uses [[term:alpha]].', 'A flow that uses [[term:alpha]] and [[term:gamma]].')
    writeFileSync(flowPath, matter.stringify(newContent, data))
    const newFeatureContent = feature.content
    writeFileSync(featurePath, matter.stringify(newFeatureContent, feature.data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('not linked'), r.stdout)
    assert.ok(r.stdout.includes('term:gamma'))
  })

  it('bare ref in prose - warning plus blocking mismatch', () => {
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    const newContent = content.replace('A flow that uses [[term:alpha]].', 'A flow that uses term:alpha.')
    writeFileSync(flowPath, matter.stringify(newContent, data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('linked but not wrapped'))
    assert.ok(r.stdout.includes('probable bare ref'))
  })
})
