import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import { puzzle03AnelsSession } from '../../src/forensic/puzzles/puzzle03Anels'
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
  resume() {
    return Promise.resolve()
  }
  close() {
    return Promise.resolve()
  }
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

describe('Puzzle 03 workbench (fingerprint redesign)', () => {
  it('só o áudio nas fontes — Fingerprint Search sem quatro candidatos', async () => {
    stubAudio()
    render(<ForensicWorkbench session={puzzle03AnelsSession} onClose={() => {}} />)
    expect(INSPECTOR_TABS.map((t) => t.label)).toContain('Analysis')
    expect(screen.queryByText(/VTX-SET-20-A/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Nicolas Prado/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Link source/i })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Analysis' }))
    expect(screen.getByTestId('fingerprint-search')).toBeInTheDocument()
    expect(screen.queryByTestId('archive-session-list')).not.toBeInTheDocument()
  })
})
