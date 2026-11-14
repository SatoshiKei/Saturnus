import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GameHubProvider, useGameHub } from '../../src/app/GameHubContext'
import { PhoneSessionProvider } from '../../src/app/PhoneSessionContext'
import { PhotosApp } from '../../src/apps/device/PhotosApp'
import { AppIcon } from '../../src/components/AppIcon'
import {
  augustoPhotosLibrary,
  marianaPhotosLibrary,
  photosForDevice,
} from '../../src/data/block01/phoneMedia'
import { resetGame } from '../../src/game/state/investigationStore'
import { contactAvatarSrc } from '../../src/lib/characterSprites'
import { PhoneAppRouter } from '../../src/phone/PhoneAppRouter'

type Device = 'mariana' | 'augusto'

afterEach(() => cleanup())

function UseDevice({ device, children }: { device: Device; children: ReactNode }) {
  const { phoneDevice, setPhoneDevice } = useGameHub()
  useEffect(() => setPhoneDevice(device), [device, setPhoneDevice])
  return phoneDevice === device ? <>{children}</> : null
}

function renderPhone(device: Device) {
  return render(
    <GameHubProvider>
      <PhoneSessionProvider>
        <UseDevice device={device}>
          <div style={{ width: 320, height: 680 }}>
            <PhoneAppRouter />
          </div>
        </UseDevice>
      </PhoneSessionProvider>
    </GameHubProvider>,
  )
}

function renderPhotos(device: Device, onBack = vi.fn()) {
  render(
    <GameHubProvider>
      <PhoneSessionProvider>
        <UseDevice device={device}>
          <PhotosApp onBack={onBack} />
        </UseDevice>
      </PhoneSessionProvider>
    </GameHubProvider>,
  )
  return onBack
}

const ids = (lib: readonly { id: string }[]) => lib.map((i) => i.id)

describe('phone photo catalogs: no leakage', () => {
  it('catalogs are disjoint by id and label, and each item belongs to its own device', () => {
    const m = ids(marianaPhotosLibrary)
    const a = ids(augustoPhotosLibrary)
    expect(m.filter((id) => a.includes(id))).toEqual([])
    const mLabels = marianaPhotosLibrary.map((i) => i.label)
    const aLabels = augustoPhotosLibrary.map((i) => i.label)
    expect(mLabels.filter((l) => aLabels.includes(l))).toEqual([])
    expect(marianaPhotosLibrary.every((i) => i.device === 'mariana')).toBe(true)
    expect(augustoPhotosLibrary.every((i) => i.device === 'augusto')).toBe(true)
  })

  it('photosForDevice returns only that device library', () => {
    expect(photosForDevice('mariana')).toBe(marianaPhotosLibrary)
    expect(photosForDevice('augusto')).toBe(augustoPhotosLibrary)
  })

  it('every photo has its own image source (no generic desk/office fallback)', () => {
    for (const item of [...marianaPhotosLibrary, ...augustoPhotosLibrary]) {
      expect(item.spriteId, item.id).toBeTruthy()
      expect(contactAvatarSrc(item.spriteId), item.id).toBeTruthy()
    }
  })

  it('PhotosApp source does not reference the desk/office background or extra catalogs', () => {
    const src = readFileSync(join(process.cwd(), 'src/apps/device/PhotosApp.tsx'), 'utf8')
    expect(src).not.toMatch(/hub-office-bg/)
    expect(src).not.toMatch(/MARIANA_EXTRA/)
    expect(src).not.toMatch(/(?:augusto|mariana)PhotosLibrary/)
  })

  it("Mariana's Photos shows no Augusto-exclusive photo", () => {
    renderPhotos('mariana')
    const grid = screen.getByTestId('photos-grid')
    const shown = [...grid.querySelectorAll('[data-photo-id]')].map((n) => n.getAttribute('data-photo-id'))
    expect(shown).toEqual(ids(marianaPhotosLibrary))
    for (const item of augustoPhotosLibrary) {
      expect(screen.queryByTestId(`photo-tile-${item.id}`)).toBeNull()
    }
    const augustoPortrait = contactAvatarSrc('augusto')
    const srcs = [...grid.querySelectorAll('img')].map((i) => i.getAttribute('src'))
    expect(srcs).not.toContain(augustoPortrait)
  })

  it("Augusto's Photos shows no Mariana-exclusive photo", () => {
    renderPhotos('augusto')
    const grid = screen.getByTestId('photos-grid')
    const shown = [...grid.querySelectorAll('[data-photo-id]')].map((n) => n.getAttribute('data-photo-id'))
    expect(shown).toEqual(ids(augustoPhotosLibrary))
    for (const item of marianaPhotosLibrary) {
      expect(screen.queryByTestId(`photo-tile-${item.id}`)).toBeNull()
    }
    const marianaPortrait = contactAvatarSrc('mariana')
    const srcs = [...grid.querySelectorAll('img')].map((i) => i.getAttribute('src'))
    expect(srcs).not.toContain(marianaPortrait)
  })
})

