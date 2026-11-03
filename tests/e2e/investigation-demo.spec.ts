import { expect, test } from '@playwright/test'

/** Fluxo legado enxuto — smoke da cena após novo jogo. */
test.use({ viewport: { width: 1920, height: 1080 } })

test('hub abre pasta e caderno', async ({ page }) => {
  await page.goto('/')
  const menu = page.getByTestId('main-menu')
  if (await menu.isVisible()) {
    await page.getByTestId('main-menu-new').click()
  }
  const opening = page.getByTestId('block01-opening')
  if (await opening.isVisible()) {
    await expect(opening).toBeHidden({ timeout: 8000 })
  }

  await expect(page.getByTestId('investigation-scene')).toBeVisible()
  await page.getByTestId('scene-evidence-box').click()
  await expect(page.getByTestId('hub-case-files')).toBeVisible()
  await page.getByTestId('hub-close').click()
  await page.getByTestId('scene-notebook').click()
  await expect(page.getByTestId('casebook')).toBeVisible()
})
