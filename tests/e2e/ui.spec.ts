import { expect, test, type Page } from '@playwright/test'
import { closeHub, closePhone, dev, newGame, openHubObject, travelTo } from './helpers'

/** Testes de interface (revisão transversal): cartões, bancada, caderno, transições, celulares. */
test.use({ viewport: { width: 1366, height: 768 } })

async function inViewport(page: Page, testId: string) {
  const box = await page.getByTestId(testId).first().boundingBox()
  const vp = page.viewportSize()!
  expect(box, testId).not.toBeNull()
  expect(box!.x, testId).toBeGreaterThanOrEqual(-1)
  expect(box!.y, testId).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width, testId).toBeLessThanOrEqual(vp.width + 1)
  expect(box!.y + box!.height, testId).toBeLessThanOrEqual(vp.height + 1)
}

test('cartão de evidência é persistente, cabe na tela e não estoura texto', async ({ page }) => {
  await newGame(page)
  // Abrir o celular apreendido gera a primeira evidência do jogo (cartão persistente).
  await openHubObject(page, 'mariana-phone')
  await closePhone(page)
  const card = page.getByTestId('evidence-card')
  await expect(card).toBeVisible()
  // Persistente: continua ali depois que qualquer aviso temporário já teria sumido.
  await page.waitForTimeout(6000)
  await expect(card).toBeVisible()
  await inViewport(page, 'evidence-card')
  const overflow = await card.evaluate((el) => {
    const bad: string[] = []
    el.querySelectorAll<HTMLElement>('*').forEach((n) => {
      if (n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).display !== 'inline') bad.push(n.className)
    })
    return { self: el.scrollWidth - el.clientWidth, bad }
  })
  expect(overflow.self).toBeLessThanOrEqual(1)
  expect(overflow.bad).toEqual([])
  // Fechar mostra o próximo da fila (ou nada), sem travar a mesa.
  await page.getByTestId('evidence-card-close').click()
  await openHubObject(page, 'notebook')
  await expect(page.getByTestId('casebook')).toBeVisible()
})

test('bancada: mais novo primeiro, selo NOVO até abrir, filtros e rolagem própria', async ({ page }) => {
  await newGame(page)
  await dev(page, 'b04-start', 'b04-hex-received')
  await openHubObject(page, 'audio-station')
  const list = page.getByTestId('audio-file-list')
  await expect(list).toBeVisible()
  const items = list.locator('li')
  const first = items.first().locator('[data-testid^="audio-file-"]')
  await expect(first).toHaveAttribute('data-testid', 'audio-file-hex_audio_f')
  await expect(page.getByTestId('audio-new-hex_audio_f')).toBeVisible()

  const before = await items.count()
  await page.getByTestId('audio-filter-new').click()
  const newCount = await items.count()
  expect(newCount).toBeGreaterThan(0)
  expect(newCount).toBeLessThanOrEqual(before)

  await page.getByTestId('audio-file-hex_audio_f').click()
  await expect(page.getByTestId('audio-new-hex_audio_f')).toHaveCount(0)
  await expect(items).toHaveCount(newCount - 1)
  await page.getByTestId('audio-filter-all').click()
  await expect(items).toHaveCount(before)

  const overflowY = await list.evaluate((el) => {
    let n: HTMLElement | null = el
    while (n && n !== document.body) {
      const o = getComputedStyle(n).overflowY
      if (o === 'auto' || o === 'scroll') return o
      n = n.parentElement
    }
    return 'visible'
  })
  expect(['auto', 'scroll']).toContain(overflowY)
  await inViewport(page, 'hub-audio-lab')
  await closeHub(page)
})

