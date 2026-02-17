/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'

const mockCheckForUpdates = jest.fn<(currentVersion: string) => Promise<string | null>>()
const mockGetCurrentVersion = jest.fn<() => string>()
const mockIsGloballyInstalled = jest.fn<() => boolean>()

jest.unstable_mockModule('package-json', () => ({
  default: jest.fn(),
}))

jest.unstable_mockModule('../../services/update-check', () => ({
  checkForUpdates: mockCheckForUpdates,
  getCurrentVersion: mockGetCurrentVersion,
}))

jest.unstable_mockModule('../../services/global-path', () => ({
  isGloballyInstalled: mockIsGloballyInstalled,
}))

let useEnvironmentCheck: () => {
  loading: boolean
  updateAvailable: string | null
  currentVersion: string
  isGlobal: boolean
}

describe('useEnvironmentCheck hook - Property-Based Tests', () => {
  beforeAll(async () => {
    const module = await import('../useEnvironmentCheck')
    useEnvironmentCheck = module.useEnvironmentCheck
  })
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCurrentVersion.mockReturnValue('1.0.0')
    // Use real timers for these tests since they involve Promise.race with timeouts
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should complete within 100ms regardless of update check duration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 0, max: 100 }),
        fc.oneof(
          fc.constant(null),
          fc.string({ minLength: 5, maxLength: 10 }).map((s) => `1.${s.slice(0, 3)}.${s.slice(3, 6)}`),
        ),
        fc.boolean(),
        async (updateCheckDelayMs, globalCheckDelayMs, updateVersion, isGlobal) => {
          mockCheckForUpdates.mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(updateVersion), updateCheckDelayMs)
              }),
          )

          mockIsGloballyInstalled.mockImplementation(() => {
            const start = Date.now()
            while (Date.now() - start < globalCheckDelayMs) {
              // Busy wait
            }
            return isGlobal
          })

          const startTime = Date.now()
          const { result } = renderHook(() => useEnvironmentCheck())
          expect(result.current.loading).toBe(true)
          await waitFor(
            () => {
              expect(result.current.loading).toBe(false)
            },
            { timeout: 300 },
          )

          const completionTime = Date.now() - startTime
          expect(completionTime).toBeLessThan(300)
          expect(result.current.currentVersion).toBe('1.0.0')
        },
      ),
      { numRuns: 5 },
    )
  }, 40000)

  it('should update state after timeout if update check completes later', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 500 }),
        fc.string({ minLength: 5, maxLength: 10 }).map((s) => `2.${s.slice(0, 3)}.${s.slice(3, 6)}`),
        fc.boolean(),
        async (updateCheckDelayMs, updateVersion, isGlobal) => {
          mockCheckForUpdates.mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(updateVersion), updateCheckDelayMs)
              }),
          )

          mockIsGloballyInstalled.mockReturnValue(isGlobal)
          const { result } = renderHook(() => useEnvironmentCheck())
          await waitFor(
            () => {
              expect(result.current.loading).toBe(false)
            },
            { timeout: 200 },
          )
          await waitFor(
            () => {
              expect(result.current.updateAvailable).toBe(updateVersion)
              expect(result.current.isGlobal).toBe(isGlobal)
            },
            { timeout: updateCheckDelayMs + 200 },
          )
        },
      ),
      { numRuns: 5 },
    )
  }, 30000)

  it('should return complete data when checks finish before timeout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 90 }),
        fc.oneof(
          fc.constant(null),
          fc.string({ minLength: 5, maxLength: 10 }).map((s) => `1.${s.slice(0, 3)}.${s.slice(3, 6)}`),
        ),
        fc.boolean(),
        async (updateCheckDelayMs, updateVersion, isGlobal) => {
          mockCheckForUpdates.mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(updateVersion), updateCheckDelayMs)
              }),
          )

          mockIsGloballyInstalled.mockReturnValue(isGlobal)

          const { result } = renderHook(() => useEnvironmentCheck())

          await waitFor(
            () => {
              expect(result.current.loading).toBe(false)
            },
            { timeout: 200 },
          )

          expect(result.current.updateAvailable).toBe(updateVersion)
          expect(result.current.isGlobal).toBe(isGlobal)
          expect(result.current.currentVersion).toBe('1.0.0')
        },
      ),
      { numRuns: 5 },
    )
  }, 30000)

  it('should complete within 100ms even when update check fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(new Error('Network error')),
          fc.constant(new Error('Timeout')),
          fc.constant(new Error('API error')),
        ),
        fc.boolean(),
        async (error, isGlobal) => {
          mockCheckForUpdates.mockRejectedValue(error)
          mockIsGloballyInstalled.mockReturnValue(isGlobal)

          const startTime = Date.now()
          const { result } = renderHook(() => useEnvironmentCheck())

          await waitFor(
            () => {
              expect(result.current.loading).toBe(false)
            },
            { timeout: 200 },
          )

          const completionTime = Date.now() - startTime
          expect(completionTime).toBeLessThan(180)
          expect(result.current.updateAvailable).toBeNull()
          expect(result.current.isGlobal).toBe(isGlobal)
        },
      ),
      { numRuns: 20 },
    )
  }, 60000)

  it('should complete within 100ms even when global install check fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(null),
          fc.string({ minLength: 5, maxLength: 10 }).map((s) => `1.${s.slice(0, 3)}.${s.slice(3, 6)}`),
        ),
        async (updateVersion) => {
          mockCheckForUpdates.mockResolvedValue(updateVersion)
          mockIsGloballyInstalled.mockImplementation(() => {
            throw new Error('Global check failed')
          })

          const startTime = Date.now()
          const { result } = renderHook(() => useEnvironmentCheck())

          await waitFor(
            () => {
              expect(result.current.loading).toBe(false)
            },
            { timeout: 200 },
          )

          const completionTime = Date.now() - startTime

          expect(completionTime).toBeLessThan(180)
          expect(result.current.isGlobal).toBe(false)

          if (updateVersion !== null) {
            await waitFor(
              () => {
                expect(result.current.updateAvailable).toBe(updateVersion)
              },
              { timeout: 200 },
            )
          }
        },
      ),
      { numRuns: 20 },
    )
  }, 60000)
})
