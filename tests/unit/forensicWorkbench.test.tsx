import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'

class FakeAudioContext {
  state = 'running'
  currentTime = 0
  destination = {}
  sampleRate = 44100
  createGain() {
    return {
      gain: { value: 1 },
      connect() {
        return this
      },
      disconnect() {},
    }
  }
  createStereoPanner() {
    return {
      pan: { value: 0 },
      connect() {
        return this
      },
      disconnect() {},
    }
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000 },
      Q: { value: 1 },
      gain: { value: 0 },
      connect() {
        return this
      },
      disconnect() {},
    }
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect() {
        return this
      },
      start() {},
      stop() {},
    }
  }
  createBuffer(_c: number, frames: number, _sr: number) {
    return {
      getChannelData: () => new Float32Array(frames),
      duration: frames / 44100,
    }
  }
  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect() {
        return this
      },
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
  decodeAudioData(buf: ArrayBuffer) {
    return Promise.resolve({
      duration: 1,
      getChannelData: () => new Float32Array(8),
      length: 8,
      numberOfChannels: 1,
      sampleRate: 44100,
    })
  }
}

afterEach(() => cleanup())

describe('ForensicWorkbench UI', () => {
  it('keeps all inspector tabs available for WAV puzzle 1', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    )

    render(
      <ForensicWorkbench
        session={puzzle01CassiniSession}
        onClose={() => {}}
      />,
    )

    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeInTheDocument()
    }

    await userEvent.click(screen.getByRole('tab', { name: 'Structure' }))
    expect(screen.getByText(/não possui estrutura editável|No editable structure/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Packets' }))
    expect(screen.getByText(/Nenhuma estrutura de pacotes|No packet structure/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Compare' }))
    expect(screen.getByText(/Selecione duas fontes|Select two sources/i)).toBeInTheDocument()
  })

  it('shows one master source and does not reveal stems, answers, or later context', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    )
    const { container } = render(
      <ForensicWorkbench session={puzzle01CassiniSession} onClose={() => {}} />,
    )
    expect(screen.getAllByRole('button', { name: /EMG_0803\.wav/ })).toHaveLength(1)
    expect(screen.getByText('MASTER')).toBeInTheDocument()
    expect(screen.getAllByText('0:44.00').length).toBeGreaterThan(0)
    expect(container.textContent).not.toMatch(/BACKGROUND_NOISE|VOCAL_DEBRIS|TONE_1700|p01_mariana/)
    expect(container.textContent).not.toMatch(/Augusto|Rui|Elisa|você não lembra/)
    expect(container.textContent).not.toMatch(/REMOVE THIS|1700 Hz interference/)
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByPlaceholderText(/Registre trechos/)).toHaveValue('')
  })

  it('completes only when the five phrases are registered, in any order', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    )
    const onDone = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle01CassiniSession}
        onClose={() => {}}
        onPuzzleComplete={onDone}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    const notes = screen.getByPlaceholderText(/Registre trechos/)
    await userEvent.click(notes)
    await userEvent.paste('eu preciso\nele ta aqui')
    expect(onDone).not.toHaveBeenCalled()

    await userEvent.clear(notes)
    await userEvent.click(notes)
    await userEvent.paste(
      ['EU NÃO LEMBRO', 'eu estava confusa', 'Eu sentia medo.', 'desde aquela noite', 'Escute isso até o fim!'].join(
        '\n',
      ),
    )
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Análise registrada/)).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Augusto|Rui|Elisa|você não lembra/)
  })

  it('bypass keeps notch settings and reset restores the raw tone gain', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    )
    render(<ForensicWorkbench session={puzzle01CassiniSession} onClose={() => {}} />)
    const debug = () => screen.getByTestId('forensic-debug').textContent ?? ''
    const tone = () => Number(debug().match(/toneGain ([0-9.]+)/)?.[1])
    const tone0 = tone()
    const center = screen.getByText('Center').closest('.fw-param')?.querySelector('input')
    const reduction = screen.getAllByText('Reduction')[0]?.closest('.fw-param')?.querySelector('input')
    expect(center).toBeTruthy()
    expect(reduction).toBeTruthy()
    fireEvent.change(center!, { target: { value: '1700' } })
    fireEvent.change(reduction!, { target: { value: '-24' } })
    expect(tone()).toBeLessThan(tone0 * 0.1)
    expect(Number(debug().match(/notchEffectiveness ([0-9.]+)/)?.[1])).toBeGreaterThan(0.9)

    await userEvent.click(screen.getByRole('button', { name: 'Bypass' }))
    expect(tone()).toBeCloseTo(tone0, 3)
    expect((center as HTMLInputElement).value).toBe('1700')

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(tone()).toBeCloseTo(tone0, 3)
    expect((center as HTMLInputElement).value).toBe('1000')
    expect(debug().match(/notchEffectiveness ([0-9.]+)/)?.[1]).toBe('0.000')
  })
})
