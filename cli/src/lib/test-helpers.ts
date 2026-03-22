import { mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { execFileSync } from 'child_process'

const CLI_PATH = join(import.meta.dirname, '..', '..', 'dist', 'index.js')

export const createTempDir = (): string =>
  mkdtempSync(join(tmpdir(), 'lore-test-'))

export const removeTempDir = (dir: string): void =>
  rmSync(dir, { recursive: true, force: true })

export interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
}

export const run = (args: string[], cwd: string): RunResult => {
  try {
    const stdout = execFileSync('node', [CLI_PATH, ...args], {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return { stdout: stdout.trim(), stderr: '', exitCode: 0 }
  } catch (err: unknown) {
    const e = err as { stdout?: string, stderr?: string, status?: number }
    return {
      stdout: (e.stdout ?? '').trim(),
      stderr: (e.stderr ?? '').trim(),
      exitCode: e.status ?? 1,
    }
  }
}
