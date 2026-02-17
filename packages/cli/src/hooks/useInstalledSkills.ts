import { useEffect, useState } from 'react'

import { detectInstalledAgents } from '../services/agents'
import { listInstalledSkills } from '../services/installer'
import type { AgentType } from '../types'

export type InstallationMap = Record<string, AgentType[]>

export function useInstalledSkills() {
  const [installedSkills, setInstalledSkills] = useState<InstallationMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const check = async () => {
      try {
        const agents = detectInstalledAgents()
        const status: InstallationMap = {}

        for (const agent of agents) {
          try {
            const [localSkills, globalSkills] = await Promise.all([
              listInstalledSkills(agent, false),
              listInstalledSkills(agent, true),
            ])

            const allAgentSkills = new Set([...localSkills, ...globalSkills])

            for (const skill of allAgentSkills) {
              if (!status[skill]) {
                status[skill] = []
              }

              if (!status[skill].includes(agent)) {
                status[skill].push(agent)
              }
            }
          } catch (err) {
            // Silently ignore errors for specific agents to not block the whole UI
            console.error(`Failed to check installed skills for ${agent}:`, err)
          }
        }

        if (mounted) {
          setInstalledSkills(status)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to detect installed agents:', err)
        if (mounted) setLoading(false)
      }
    }

    check()

    return () => {
      mounted = false
    }
  }, [])

  return { installedSkills, loading }
}
