import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleCommentEvent, openSpots } from '../src/entrypoints/background'
import type { CommentEvent, CommentSpot } from '../src/lib/enhancer'

const mockSender = {
  tab: {
    id: 123,
    windowId: 456,
  },
}
const mockSpot = {
  type: 'TEST_SPOT',
  unique_key: 'test-key',
}
describe('Background Event Handler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-09-19T10:00:00.000Z'))
    openSpots.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  describe('ENHANCED Event', () => {
    it('should create new comment state when textarea is enhanced', () => {
      handleCommentEvent(
        {
          spot: mockSpot,
          type: 'ENHANCED',
        },
        mockSender,
      )
      expect(Array.from(openSpots)).toMatchInlineSnapshot(`
        [
          [
            "test-key",
            {
              "drafts": [
                [
                  1758276000000,
                  "",
                ],
              ],
              "sentOn": null,
              "spot": {
                "type": "TEST_SPOT",
                "unique_key": "test-key",
              },
              "tab": {
                "tabId": 123,
                "windowId": 456,
              },
              "trashedOn": null,
            },
          ],
        ]
      `)
    })
    it('should not handle ENHANCED event without tab info', () => {
      const senderWithoutTab = { tab: null }
      handleCommentEvent(
        {
          spot: mockSpot,
          type: 'ENHANCED',
        },
        senderWithoutTab,
      )
      expect(openSpots.size).toBe(0)
    })
  })

  describe('DESTROYED Event', () => {
    it('should remove comment state when textarea is destroyed', () => {
      // First create a state using the actual handler
      const enhanceMessage: CommentEvent = {
        spot: mockSpot,
        type: 'ENHANCED',
      }
      handleCommentEvent(enhanceMessage, mockSender)
      expect(openSpots.size).toBe(1)

      // Then destroy it
      const destroyMessage: CommentEvent = {
        spot: mockSpot,
        type: 'DESTROYED',
      }
      handleCommentEvent(destroyMessage, mockSender)
      expect(openSpots.size).toBe(0)
    })

    it('should handle DESTROYED event for non-existent state gracefully', () => {
      const message: CommentEvent = {
        spot: mockSpot,
        type: 'DESTROYED',
      }
      // Should not throw error
      handleCommentEvent(message, mockSender)
      expect(openSpots.size).toBe(0)
    })
  })

  describe('Invalid Events', () => {
    it('should ignore events with unsupported type', () => {
      const message: CommentEvent = {
        spot: mockSpot,
        type: 'LOST_FOCUS',
      }
      handleCommentEvent(message, mockSender)
      expect(openSpots.size).toBe(0)
    })
  })

  describe('State Management', () => {
    it('should handle multiple enhanced textareas from different tabs', () => {
      const spot1: CommentSpot = { type: 'SPOT1', unique_key: 'key1' }
      const spot2: CommentSpot = { type: 'SPOT2', unique_key: 'key2' }
      const sender1 = { tab: { id: 123, windowId: 456 } }
      const sender2 = { tab: { id: 789, windowId: 456 } }
      handleCommentEvent({ spot: spot1, type: 'ENHANCED' }, sender1)
      handleCommentEvent({ spot: spot2, type: 'ENHANCED' }, sender2)
      expect(openSpots.size).toBe(2)
    })

    it('should handle same spot from same tab (overwrite)', () => {
      const message: CommentEvent = {
        spot: mockSpot,
        type: 'ENHANCED',
      }

      // Enhance same spot twice
      handleCommentEvent(message, mockSender)
      handleCommentEvent(message, mockSender)

      // Should still be 1 entry (overwritten)
      expect(openSpots.size).toBe(1)
    })
  })
})
