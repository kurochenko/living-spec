import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- inv:unique-primitive-id ---

describe('inv:unique-primitive-id', () => {
  it('duplicate slug within same type is rejected', () => {
    run(['add', 'term', 'foo', '-n', 'Foo', '-b', 'A foo.'], dir)
    const r = run(['add', 'term', 'foo', '-n', 'Foo Again', '-b', 'Another foo.'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes("term:foo"))
    assert.ok(r.stderr.includes('already exists'))
  })

  it('same slug in different type succeeds', () => {
    run(['add', 'term', 'foo', '-n', 'Foo Term', '-b', 'A term.'], dir)
    const r = run(['add', 'flow', 'foo', '-n', 'Foo Flow', '-b', 'A flow.'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(existsSync(join(dir, '.spec', 'terms', 'foo.md')))
    assert.ok(existsSync(join(dir, '.spec', 'flows', 'foo.md')))
  })

  it('error message contains qualified id and path', () => {
    run(['add', 'term', 'bar', '-n', 'Bar', '-b', 'A bar.'], dir)
    const r = run(['add', 'term', 'bar', '-n', 'Bar Again', '-b', 'Another bar.'], dir)
    assert.ok(r.stderr.includes('term:bar'))
    assert.ok(r.stderr.includes('.spec/terms/bar.md'))
  })
})

// --- flow:add-primitive ---

describe('flow:add-primitive', () => {
  it('happy path creates file with correct frontmatter and body', () => {
    const r = run(['add', 'term', 'my-term', '-n', 'My Term', '-b', 'The definition.'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Created term:my-term'))

    const filePath = join(dir, '.spec', 'terms', 'my-term.md')
    assert.ok(existsSync(filePath))

    const { data, content } = matter(readFileSync(filePath, 'utf-8'))
    assert.equal(data.type, 'term')
    assert.equal(data.name, 'My Term')
    assert.equal(data.id, 'my-term')
    assert.ok(content.includes('The definition.'))
  })

  it('--body-file reads body from file', () => {
    const bodyPath = join(dir, 'body.md')
    writeFileSync(bodyPath, 'Multi-line\nbody content.')
    const r = run(['add', 'term', 'from-file', '-n', 'From File', '--body-file', bodyPath], dir)
    assert.equal(r.exitCode, 0)

    const filePath = join(dir, '.spec', 'terms', 'from-file.md')
    const { content } = matter(readFileSync(filePath, 'utf-8'))
    assert.ok(content.includes('Multi-line'))
    assert.ok(content.includes('body content.'))
  })

  it('missing -n exits with error', () => {
    const r = run(['add', 'term', 'no-name', '-b', 'body'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('--name'))
  })

  it('missing -b and --body-file exits with error', () => {
    const r = run(['add', 'term', 'no-body', '-n', 'No Body'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('Body is required'))
  })

  it('invalid type exits with error', () => {
    const r = run(['add', 'foobar', 'my-id', '-n', 'N', '-b', 'b'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('Invalid type'))
  })

  it('invalid slug exits with error', () => {
    const r = run(['add', 'term', 'NotKebab', '-n', 'N', '-b', 'b'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('kebab-case'))
  })

  it('index is rebuilt after add', () => {
    run(['add', 'term', 'indexed', '-n', 'Indexed', '-b', 'A thing.'], dir)
    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(index.includes('term:indexed'))
  })
})

describe('context-qualified refs', () => {
  it('add -c creates {context}.{slug}.md file', () => {
    const r = run(['add', 'term', 'status', '-n', 'Status', '-c', 'billing', '-b', 'A status.'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('billing.term:status'))
    assert.ok(r.stdout.includes('.spec/terms/billing.status.md'))

    const filePath = join(dir, '.spec', 'terms', 'billing.status.md')
    assert.ok(existsSync(filePath))

    const { data } = matter(readFileSync(filePath, 'utf-8'))
    assert.equal(data.type, 'term')
    assert.equal(data.id, 'status')
    assert.equal(data.context, 'billing')
  })

  it('add -c duplicate within same (type, context, slug) is rejected', () => {
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'A status.'], dir)
    const r = run(['add', 'term', 'status', '-n', 'Billing Status Again', '-c', 'billing', '-b', 'Another status.'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('billing.term:status'))
    assert.ok(r.stderr.includes('already exists'))
  })

  it('same slug in different contexts can coexist', () => {
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'A status.'], dir)
    const r = run(['add', 'term', 'status', '-n', 'Recipe Status', '-c', 'recipe', '-b', 'A status.'], dir)
    assert.equal(r.exitCode, 0)

    assert.ok(existsSync(join(dir, '.spec', 'terms', 'billing.status.md')))
    assert.ok(existsSync(join(dir, '.spec', 'terms', 'recipe.status.md')))
  })

  it('non-contexted and contexted with same slug can coexist', () => {
    run(['add', 'term', 'status', '-n', 'Shared Status', '-b', 'A status.'], dir)
    const r = run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'A status.'], dir)
    assert.equal(r.exitCode, 0)

    assert.ok(existsSync(join(dir, '.spec', 'terms', 'status.md')))
    assert.ok(existsSync(join(dir, '.spec', 'terms', 'billing.status.md')))
  })
})
