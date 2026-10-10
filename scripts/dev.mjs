import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const venvPythonWin = path.join(rootDir, '.venv', 'Scripts', 'python.exe')
const venvPythonUnix = path.join(rootDir, '.venv', 'bin', 'python')

const pythonCmd = existsSync(venvPythonWin)
  ? venvPythonWin
  : existsSync(venvPythonUnix)
    ? venvPythonUnix
    : 'python'

const whisperOnly = process.argv.includes('--whisper-only')

const procs = []

function startProcess(name, cmd, args) {
  const child = spawn(cmd, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: cmd === 'npx' || cmd === 'python',
  })
  procs.push(child)
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`[${name}] exited with code ${code}`)
    }
  })
  return child
}

// 1. Start Python faster-whisper server
console.log('[Sonorauris] Starting Tier-2 faster-whisper Python Server on port 8000...')
startProcess('WhisperServer', pythonCmd, ['server/whisper_server.py'])

// 2. Start Vite dev server unless --whisper-only is passed
if (!whisperOnly) {
  console.log('[Sonorauris] Starting Vite Frontend Server...')
  startProcess('Vite', 'npx', ['vite'])
}

const cleanup = () => {
  for (const p of procs) {
    try {
      p.kill()
    } catch {
      // ignore
    }
  }
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
