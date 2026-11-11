import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import { puzzle04JanusSession } from '../../src/forensic/puzzles/puzzle04Janus'
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
      duration: 180,
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

describe('Puzzle 04 workbench', () => {
  it('keeps generic tabs and shows multitrack', async () => {
    stubAudio()
    const onComplete = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle04JanusSession}
        onClose={() => {}}
        onPuzzleComplete={onComplete}
      />,
    )
    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeTruthy()
    }
    expect(screen.getByTestId('timeline-multitrack')).toBeTruthy()
    expect(screen.getByTestId('timeline-lane-janus_phone')).toBeTruthy()
    expect(screen.getByTestId('timeline-lane-janus_desk')).toBeTruthy()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('completes only after align + formalize + apply correction', async () => {
    stubAudio()
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle04JanusSession}
        onClose={() => {}}
        onPuzzleComplete={onComplete}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Timing' }))
    expect(screen.getByTestId('timing-panel')).toBeTruthy()

    const deskOffset = screen.getByTestId('timing-offset-janus_desk') as HTMLInputElement
    await act(async () => {
      fireEvent.change(deskOffset, { target: { value: '10' } })
    })
    expect((screen.getByTestId('formalize-clock-offset') as HTMLButtonElement).disabled).toBe(true)
    expect(onComplete).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.change(deskOffset, { target: { value: '450' } })
    })
    const formalize = screen.getByTestId('formalize-clock-offset') as HTMLButtonElement
    expect(formalize.disabled).toBe(false)
    await user.click(formalize)
    expect(screen.getByTestId('timing-clock-difference').textContent).toMatch(/\+07:30/)

    await user.click(screen.getByTestId('apply-clock-correction'))
    expect(screen.getByTestId('timing-corrected-time').textContent).toMatch(/01:23:30/)
    expect(screen.getByTestId('timing-finding').textContent).toMatch(
      /Sandra não poderia ter visto Elisa/,
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
