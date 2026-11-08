import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
test(
  'Built UI and API: synthetic PDF, tri-state rules, exports and input errors',
  { timeout: 20000 },
  async (t) => {
    const server = spawn(
      process.execPath,
      [fileURLToPath(new URL('../src/server.js', import.meta.url))],
      {
        env: { ...process.env, PORT: '0', LLM_PROVIDER: 'ollama' },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    )
    t.after(async () => {
      if (server.exitCode === null && server.signalCode === null) {
        const exit = once(server, 'exit')
        server.kill()
        await exit
      }
    })
    const url = await new Promise((resolve, reject) => {
      let log = ''
      server.stdout.on('data', (s) => {
        log += s
        const m = log.match(/http:\/\/127\.0\.0\.1:\d+/)
        if (m) resolve(m[0])
      })
      server.once('exit', (code) => reject(Error('Server exit ' + code)))
      server.once('error', reject)
    })
    assert.equal((await fetch(url)).status, 200)
    const req = (path, body) =>
      fetch(url + '/api/' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    const out = await (
      await req('case/check', {
        module: 'practice',
        caseId: 'sample-a',
        facts: {
          supervisor: 'Ирина Лесова',
          due: '2026-10-15',
          submitted: '2026-10-17'
        }
      })
    ).json()
    assert.deepEqual(
      out.checks.map((r) => r.status),
      ['pass', 'fail', 'unknown']
    )
    const compact = await (
      await req('case/check', {
        module: 'practice',
        caseId: 'sample-a',
        facts: {
          supervisor: 'Ирина Лесова',
          due: '2026-10-15',
          submitted: '2026-10-17'
        },
        includeTurtle: false
      })
    ).json()
    assert.deepEqual(compact, { checks: out.checks, graph: out.graph })
    assert.match(out.ttl, /cases\/sample-a#/)
    assert.equal(
      (
        await req('case/check', {
          module: 'practice',
          facts: { due: '31 октября' }
        })
      ).status,
      400
    )
    const form = new FormData()
    form.append(
      'file',
      new Blob(
        [await readFile(new URL('./fixtures/practice.pdf', import.meta.url))],
        { type: 'application/pdf' }
      ),
      'practice.pdf'
    )
    const pdf = await fetch(url + '/api/case/read-pdf', {
      method: 'POST',
      body: form
    })
    assert.equal(pdf.status, 200)
    assert.match((await pdf.json()).text, /Teacher supervises a Student/)
  }
)
