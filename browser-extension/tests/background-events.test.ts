import { beforeEach, describe, expect, it } from 'vitest'
import { handleCommentEvent, states } from '../src/entrypoints/background'
import type { CommentEvent, CommentSpot } from '../src/lib/enhancer'

describe('Background Event Handler', () => {
  let mockSender: any
  let mockSpot: CommentSpot

  beforeEach(() => {
    // Clear the shared states map before each test
    states.clear()

    mockSender = {
      tab: {
        id: 123,
        windowId: 456,
      },
    }

    mockSpot = {
      type: 'TEST_SPOT',
      unique_key: 'test-key',
    }
  })

  describe('ENHANCED Event', () => {
    it('should create new comment state when textarea is enhanced', () => {
      const message: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'ENHANCED',
      }

      handleCommentEvent(message, mockSender)

      const expectedKey = {
        spot: mockSpot,
        tab: { tabId: 123, windowId: 456 },
      }

      const state = states.get(expectedKey)
      expect(state).toBeDefined()
      expect(state?.tab).toEqual({ tabId: 123, windowId: 456 })
      expect(state?.spot).toEqual(mockSpot)
      expect(state?.drafts).toEqual([])
    })

    it('should not handle ENHANCED event without tab info', () => {
      const message: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'ENHANCED',
      }

      const senderWithoutTab = { tab: null }

      handleCommentEvent(message, senderWithoutTab)

      expect(states.size).toBe(0)
    })
  })

  describe('DESTROYED Event', () => {
    it('should remove comment state when textarea is destroyed', () => {
      // First create a state using the actual handler
      const enhanceMessage: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'ENHANCED',
      }

      handleCommentEvent(enhanceMessage, mockSender)
      expect(states.size).toBe(1)

      // Then destroy it
      const destroyMessage: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'DESTROYED',
      }

      handleCommentEvent(destroyMessage, mockSender)

      expect(states.size).toBe(0)
    })

    it('should handle DESTROYED event for non-existent state gracefully', () => {
      const message: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'DESTROYED',
      }

      // Should not throw error
      handleCommentEvent(message, mockSender)

      expect(states.size).toBe(0)
    })
  })

  describe('Invalid Events', () => {
    it('should ignore events with unsupported type', () => {
      const message: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'LOST_FOCUS',
      }

      handleCommentEvent(message, mockSender)

      expect(states.size).toBe(0)
    })
  })

  describe('State Management', () => {
    it('should handle multiple enhanced textareas from different tabs', () => {
      const spot1: CommentSpot = { type: 'SPOT1', unique_key: 'key1' }
      const spot2: CommentSpot = { type: 'SPOT2', unique_key: 'key2' }

      const sender1 = { tab: { id: 123, windowId: 456 } }
      const sender2 = { tab: { id: 789, windowId: 456 } }

      handleCommentEvent({ draft: undefined, spot: spot1, type: 'ENHANCED' }, sender1)
      handleCommentEvent({ draft: undefined, spot: spot2, type: 'ENHANCED' }, sender2)

      expect(states.size).toBe(2)
    })

    it('should handle same spot from same tab (overwrite)', () => {
      const message: CommentEvent = {
        draft: undefined,
        spot: mockSpot,
        type: 'ENHANCED',
      }

      // Enhance same spot twice
      handleCommentEvent(message, mockSender)
      handleCommentEvent(message, mockSender)

      // Should still be 1 entry (overwritten)
      expect(states.size).toBe(1)
    })
  })
})
