import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => { dir = createTempDir() })
afterEach(() => { removeTempDir(dir) })

// --- inv:single-spec-per-project ---

describe('inv:single-spec-per-project', () => {
  it('init creates .spec/ with SPEC.md and INDEX.md', () => {
    const r = run(['init'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(existsSync(join(dir, '.spec', 'SPEC.md')))
    assert.ok(existsSync(join(dir, '.spec', 'INDEX.md')))
  })

  it('init where .spec/ exists is a noop', () => {
    run(['init'], dir)
    const specBefore = readFileSync(join(dir, '.spec', 'SPEC.md'), 'utf-8')
    const r = run(['init'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('.spec/ already exists'))
    const specAfter = readFileSync(join(dir, '.spec', 'SPEC.md'), 'utf-8')
    assert.equal(specBefore, specAfter)
  })
})

// --- flow:init-spec ---

describe('flow:init-spec', () => {
  it('creates all 8 type folders and templates/ inside .spec/', () => {
    run(['init'], dir)
    const specDir = join(dir, '.spec')
    const expectedFolders = [
      'templates', 'terms', 'invariants', 'rules', 'events',
      'flows', 'contracts', 'decisions', 'features',
    ]
    for (const folder of expectedFolders) {
      assert.ok(existsSync(join(specDir, folder)), `Missing folder: ${folder}`)
    }
  })

  it('SPEC.md and INDEX.md have correct headers', () => {
    run(['init'], dir)
    const spec = readFileSync(join(dir, '.spec', 'SPEC.md'), 'utf-8')
    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(spec.startsWith('# Living System Specification'))
    assert.ok(index.startsWith('# Spec Index'))
  })

  it('already-exists is noop with exit 0', () => {
    run(['init'], dir)
    const r = run(['init'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('.spec/ already exists'))
  })

  it('prints agent integration prompt snippet after init', () => {
    const r = run(['init'], dir)
    assert.ok(r.stdout.includes('Add the following to your LLM agent config'))
    assert.ok(r.stdout.includes('lore show'))
    assert.ok(r.stdout.includes('lore check'))
    assert.ok(r.stdout.includes('.spec/SPEC.md'))
  })

  it('does not print prompt snippet when .spec/ already exists', () => {
    run(['init'], dir)
    const r = run(['init'], dir)
    assert.ok(!r.stdout.includes('Add the following to your LLM agent config'))
  })
})
