import { expect, test } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeHub, closePhone, dev, newGame, openAugustoPhone, openHubObject, searchAndOpen } from './helpers'

/**
 * Capturas de revisão da revisão transversal (Blocos 1–4). Saída: docs/assets/transversal-review/.
 * Não verificam regras de jogo (isso é feito nos outros specs); só guardam o estado visual.
 */
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'assets', 'transversal-review')

test.use({ viewport: { width: 1920, height: 1080 } })

test('capturas: descobertas, bancada, caderno, computador, fixo, PIN, VN', async ({ page }) => {
  test.setTimeout(240_000)
  const shot = (name: string) => page.screenshot({ path: path.join(out, `${name}.png`) })

  await newGame(page)
  await openHubObject(page, 'mariana-phone')
  await closePhone(page)
  await expect(page.getByTestId('evidence-card')).toBeVisible()
  await page.waitForTimeout(500)
  await shot('01-cartao-evidencia')
  await page.getByTestId('evidence-card-close').click()

  await openAugustoPhone(page)
  await shot('02-celular-augusto-home')
  await closePhone(page)
  await openHubObject(page, 'mariana-phone')
  await shot('03-celular-mariana-home')
  await closePhone(page)

  await dev(page, 'b04-start', 'b04-chronology-done', 'b04-hex-received')
  await openHubObject(page, 'audio-station')
  await page.getByTestId('audio-file-hex_audio_a').click()
  await page.waitForTimeout(300)
  await shot('04-bancada-seis-audios')
  await closeHub(page)

  await openHubObject(page, 'notebook')
  await shot('05-caderno')
  await closeHub(page)

  await searchAndOpen(page, 'Maralto', 'doc-protesto-detidos')
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('Samuel')
  await page.getByTestId('police-search-submit').click()
  await page.waitForTimeout(300)
  await shot('06-computador-consulta')
  await closeHub(page)

  await dev(page, 'b04-hex-done', 'b04-hidden-app')
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-pericia').click()
  await page.getByTestId('forensic-open-package').click()
  await page.waitForTimeout(300)
  await shot('07-pericia-tela-pin')
  await closeHub(page)

  await openHubObject(page, 'landline')
  await shot('08-telefone-fixo')
  await closeHub(page)

  await dev(page, 'b04-andre-ready')
  await openHubObject(page, 'wall-map')
  await page.getByTestId('map-pin-presidio').click()
  await page.getByTestId('visit-presidio').click()
  await expect(page.getByTestId('vn-intro')).toContainText('SALA DE VISITAS', { timeout: 6000 })
  await shot('09-vn-entrada')
  await page.getByTestId('vn-intro-skip').click()
  await expect(page.getByTestId('andre-scene')).toBeVisible()
  await page.waitForTimeout(400)
  await shot('10-vn-andre')
})
