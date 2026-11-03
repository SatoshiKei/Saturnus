import { expect, test, type Page } from '@playwright/test'

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

test('Bloco 1 — fluxo principal', async ({ page }) => {
  await page.goto('/')
  await dismissMenu(page)
  await expect(page.getByTestId('investigation-scene')).toBeVisible()

  await page.getByTestId('scene-evidence-box').click()
  await expect(page.getByTestId('hub-case-files')).toBeVisible()
  await page.getByTestId('case-files-list').getByRole('button').first().click()
  await page.getByTestId('extract-b1').click()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-audio-station').click()
  await expect(page.getByTestId('hub-audio-lab')).toBeVisible()
  await page.getByTestId('emergency-provisional-analysis').click()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-julia').click()
  await page.getByRole('button', { name: 'Voltar à lista' }).click()
  await page.getByTestId('chat-row-rafael').click()
  await page.getByRole('button', { name: 'Reproduzir áudio' }).click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-notebook').click()
  await page.getByRole('button', { name: 'Contradições' }).click()
  await page.getByLabel('Evidência A').selectOption('mariana_memory_lapses')
  await page.getByLabel('Evidência B').selectOption('rafael_call_memory')
  await page.getByTestId('contradiction-submit').click()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-wall-map').click()
  await page.getByTestId('map-pin-hospital').click()
  await page.getByTestId('visit-hospital').click()
  await expect(page.getByTestId('hospital-scene')).toBeVisible()

  const topics = [
    'Última vez que viram Mariana',
    'Comportamento recente',
    'Falhas de memória',
    'Pasta guardada por Júlia',
    'Conversar com Camila a sós',
  ]
  const { vnPlayTopic, vnLeaveScene } = await import('./vnHelpers')
  for (const label of topics) {
    await vnPlayTopic(page, label, 'hospital-scene')
  }
  await vnLeaveScene(page, 'hospital-scene')
  await vnLeaveScene(page, 'hospital-scene')

  await page.getByTestId('scene-augusto-phone').click()
  await expect(page.getByTestId('phone-shell')).toBeVisible()
  await page.getByTestId('app-whatsapp').click()
  await expect(page.getByTestId('chat-row-rafael')).toBeVisible()
  await page.getByTestId('phone-close').click()
})
