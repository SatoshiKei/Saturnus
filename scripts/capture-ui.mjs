/**
 * Captura de telas da interface (sala, hover, computador, celulares, telefone fixo,
 * caderno, mapa, pasta, áudio) em várias resoluções.
 *
 * Uso: node scripts/capture-ui.mjs [baseUrl] [outDir] [WxH,WxH,...]
 * Ex.:  node scripts/capture-ui.mjs http://localhost:5173 docs/assets/ui-refactor 1920x1080,1600x900,1366x768
 *
 * Requer o servidor de dev (ou preview) ativo. O painel DEV é usado para liberar
 * evidências e abrir o áudio protegido, de modo que as telas mostrem conteúdo real.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const base = process.argv[2] ?? 'http://localhost:5173'
const outRoot = process.argv[3] ?? 'docs/assets/ui-refactor'
const sizes = (process.argv[4] ?? '1920x1080,1600x900,1366x768').split(',').map((s) => {
  const [w, h] = s.split('x').map(Number)
  return { w, h }
})

const browser = await chromium.launch()

for (const { w, h } of sizes) {
  const dir = join(outRoot, `${w}x${h}`)
  await mkdir(dir, { recursive: true })
  const ctx = await browser.newContext({ viewport: { width: w, height: h } })
  const page = await ctx.newPage()
  const shot = (name) => page.screenshot({ path: join(dir, `${name}.png`) })
  const wait = (ms) => page.waitForTimeout(ms)

  // tela de título e primeira vez (com legendas)
  await page.goto(base)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await wait(700)
  await shot('00-menu')
  await page.getByTestId('main-menu-new').click()
  await wait(2200)
  await shot('01-room-first-time')

  // sala sem dicas
  await page.evaluate(() => localStorage.setItem('saturnus-ui-hints-v1', '1'))
  await page.reload()
  await wait(500)
  if (await page.getByTestId('main-menu').count()) await page.getByTestId('main-menu-continue').click()
  await wait(900)
  await shot('02-room')

  const closeHub = async () => {
    await page.getByTestId('hub-close').click()
    await wait(450)
  }

  // hover no celular de Mariana
  await page.getByTestId('scene-mariana-phone').hover()
  await wait(350)
  await shot('03-hover-phone')
  await page.mouse.move(5, 5)

  // evidências extras para telas ricas
  const dev = page.getByTestId('dev-panel-open')
  if (await dev.count()) {
    await dev.click()
    await page.getByTestId('dev-discover-mariana-password').click()
    await page.getByText('+ evidências contradição demo').click()
    await page.getByTestId('dev-panel-close').click()
  }

  // computador
  await page.getByTestId('scene-monitor').click()
  await wait(700)
  await shot('04-computer')
  await page.getByTestId('police-search-input').fill('mariana')
  await page.getByTestId('police-search-submit').click()
  await wait(300)
  await shot('04b-computer-search')
  await closeHub()

  // telefone fixo
  await page.getByTestId('scene-landline').click()
  await wait(700)
  await shot('05-landline')
  await closeHub()

  // celular de Mariana
  await page.getByTestId('scene-mariana-phone').click()
  await wait(500)
  await shot('06-mariana-phone')
  await page.getByTestId('phone-close').click()
  await wait(300)

  // celular de Augusto
  await page.getByTestId('scene-augusto-phone').click()
  await wait(500)
  await shot('07-augusto-phone')
  await page.getByTestId('phone-close').click()
  await wait(300)

  // caderno
  await page.getByTestId('scene-notebook').click()
  await wait(700)
  await shot('08-notebook-people')
  await page.getByRole('button', { name: 'Evidências' }).click()
  await wait(200)
  await shot('08b-notebook-evidence')
  await page.getByRole('button', { name: 'Timeline' }).click()
  await wait(200)
  await shot('08c-notebook-timeline')
  await closeHub()

  // mapa
  await page.getByTestId('scene-wall-map').click()
  await wait(700)
  await page.getByTestId('map-pin-delegacia').click()
  await shot('09-map')
  await closeHub()

  // pasta do caso
  await page.getByTestId('scene-evidence-box').click()
  await wait(700)
  await shot('10-case-files')
  await page.getByTestId('case-files-list').getByRole('button').first().click()
  await wait(250)
  await shot('10b-case-document')
  await closeHub()

  // áudio
  await page.getByTestId('scene-audio-station').click()
  await wait(700)
  await shot('11-audio')
  await closeHub()

  // bloco de pendências aberto
  await page.getByTestId('notepad-toggle').click()
  await wait(400)
  await shot('12-notepad')

  await ctx.close()
  console.log(`✓ ${w}x${h}`)
}

await browser.close()
