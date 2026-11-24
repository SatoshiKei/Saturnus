import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdvTypewriter } from '../../src/components/story/vn/useAdvTypewriter'

describe('useAdvTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('acumula períodos no mesmo bloco; avanço libera o próximo', async () => {
    const { result } = renderHook(() =>
      useAdvTypewriter('A. B.', { enabled: true, charMs: 10, typingSfx: false }),
    )

    expect(result.current.displayedText).toBe('')
    expect(result.current.ready).toBe(false)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.displayedText).toBe('A')

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.displayedText).toBe('A.')
    expect(result.current.ready).toBe(true)

    act(() => {
      expect(result.current.consumeAdvance()).toBe(true)
    })

    expect(result.current.displayedText).toBe('A.')
    expect(result.current.ready).toBe(false)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.displayedText).toBe('A. B')

    await act(async () => {
      vi.advanceTimersByTime(10)
    })

    expect(result.current.displayedText).toBe('A. B.')
    expect(result.current.beatComplete).toBe(true)
  })
})