import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import { puzzle03AnelsSession, puzzle03CorrectSetSourceId } from '../../src/forensic/puzzles/puzzle03Anels'
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

describe('Puzzle 03 workbench', () => {
  it('keeps generic tabs and shows set records as files', async () => {
    stubAudio()
    render(<ForensicWorkbench session={puzzle03AnelsSession} onClose={() => {}} />)
    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeInTheDocument()
    }
    expect(screen.getAllByText('REC_VTX_OLD_01.m4a').length).toBeGreaterThan(0)
    expect(screen.getByText('VTX-SET-20-C.log')).toBeInTheDocument()
    expect(screen.queryByText(/Give-Me-Everything/i)).toBeNull()
  })

  it('linking Nico completes the puzzle', async () => {
    stubAudio()
    const onDone = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle03AnelsSession}
        onClose={() => {}}
        onPuzzleComplete={onDone}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Compare' }))
    const selects = screen
      .getAllByRole('combobox')
      .filter((el) => Array.from(el.querySelectorAll('option')).some((o) => o.value === 'rec_vtx_old_01'))
    expect(selects.length).toBeGreaterThanOrEqual(2)
    await userEvent.selectOptions(selects[0]!, 'rec_vtx_old_01')
    await userEvent.selectOptions(selects[1]!, puzzle03CorrectSetSourceId)
    await userEvent.click(screen.getByRole('button', { name: /Link source/i }))
    expect(screen.getAllByText(/Link registered/i).length).toBeGreaterThan(0)
    await act(async () => {
      await Promise.resolve()
    })
    expect(onDone).toHaveBeenCalled()
  })

  it('wrong link does not complete', async () => {
    stubAudio()
    const onDone = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle03AnelsSession}
        onClose={() => {}}
        onPuzzleComplete={onDone}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Compare' }))
    const selects = screen
      .getAllByRole('combobox')
      .filter((el) => Array.from(el.querySelectorAll('option')).some((o) => o.value === 'rec_vtx_old_01'))
    expect(selects.length).toBeGreaterThanOrEqual(2)
    await userEvent.selectOptions(selects[0]!, 'rec_vtx_old_01')
    await userEvent.selectOptions(selects[1]!, 'set_vtx_20_a')
    await userEvent.click(screen.getByRole('button', { name: /Link source/i }))
    expect(screen.getAllByText(/do not fully correspond/i).length).toBeGreaterThan(0)
    expect(onDone).not.toHaveBeenCalled()
  })
})
