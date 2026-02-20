import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

import { isGloballyInstalled } from '../services/global-path'
import { getCachedUpdate, isCacheValid, setCachedUpdate } from '../services/update-cache'
import { checkForUpdates, getCurrentVersion } from '../services/update-check'
import { UPDATE_CHECK_TIMEOUT_MS } from '../utils/constants'

export interface EnvironmentCheckState {
  updateAvailable: string | null
  currentVersion: string
  isGlobal: boolean
}

async function resolveUpdateAvailable(currentVersion: string): Promise<string | null> {
  const cached = await getCachedUpdate()
  if (cached && (await isCacheValid())) return cached.latestVersion !== currentVersion ? cached.latestVersion : null
  const update = await checkForUpdates(currentVersion)
  setCachedUpdate(update ?? currentVersion).catch(() => {})
  return update
}

const runCheck = async (): Promise<EnvironmentCheckState> => {
  const currentVersion = getCurrentVersion()
  const timeout = new Promise<null>((r) => setTimeout(() => r(null), UPDATE_CHECK_TIMEOUT_MS))

  const [updateAvailable, isGlobal] = await Promise.all([
    Promise.race([resolveUpdateAvailable(currentVersion).catch(() => null), timeout]),
    Promise.resolve(isGloballyInstalled()).catch(() => false),
  ])

  return { updateAvailable: updateAvailable ?? null, currentVersion, isGlobal: isGlobal as boolean }
}

const environmentCheckAsyncAtom = atom<Promise<EnvironmentCheckState>>(runCheck())

export const environmentCheckAtom = unwrap(
  environmentCheckAsyncAtom,
  (prev) => prev ?? { updateAvailable: null, currentVersion: getCurrentVersion(), isGlobal: false },
)
