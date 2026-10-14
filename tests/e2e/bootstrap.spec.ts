import { expect, test } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const shots = path.join(root, '..', '..', 'artifacts', 'saturnus-bootstrap')

test.use({ viewport: { width: 1920, height: 1080 } })

test('SATURNUS bootstrap flow and screenshots', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('investigation-scene')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '01-investigation-room.png'), fullPage: true })

  await page.getByTestId('desk-phone').click()
  await expect(page.getByTestId('phone-overlay')).toBeVisible()
  await expect(page.getByTestId('phone-shell')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '02-phone-open.png'), fullPage: true })

  await expect(page.getByTestId('phone-home')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '03-phone-home.png'), fullPage: true })

  await page.getByTestId('app-whatsapp').click()
  await expect(page.getByTestId('whatsapp-home')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '04-whatsapp-chat-list.png'), fullPage: true })

  await page.getByTestId('chat-row-mariana').click()
  await expect(page.getByTestId('whatsapp-chat-view')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '05-whatsapp-conversation.png'), fullPage: true })

  const audioPlay = page.getByTestId('audio-message').getByRole('button', { name: /Reproduzir áudio/i })
  await audioPlay.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(shots, '06-whatsapp-audio.png'), fullPage: true })

  await page.getByRole('button', { name: 'Voltar à lista' }).click()
  await page.getByTestId('whatsapp-home').getByRole('button', { name: 'Voltar' }).click()

  await page.getByTestId('app-notes').click()
  await expect(page.getByTestId('notes-home')).toBeVisible()
  await page.getByTestId('note-row-n1').click()
  await expect(page.getByTestId('note-view')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '07-notes.png'), fullPage: true })
  await page.getByTestId('note-view').getByRole('button', { name: 'Voltar' }).click()
  await page.getByTestId('notes-home').getByRole('button', { name: /Início/i }).click()

  await page.getByTestId('app-calendar').click()
  await expect(page.getByTestId('calendar-home')).toBeVisible()
  await page.getByTestId('calendar-event-ev-jana').click()
  await expect(page.getByTestId('calendar-event-view')).toBeVisible()
  await page.screenshot({ path: path.join(shots, '08-calendar.png'), fullPage: true })

  await page.getByTestId('phone-close').click()
  await expect(page.getByTestId('phone-overlay')).toHaveCount(0)
  await expect(page.getByTestId('investigation-scene')).toBeVisible()
})
