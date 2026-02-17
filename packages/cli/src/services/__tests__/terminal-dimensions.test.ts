import { describe, it, expect, afterEach } from '@jest/globals'
import { getTerminalSize, shouldUseBottomPanel, canShowDetailPanel } from '../terminal-dimensions'

describe('terminal-dimensions service', () => {
  // Store original values
  const originalColumns = process.stdout.columns
  const originalRows = process.stdout.rows

  afterEach(() => {
    // Restore original values
    process.stdout.columns = originalColumns
    process.stdout.rows = originalRows
  })

  describe('getTerminalSize', () => {
    it('should return current terminal dimensions', () => {
      process.stdout.columns = 120
      process.stdout.rows = 30

      const size = getTerminalSize()

      expect(size).toEqual({ width: 120, height: 30 })
    })

    it('should return default dimensions when stdout values are undefined', () => {
      process.stdout.columns = undefined as unknown as number
      process.stdout.rows = undefined as unknown as number

      const size = getTerminalSize()

      expect(size).toEqual({ width: 80, height: 24 })
    })

    it('should handle zero values by using defaults', () => {
      process.stdout.columns = 0
      process.stdout.rows = 0

      const size = getTerminalSize()

      expect(size).toEqual({ width: 80, height: 24 })
    })
  })

  describe('shouldUseBottomPanel', () => {
    it('should return true when width is less than 120', () => {
      process.stdout.columns = 119
      process.stdout.rows = 30

      const result = shouldUseBottomPanel()

      expect(result).toBe(true)
    })

    it('should return false when width is 120 or greater', () => {
      process.stdout.columns = 120
      process.stdout.rows = 30

      const result = shouldUseBottomPanel()

      expect(result).toBe(false)
    })

    it('should return false for very wide terminals', () => {
      process.stdout.columns = 200
      process.stdout.rows = 50

      const result = shouldUseBottomPanel()

      expect(result).toBe(false)
    })

    it('should return true for narrow terminals', () => {
      process.stdout.columns = 80
      process.stdout.rows = 24

      const result = shouldUseBottomPanel()

      expect(result).toBe(true)
    })
  })

  describe('canShowDetailPanel', () => {
    it('should return true when dimensions meet minimum requirements', () => {
      process.stdout.columns = 80
      process.stdout.rows = 24

      const result = canShowDetailPanel()

      expect(result).toBe(true)
    })

    it('should return true when dimensions exceed minimum requirements', () => {
      process.stdout.columns = 120
      process.stdout.rows = 40

      const result = canShowDetailPanel()

      expect(result).toBe(true)
    })

    it('should return false when width is below minimum', () => {
      process.stdout.columns = 79
      process.stdout.rows = 24

      const result = canShowDetailPanel()

      expect(result).toBe(false)
    })

    it('should return false when height is below minimum', () => {
      process.stdout.columns = 80
      process.stdout.rows = 23

      const result = canShowDetailPanel()

      expect(result).toBe(false)
    })

    it('should return false when both dimensions are below minimum', () => {
      process.stdout.columns = 70
      process.stdout.rows = 20

      const result = canShowDetailPanel()

      expect(result).toBe(false)
    })

    it('should handle default dimensions correctly', () => {
      process.stdout.columns = undefined as unknown as number
      process.stdout.rows = undefined as unknown as number

      const result = canShowDetailPanel()

      // Default is 80x24, which meets minimum
      expect(result).toBe(true)
    })
  })
})
