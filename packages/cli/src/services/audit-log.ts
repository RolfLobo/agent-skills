import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { AGENTS_DIR, AUDIT_LOG_FILE } from '../utils/constants'
import { findProjectRoot } from './project-root'

interface AuditEntry {
  action: 'install' | 'remove' | 'update'
  skillName: string
  agents: string[]
  success: number
  failed: number
  forced?: boolean
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const projectRoot = findProjectRoot()
    const logPath = join(projectRoot, AGENTS_DIR, AUDIT_LOG_FILE)
    const logDir = join(projectRoot, AGENTS_DIR)
    await mkdir(logDir, { recursive: true })

    const logLine =
      JSON.stringify({
        ...entry,
        timestamp: new Date().toISOString(),
      }) + '\n'

    await appendFile(logPath, logLine, 'utf-8')
  } catch {
    // Fail silently
  }
}
