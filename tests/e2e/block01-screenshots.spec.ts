import { expect, test } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'assets', 'ui-refactor', '1920x1080')

test.use({ viewport: { width: 1920, height: 1080 } })

async function playBlock01ThroughHospital(page: import('@playwright/test').Page) {
  await page.getByTestId('scene-evidence-box').click()
  await page.getByTestId('case-files-list').getByRole('button').first().click()
  await page.getByTestId('extract-b1').click()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-audio-station').click()
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
}

test('Bloco 1 — screenshots de revisão', async ({ page }) => {
  await page.goto('/')
  if (await page.getByTestId('main-menu').isVisible()) {
    await page.getByTestId('main-menu-new').click()
  }
  if (await page.getByTestId('block01-opening').isVisible()) {
    await page.screenshot({ path: path.join(out, '01-room-first-time.png'), fullPage: true })
    await expect(page.getByTestId('block01-opening')).toBeHidden({ timeout: 8000 })
  }

  await playBlock01ThroughHospital(page)
  await page.screenshot({ path: path.join(out, '09-map.png'), fullPage: true })

  const topics = [
    'Última vez que viram Mariana',
    'Comportamento recente',
    'Falhas de memória',
    'Pasta guardada por Júlia',
    'Conversar com Camila a sós',
  ]
  const { vnPlayTopic } = await import('./vnHelpers')
  for (const label of topics) {
    await vnPlayTopic(page, label, 'hospital-scene')
  }
  await page.screenshot({ path: path.join(out, 'block01-hospital-julia.png'), fullPage: true })
  const { vnLeaveScene } = await import('./vnHelpers')
  await vnLeaveScene(page, 'hospital-scene')
  await vnLeaveScene(page, 'hospital-scene')

  await page.getByTestId('scene-evidence-box').click()
  await page.getByTestId('case-files-list').getByRole('button').first().click()
  await page.screenshot({ path: path.join(out, '10b-case-document.png'), fullPage: true })
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-audio-station').click()
  await page.screenshot({ path: path.join(out, '11-audio.png'), fullPage: true })
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-julia').click()
  await page.screenshot({ path: path.join(out, 'block01-wa-julia.png'), fullPage: true })
  await page.getByRole('button', { name: 'Voltar à lista' }).click()
  await page.getByTestId('whatsapp-home').getByRole('button', { name: /Início/i }).click()
  await page.getByTestId('app-notes').click()
  await page.getByTestId('note-row-n-quarta').click()
  await page.screenshot({ path: path.join(out, '12-notepad.png'), fullPage: true })
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-notebook').click()
  await page.getByRole('button', { name: 'Hipóteses' }).click()
  await page.screenshot({ path: path.join(out, '08c-notebook-timeline.png'), fullPage: true })
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-augusto-phone').click()
  await page.getByTestId('app-whatsapp').click()
  await page.screenshot({ path: path.join(out, '05-augusto-phone-rafael.png'), fullPage: true })
})
