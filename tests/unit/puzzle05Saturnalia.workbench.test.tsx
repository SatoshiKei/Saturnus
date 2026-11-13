import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import {
  puzzle05ExpectedOrder,
  puzzle05SaturnaliaSession,
} from '../../src/forensic/puzzles/puzzle05Saturnalia'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'

class FakeAudioContext {
  state = 'running'
  currentTime = 0
  destination = {}
  sampleRate = 44100
  createGain() {
    return { gain: { value: 1 }, connect() { return this }, disconnect() {} }
  }
  createStereoPanner() {
    return { pan: { value: 0 }, connect() { return this }, disconnect() {} }
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000 },
      Q: { value: 1 },
      gain: { value: 0 },
      connect() { return this },
      disconnect() {},
    }
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect() { return this },
      start() {},
      stop() {},
    }
  }
  createBuffer(_c: number, frames: number) {
    return {
      getChannelData: () => new Float32Array(frames),
      duration: frames / 44100,
      length: frames,
      numberOfChannels: 1,
      sampleRate: 44100,
    }
  }
  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect() { return this },
      start() {},
      stop() {},
    }
  }
  resume() { return Promise.resolve() }
  close() { return Promise.resolve() }
  decodeAudioData() {
    return Promise.resolve({
      duration: 32,
      getChannelData: () => new Float32Array(8),
      length: 8,
      numberOfChannels: 1,
      sampleRate: 44100,
    })
  }
}

function stubAudio() {
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })),
  )
}

afterEach(() => cleanup())

describe('Puzzle 05 workbench', () => {
  it('shows generic tabs, sequence list, and does not complete on physical order', async () => {
    stubAudio()
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(
      <ForensicWorkbench
        session={puzzle05SaturnaliaSession}
        onClose={() => {}}
        onPuzzleComplete={onComplete}
      />,
    )
    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeTruthy()
    }
    await user.click(screen.getByRole('tab', { name: 'Structure' }))
    expect(screen.getByTestId('clip-sequence-list')).toBeTruthy()
    expect(screen.getByText('RC_SLOT_00')).toBeTruthy()
    await user.click(screen.getByTestId('assemble-sequence'))
    expect(screen.getByTestId('assemble-status').textContent).toMatch(/failed|inconsistent/i)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('completes when reordered to chronological order and assembled', async () => {
    stubAudio()
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(
      <ForensicWorkbench
        session={puzzle05SaturnaliaSession}
        onClose={() => {}}
        onPuzzleComplete={onComplete}
      />,
    )
    await user.click(screen.getByRole('tab', { name: 'Structure' }))

    // Physical: 00..09. Need 06,07,08,09,00,01,02,03,04,05
    // Move 06 to front: index 6 up six times, then 07 (now at 7) up six, etc.
    async function moveToFront(fromIndex: number, steps: number) {
      for (let s = 0; s < steps; s++) {
        const idx = fromIndex - s
        await act(async () => {
          await user.click(screen.getByTestId(`clip-seq-up-${idx}`))
        })
      }
    }
    // Bring 06,07,08,09 to positions 0..3
    await moveToFront(6, 6) // 06 → 0
    await moveToFront(7, 6) // 07 → 1
    await moveToFront(8, 6) // 08 → 2
    await moveToFront(9, 6) // 09 → 3
    // Remaining 00..05 already at 4..9 — matches expected

    const list = screen.getByTestId('clip-sequence-list')
    const labels = Array.from(list.querySelectorAll('.fw-mono')).map((el) => el.textContent)
    expect(labels).toEqual([...puzzle05ExpectedOrder])

    await user.click(screen.getByTestId('assemble-sequence'))
    expect(screen.getByTestId('assemble-status').textContent).toMatch(/passed/i)
    expect(onComplete).toHaveBeenCalledTimes(1)
  }, 20_000)
})
