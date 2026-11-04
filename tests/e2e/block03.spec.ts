import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vnLeaveScene, vnPlayTopic } from './vnHelpers'

const block03Shots = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../artifacts/ui/block03')

test.use({ viewport: { width: 1920, height: 1080 } })

async function dismissMenu(page: Page) {
  const menu = page.getByTestId('main-menu')
  if (await menu.isVisible()) {
    await page.getByTestId('main-menu-new').click()
  }
  const opening = page.getByTestId('block01-opening')
  if (await opening.isVisible()) {
    await expect(opening).toBeHidden({ timeout: 8000 })
  }
}

test('Bloco 3 — Nico até Morsa', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await dismissMenu(page)

  await page.getByTestId('dev-panel-open').click()
  await page.getByTestId('dev-b03-start').click()
  await page.getByTestId('dev-panel-close').click()

  await page.getByTestId('notepad-toggle').click()
  await expect(page.getByText('Localizar Nico — testemunha do caso Elisa')).toBeVisible()
  await page.getByTestId('notepad-toggle').click()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Busca' }).click()
  await page.getByTestId('police-search-input').fill('Nico')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByText(/Cadastro atual/i)).toBeVisible()
  await page.getByRole('button', { name: 'Pessoas' }).click()
  await page.getByTestId('nico-interview-open').click()
  await expect(page.getByTestId('nico-scene')).toBeVisible()
  for (const label of [
    'Elisa Duarte',
    'A Noite X no Vértice',
    'Visita de Mariana',
    'O que ela queria saber',
    'Registros sonoros',
  ]) {
    await vnPlayTopic(page, label, 'nico-scene')
  }
  await vnLeaveScene(page, 'nico-scene')

  await page.getByTestId('scene-audio-station').click()
  await page.getByRole('button', { name: /VERTICE_BOOTH|cabine/i }).click()
  await expect(page.getByTestId('janus-provisional-panel')).toBeVisible()
  await page.getByTestId('janus-provisional-sync').click()
  await expect(page.getByText(/não sincronizado/i)).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-files').click()
  await page.getByRole('button', { name: 'Downloads' }).click()
  await page.getByTestId('mariana-maralto-file').click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Busca' }).click()
  await page.getByTestId('police-search-input').fill('Maralto')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByRole('heading', { name: /Cobertura histórica/i })).toBeVisible()
  await page.getByTestId('police-search-input').fill('Maralto Elisa')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByRole('heading', { name: /Cruzamento Maralto/i })).toBeVisible()
  await page.getByTestId('police-search-input').fill('Livia')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByRole('heading', { name: /Lívia Serrano — contato/i })).toBeVisible()
  await page.getByRole('button', { name: 'Pessoas' }).click()
  await page.getByTestId('livia-interview-open').click()
  await expect(page.getByTestId('livia-scene')).toBeVisible()
  for (const label of [
    'Contato com Mariana',
    'O que ela queria da Maralto',
    'Protestos de seis anos atrás',
    'Arquivos originais',
    'Material bruto preservado',
  ]) {
    await vnPlayTopic(page, label, 'livia-scene')
  }
  await vnLeaveScene(page, 'livia-scene')

  await page.getByTestId('scene-audio-station').click()
  await page.getByRole('button', { name: /RADIO_PROTEST|radiofônica|bruto/i }).click()
  await expect(page.getByTestId('saturnalia-provisional-panel')).toBeVisible()
  await page.getByTestId('saturnalia-provisional-rebuild').click()
  await expect(page.getByTestId('saturnalia-provisional-panel').getByText(/Morsa/i)).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('notepad-toggle').click()
  await expect(
    page.getByText('Descobrir quem era Morsa e por que Mariana investigava os protestos'),
  ).toBeVisible()
  await page.screenshot({ path: path.join(block03Shots, '01-end-state.png'), fullPage: true })
})
