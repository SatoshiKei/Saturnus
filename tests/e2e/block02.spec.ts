import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vnLeaveScene, vnPlayTopic } from './vnHelpers'

const block02Shots = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../artifacts/ui/block02')

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

test('Bloco 2 — duas trilhas até convergência', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await dismissMenu(page)

  await page.getByTestId('dev-panel-open').click()
  await page.getByTestId('dev-b02-start').click()
  await page.getByTestId('dev-panel-close').click()

  await page.getByTestId('scene-augusto-phone').click()
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-rafael').click()
  await page.getByRole('button', { name: 'Reproduzir áudio' }).click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-audio-station').click()
  await page.getByRole('button', { name: /rafael_forward/i }).click()
  await page.getByTestId('rafael-forward-provisional-analysis').click()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-wall-map').click()
  await page.getByTestId('map-pin-vertice').click()
  await page.getByTestId('visit-vertice').click()
  await expect(page.getByTestId('vertice-scene')).toBeVisible()
  for (const label of [
    'Falar com Iara',
    'Falar com Sandro',
    'Falar com Caio',
    'Perguntar a Sandro sobre o interesse de Mariana',
  ]) {
    await vnPlayTopic(page, label, 'vertice-scene')
  }
  await vnPlayTopic(page, 'Consultar arquivos antigos', 'vertice-scene')
  await vnLeaveScene(page, 'vertice-scene')

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-notes').click()
  await page.getByTestId('note-row-n-quarta').click()
  await expect(page.getByTestId('note-view')).toBeVisible()
  await page.getByTestId('note-view').getByRole('button', { name: 'Voltar' }).click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-augusto-phone').click()
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-paula').click()
  await expect(page.getByText('Moreira.', { exact: true })).toBeVisible()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Pessoas' }).click()
  await page.getByTestId('lucas-interview-open').click()
  await expect(page.getByTestId('lucas-scene')).toBeVisible()
  for (const label of [
    'Como Mariana o procurou',
    'Elisa Duarte',
    'Relação com Elisa e André',
    'André Silva e a condenação',
    'O que Mariana perguntou',
  ]) {
    await vnPlayTopic(page, label, 'lucas-scene')
  }
  await vnLeaveScene(page, 'lucas-scene')
  await vnLeaveScene(page, 'lucas-scene')

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Busca' }).click()
  await page.getByTestId('police-search-input').fill('Elisa Duarte')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByText('Nicolas “Nico”')).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('notepad-toggle').click()
  await expect(page.getByText('Localizar Nico — testemunha do caso Elisa')).toBeVisible()
  await page.screenshot({ path: path.join(block02Shots, '01-end-state.png'), fullPage: true })
})
