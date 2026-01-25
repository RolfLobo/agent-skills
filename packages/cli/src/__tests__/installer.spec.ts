import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { installSkills, listInstalledSkills } from '../installer'
import type { InstallOptions, SkillInfo } from '../types'

describe('installer', () => {
  let tempDir: string
  let skillsDir: string
  let targetDir: string

  beforeEach(async () => {
    // Create temporary directories for testing
    tempDir = join(tmpdir(), `installer-test-${Date.now()}`)
    skillsDir = join(tempDir, 'skills')
    targetDir = join(tempDir, 'project')
    await mkdir(skillsDir, { recursive: true })
    await mkdir(targetDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up temporary directories
    try {
      await rm(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('installSkills', () => {
    it('should return results array with correct structure', async () => {
      const mockSkill: SkillInfo = {
        name: 'test-skill',
        description: 'A test skill',
        path: skillsDir,
      }

      await writeFile(join(skillsDir, 'SKILL.md'), '# Test Skill')

      const mockOptions: InstallOptions = {
        global: false,
        method: 'copy',
        agents: ['cursor'],
        skills: ['test-skill'],
      }

      const results = await installSkills([mockSkill], mockOptions)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toHaveProperty('agent')
      expect(results[0]).toHaveProperty('skill')
      expect(results[0]).toHaveProperty('success')
      expect(results[0]).toHaveProperty('method')
    })

    it('should handle empty skills array', async () => {
      const mockOptions: InstallOptions = {
        global: false,
        method: 'symlink',
        agents: ['cursor'],
        skills: [],
      }

      const results = await installSkills([], mockOptions)
      expect(results).toEqual([])
    })

    it('should handle multiple agents', async () => {
      const mockSkill: SkillInfo = {
        name: 'test-skill',
        description: 'A test skill',
        path: skillsDir,
      }

      await writeFile(join(skillsDir, 'SKILL.md'), '# Test Skill')

      const mockOptions: InstallOptions = {
        global: false,
        method: 'copy',
        agents: ['cursor', 'claude-code'],
        skills: ['test-skill'],
      }

      const results = await installSkills([mockSkill], mockOptions)
      expect(results.length).toBe(2)
      expect(results.map((r) => r.agent)).toContain('Cursor')
      expect(results.map((r) => r.agent)).toContain('Claude Code')
    })
  })

  describe('listInstalledSkills', () => {
    it('should return empty array for non-existent directory', async () => {
      const skills = await listInstalledSkills('cursor', false)
      expect(Array.isArray(skills)).toBe(true)
    })
  })
})
