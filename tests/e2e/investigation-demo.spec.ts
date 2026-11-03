import { expect, test, type Page } from '@playwright/test'

test.use({ viewport: { width: 1920, height: 1080 } })

async function openDevPanel(page: Page) {
  const toggle = page.getByTestId('dev-panel-open')
  if (await toggle.isVisible()) await toggle.click()
}

async function devAction(page: Page, testId: string) {
  await openDevPanel(page)
  await page.getByTestId(testId).click()
}

async function closeDevPanel(page: Page) {
  const close = page.getByTestId('dev-panel-close')
  if (await close.isVisible()) await close.click()
}

test('investigation systems demo flow', async ({ page }) => {
  await page.goto('/')
  const menu = page.getByTestId('main-menu')
  if (await menu.isVisible()) {
    await page.getByTestId('main-menu-new').click()
  }

  await expect(page.getByTestId('investigation-scene')).toBeVisible()

  await page.getByTestId('scene-evidence-box').click()
  await expect(page.getByTestId('hub-case-files')).toBeVisible()
  await page.getByTestId('case-files-list').getByRole('button').first().click()
  await page.getByTestId('extract-b1').click()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await expect(page.getByTestId('phone-overlay')).toBeVisible()
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-julia').click()
  await page.getByRole('button', { name: 'Voltar à lista' }).click()
  await page.getByTestId('chat-row-rafael').click()
  await page.getByTestId('phone-close').click()

  await openDevPanel(page)
  await page.getByRole('button', { name: '+ evidências contradição demo' }).click()
  await closeDevPanel(page)
  await page.getByTestId('scene-notebook').click()
  await page.getByRole('button', { name: 'Contradições' }).click()
  await page.getByLabel('Evidência A').selectOption('julia_statement_memory')
  await page.getByLabel('Evidência B').selectOption('mariana_memory_audio')
  await page.getByTestId('contradiction-submit').click()
  await page.getByTestId('hub-close').click()

  await devAction(page, 'dev-discover-diary-password')
  await closeDevPanel(page)
  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-settings').click()
  await page.getByTestId('settings-show-hidden-apps').click()
  await page.getByRole('button', { name: '‹ Início' }).click()
  await page.getByTestId('app-hidden-diary').click()
  await page.getByTestId('diary-password-input').fill('demo-diary')
  await page.getByTestId('diary-password-submit').click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-recorder').click()
  await page.getByTestId('recorder-reveal-protected').click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-papers-stack').click()
  await expect(page.getByTestId('export-blocked-rafael_audio_protected')).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-monitor').click()
  await page.getByTestId('police-search-input').fill('wavelab')
  await page.getByTestId('police-search-submit').click()
  await page.getByTestId('hub-close').click()

  await devAction(page, 'dev-discover-mariana-password')
  await closeDevPanel(page)
  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-appstore').click()
  await page.getByTestId('app-store-search').fill('wavelab')
  await page.getByTestId('install-wavelab-mobile').click()
  await page.getByRole('button', { name: '‹ Início' }).click()
  await page.getByTestId('app-wavelab-mobile').click()
  await page.getByTestId('wavelab-noise-reduction').click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-notebook').click()
  const casebook = page.getByTestId('casebook')
  await casebook.getByRole('button', { name: 'Evidências' }).click()
  await expect(casebook).toContainText('processado')
  await casebook.getByRole('button', { name: 'Timeline' }).click()
  await expect(page.getByTestId('timeline-list')).toBeVisible()
  await page.getByTestId('hub-close').click()
})
