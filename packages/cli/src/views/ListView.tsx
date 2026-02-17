import { Box, Text } from 'ink'
import { useMemo } from 'react'

import { Header } from '../components/Header'
import { useInstalledSkills } from '../hooks/useInstalledSkills'
import { useSkills } from '../hooks/useSkills'
import { colors } from '../theme'
import { SkillBrowser } from './SkillBrowser'

export function ListView({ onExit }: { onExit: () => void }) {
  const { installedSkills, loading: loadingInstalled } = useInstalledSkills()
  const { skills, loading: loadingSkills } = useSkills()

  const installedList = useMemo(() => {
    if (loadingInstalled || loadingSkills) return []
    const installedNames = new Set(Object.keys(installedSkills))
    return skills.filter((s) => installedNames.has(s.name))
  }, [installedSkills, skills, loadingInstalled, loadingSkills])

  if (loadingInstalled || loadingSkills) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header />
        <Text>Loading...</Text>
      </Box>
    )
  }

  if (installedList.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header />
        <Text color={colors.warning}>No skills installed.</Text>
        <Text color={colors.textDim}>(Press any key to exit)</Text>
      </Box>
    )
  }

  return <SkillBrowser onExit={onExit} readOnly={true} overrideSkills={installedList} />
}
