import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
})
afterEach(() => { removeTempDir(dir) })

describe('feat:cli-context', () => {
  it('context init creates a context overview from the template', () => {
    const r = run(['context', 'init', 'billing', '-n', 'Billing'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes("Created context overview 'billing'"))

    const filePath = join(dir, '.spec', 'contexts', 'billing.md')
    assert.ok(existsSync(filePath))

    const content = readFileSync(filePath, 'utf-8')
    assert.ok(content.includes('name: Billing'))
    assert.ok(content.includes('**Purpose:**'))
    assert.ok(content.includes('**Boundaries:**'))
  })

  it('context show prints overview and derived primitive membership', () => {
    run(['context', 'init', 'billing', '-n', 'Billing'], dir)
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'Billing status.'], dir)
    run(['add', 'flow', 'charge-invoice', '-n', 'Charge Invoice', '-c', 'billing', '-b', 'Charge an invoice.'], dir)

    const overviewPath = join(dir, '.spec', 'contexts', 'billing.md')
    const content = readFileSync(overviewPath, 'utf-8').replace('**Purpose:**', '**Purpose:**\n\nBilling owns [[billing.term:status]].')
    writeFileSync(overviewPath, content)

    const r = run(['context', 'show', 'billing'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('context: Billing [billing]'))
    assert.ok(r.stdout.includes('Billing owns [[billing.term:status]].'))
    assert.ok(r.stdout.includes('Derived membership:'))
    assert.ok(r.stdout.includes('billing.term:status  Billing Status'))
    assert.ok(r.stdout.includes('billing.flow:charge-invoice  Charge Invoice'))
  })

  it('context show exits when overview is missing', () => {
    const r = run(['context', 'show', 'billing'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes("Context overview 'billing' not found"))
  })

  it('context show exits on invalid wrapped refs', () => {
    run(['context', 'init', 'billing', '-n', 'Billing'], dir)
    const overviewPath = join(dir, '.spec', 'contexts', 'billing.md')
    const content = readFileSync(overviewPath, 'utf-8').replace('**Purpose:**', '**Purpose:**\n\nBilling uses [[term:missing]].')
    writeFileSync(overviewPath, content)

    const r = run(['context', 'show', 'billing'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes("Invalid wrapped ref '[[term:missing]]'"))
  })
})