test('caderno: abas fixas e conteúdo com rolagem independente', async ({ page }) => {
  await newGame(page)
  await dev(page, 'b04-start')
  await openHubObject(page, 'notebook')
  const nb = page.getByTestId('casebook')
  await expect(nb).toBeVisible()
  await inViewport(page, 'casebook')
  await nb.getByRole('button', { name: /Hip.teses/ }).click()
  const scroller = nb.locator('.nb-scroll').first()
  const style = await scroller.evaluate((el) => getComputedStyle(el).overflowY)
  expect(['auto', 'scroll']).toContain(style)
  const tab = nb.getByRole('button').first()
  const y0 = (await tab.boundingBox())!.y
  await scroller.evaluate((el) => el.scrollTo(0, 10_000))
  const y1 = (await tab.boundingBox())!.y
  expect(Math.abs(y1 - y0)).toBeLessThan(2)
})

test('entrada de cena: cabeçalho digitado, pulável, não bloqueia a mesa', async ({ page }) => {
  await newGame(page)
  await dev(page, 'b04-start', 'b04-samuel-ready', 'b04-after-samuel', 'b04-andre-ready')
  await openHubObject(page, 'wall-map')
  await page.getByTestId('map-pin-presidio').click()
  await page.getByTestId('visit-presidio').click()
  const intro = page.getByTestId('vn-intro')
  await expect(intro).toBeVisible()
  await expect(intro).toContainText('21:37', { timeout: 6000 })
  await expect(intro).toContainText('PENITENCIÁRIA ESTADUAL — SALA DE VISITAS', { timeout: 6000 })
  await page.getByTestId('vn-intro-skip').click()
  await expect(page.getByTestId('andre-scene')).toBeVisible()
  // Sair devolve a mesa (nunca corta direto para outra cena).
  await page.getByTestId('andre-scene').getByRole('button', { name: 'Sair' }).click()
  const skip = page.getByTestId('reflection-skip')
  if (await skip.isVisible().catch(() => false)) await skip.click()
  await expect(page.getByTestId('scene-runner')).toBeHidden({ timeout: 8000 })
  await expect(page.getByTestId('investigation-scene')).toBeVisible()
})

test('celulares: layouts normais, apps inertes não bloqueiam nem mostram "BLOQUEADO"', async ({ page }) => {
  await newGame(page)
  for (const device of ['augusto-phone', 'mariana-phone']) {
    await openHubObject(page, device)
    await expect(page.getByTestId('phone-home')).toBeVisible()
    await inViewport(page, 'phone-shell')
    const apps = page.locator('[data-testid^="app-"]')
    expect(await apps.count()).toBeGreaterThanOrEqual(12)
    await expect(page.getByText(/bloqueado/i)).toHaveCount(0)
    await page.getByTestId('app-weather').click()
    await expect(page.getByTestId('phone-shell')).toBeVisible()
    await expect(page.getByText(/bloqueado/i)).toHaveCount(0)
    await closePhone(page)
  }
})

test('fila de descobertas: avisos curtos empilham sem cobrir a mesa inteira', async ({ page }) => {
  await newGame(page)
  await dev(page, 'b02-start')
  await openHubObject(page, 'mariana-phone')
  await page.getByTestId('app-notes').click()
  await page.getByTestId('note-row-n-quarta').click()
  await closePhone(page)
  const layer = page.getByTestId('discovery-layer')
  await expect(layer).toBeVisible({ timeout: 8000 })
  await inViewport(page, 'discovery-layer')
  const box = (await layer.boundingBox())!
  expect(box.width).toBeLessThanOrEqual(400)
  // A mesa continua clicável com o aviso aberto.
  await openHubObject(page, 'wall-map')
  await expect(page.getByTestId('hub-map')).toBeVisible()
  await closeHub(page)
})

test('viagem não tem corte seco: mapa → intro → cena', async ({ page }) => {
  await newGame(page)
  await dev(page, 'b01-hospital-open')
  await travelTo(page, 'hospital', 'hospital-scene')
  await expect(page.getByTestId('scene-runner')).toHaveAttribute('data-phase', 'scene')
})
