import {
  VN_BGM_FAMILY_SRC,
  vnBgmMixParams,
  type VnBgmFamily,
  type VnBgmSpec,
} from '../data/audio/vnBgmCatalog'
import { assetPath } from './assetPath'
import { notifySfxGestureUnlocked } from './sfx'

const FADE_MS = 650
const DUCK_MULT = 0.48

let audio: HTMLAudioElement | null = null
let activeKey = ''
let activeFamily: VnBgmFamily | '' = ''
let ducking = false
let baseVolume = 0.26
let fadeTimer: number | null = null

function applyVolume() {
  if (!audio) return
  const v = ducking ? baseVolume * DUCK_MULT : baseVolume
  audio.volume = Math.max(0, Math.min(1, v))
}

export function vnBgmSetDuck(on: boolean) {
  if (ducking === on) return
  ducking = on
  applyVolume()
}

function stopImmediate() {
  if (fadeTimer !== null) {
    window.clearInterval(fadeTimer)
    fadeTimer = null
  }
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
}

function fadeTo(target: number, done: () => void) {
  if (!audio) {
    done()
    return
  }
  const start = audio.volume
  const t0 = Date.now()
  if (fadeTimer !== null) window.clearInterval(fadeTimer)
  fadeTimer = window.setInterval(() => {
    const t = Math.min(1, (Date.now() - t0) / FADE_MS)
    audio!.volume = start + (target - start) * t
    if (t >= 1) {
      if (fadeTimer !== null) window.clearInterval(fadeTimer)
      fadeTimer = null
      done()
    }
  }, 32)
}

export function vnBgmStop() {
  activeKey = ''
  activeFamily = ''
  if (!audio) return
  fadeTo(0, () => stopImmediate())
}

export function vnBgmPlay(sceneKey: string, spec: VnBgmSpec) {
  const src = assetPath(VN_BGM_FAMILY_SRC[spec.family])
  const mix = vnBgmMixParams(spec)
  baseVolume = mix.volume

  if (activeKey === sceneKey && activeFamily === spec.family && audio) {
    audio.playbackRate = mix.playbackRate
    applyVolume()
    return
  }

  const startFresh = () => {
    stopImmediate()
    activeKey = sceneKey
    activeFamily = spec.family
    audio = new Audio(src)
    audio.loop = true
    audio.playbackRate = mix.playbackRate
    audio.volume = 0
    void audio.play().then(() => notifySfxGestureUnlocked()).catch(() => undefined)
    fadeTo(ducking ? baseVolume * DUCK_MULT : baseVolume, () => undefined)
  }

  if (audio) {
    fadeTo(0, startFresh)
  } else {
    startFresh()
  }
}