describe('PhotosApp gallery / viewer', () => {
  beforeEach(() => resetGame())

  it('has a dedicated scroll container holding the grid; thumbs carry no text overlay', () => {
    renderPhotos('mariana')
    const scroll = screen.getByTestId('photos-scroll')
    expect(within(scroll).getByTestId('photos-grid')).toBeInTheDocument()
    for (const tile of screen.getByTestId('photos-grid').querySelectorAll('li')) {
      expect(tile.querySelector('figcaption')).toBeNull()
      expect(tile.textContent?.trim()).toBe('')
    }
  })

  it('opens the viewer, shows meta, navigates and closes back to the gallery', async () => {
    const user = userEvent.setup()
    renderPhotos('mariana')
    expect(screen.queryByTestId('photos-viewer')).toBeNull()
    await user.click(screen.getByTestId(`photo-tile-${marianaPhotosLibrary[0]!.id}`))
    const viewer = screen.getByTestId('photos-viewer')
    expect(viewer).toHaveAttribute('data-photo-id', marianaPhotosLibrary[0]!.id)
    expect(within(viewer).getByText(marianaPhotosLibrary[0]!.label)).toBeInTheDocument()
    await user.click(screen.getByTestId('photos-viewer-next'))
    expect(screen.getByTestId('photos-viewer')).toHaveAttribute('data-photo-id', marianaPhotosLibrary[1]!.id)
    await user.click(screen.getByTestId('photos-viewer-prev'))
    expect(screen.getByTestId('photos-viewer')).toHaveAttribute('data-photo-id', marianaPhotosLibrary[0]!.id)
    await user.click(screen.getByTestId('photos-viewer-back'))
    expect(screen.queryByTestId('photos-viewer')).toBeNull()
    expect(screen.getByTestId('photos-grid')).toBeInTheDocument()
  })

  it('viewer navigation wraps only inside the device library', async () => {
    const user = userEvent.setup()
    renderPhotos('augusto')
    await user.click(screen.getByTestId(`photo-tile-${augustoPhotosLibrary[0]!.id}`))
    await user.click(screen.getByTestId('photos-viewer-prev'))
    expect(screen.getByTestId('photos-viewer')).toHaveAttribute(
      'data-photo-id',
      augustoPhotosLibrary[augustoPhotosLibrary.length - 1]!.id,
    )
  })

  it('header Back calls onBack', async () => {
    const user = userEvent.setup()
    const onBack = renderPhotos('augusto')
    await user.click(screen.getByTestId('photos-back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  for (const device of ['mariana', 'augusto'] as const) {
    it(`${device}: home → Photos → viewer → back → back returns to home`, async () => {
      const user = userEvent.setup()
      renderPhone(device)
      expect(screen.getByTestId('phone-home')).toBeInTheDocument()
      await user.click(screen.getByTestId('app-photos'))
      expect(screen.getByTestId('photos-app')).toHaveAttribute('data-device', device)
      const first = photosForDevice(device)[0]!
      await user.click(screen.getByTestId(`photo-tile-${first.id}`))
      expect(screen.getByTestId('photos-viewer')).toBeInTheDocument()
      await user.click(screen.getByTestId('photos-viewer-back'))
      expect(screen.queryByTestId('photos-viewer')).toBeNull()
      await user.click(screen.getByTestId('photos-back'))
      expect(screen.getByTestId('phone-home')).toBeInTheDocument()
    })
  }
})

describe('phone CSS structure (scroll + layout)', () => {
  const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8').replace(/\r\n/g, '\n')
  const rule = (css: string, selector: string) => {
    const re = new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g')
    return [...css.matchAll(re)].map((m) => m[1]).join('\n')
  }

  it('Photos scroller is an overflow-y container that can shrink (min-height: 0)', () => {
    const css = read('src/styles/device-apps.css')
    const body = rule(css, '.ios-photos__scroll')
    expect(body).toMatch(/overflow-y:\s*auto/)
    expect(body).toMatch(/min-height:\s*0/)
    expect(body).toMatch(/flex:\s*1/)
  })

  it('Photos grid uses 3 uniform columns and thumbs use cover; viewer uses contain', () => {
    const css = read('src/styles/device-apps.css')
    expect(rule(css, '.ios-photos__grid')).toMatch(/repeat\(3,/)
    expect(rule(css, '.ios-photos__img')).toMatch(/object-fit:\s*cover/)
    expect(rule(css, '.ios-photos-viewer__stage img')).toMatch(/object-fit:\s*contain/)
    expect(rule(css, '.ios-photos-viewer')).toMatch(/background:\s*#000/)
  })

  it('screen container lets app roots shrink and never scrolls itself', () => {
    const css = read('src/styles/phone.css')
    expect(rule(css, '.phone-shell__content')).toMatch(/min-height:\s*0/)
    expect(rule(css, '.phone-shell__content')).toMatch(/overflow:\s*hidden/)
    expect(css).toMatch(/\.phone-shell \.phone-shell__content > \*\s*\{[^}]*min-height:\s*0/)
  })

  it('every app list/viewer scroller is declared with min-height:0 + overflow-y:auto', () => {
    const css = read('src/styles/phone.css')
    const block = css.slice(css.indexOf('Scroll estrutural'))
    const selectors = [
      '.wa-chat-list',
      '.wa-messages',
      '.wa-calls',
      '.phone-contacts',
      '.notes-list',
      '.calendar-events',
      '.ios-files__list',
      '.ios-photos__scroll',
      '.device-app',
      '.diary-app',
    ]
    const first = block.slice(0, block.indexOf('{'))
    for (const sel of selectors) expect(first, sel).toContain(sel)
    const body = block.slice(block.indexOf('{') + 1, block.indexOf('}'))
    expect(body).toMatch(/min-height:\s*0/)
    expect(body).toMatch(/overflow-y:\s*auto/)
    expect(body).toMatch(/overscroll-behavior:\s*contain/)
  })
})

describe('app icons', () => {
  it('Phone and Maps icons are plain SVG glyphs without text/emoji', () => {
    for (const id of ['phone', 'maps'] as const) {
      const { container, unmount } = render(<AppIcon appId={id} />)
      const svg = container.querySelector('svg.app-icon__svg')
      expect(svg, id).not.toBeNull()
      expect(svg!.querySelector('text')).toBeNull()
      expect(container.textContent?.trim()).toBe('')
      unmount()
    }
  })
})

describe('PhoneHome layout hooks', () => {
  beforeEach(() => resetGame())

  it('renders a 4-col page grid and a dock with the phone icon on both devices', () => {
    for (const device of ['mariana', 'augusto'] as const) {
      const { unmount } = renderPhone(device)
      expect(screen.getByTestId('phone-home-page-0')).toBeInTheDocument()
      expect(screen.getByTestId('app-phone')).toBeInTheDocument()
      expect(document.querySelector('.phone-home__dock')).not.toBeNull()
      unmount()
    }
  })
})
