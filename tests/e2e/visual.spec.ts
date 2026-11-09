import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Teste visual: percorre a sala e cada interface em 3 resoluções, salva screenshots em
 * artifacts/ui/<resolução>/ e verifica que nada fica cortado ou fora do quadro.
 */
const root = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(root, '..', '..', 'artifacts', 'ui')

const sizes = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1366, height: 768 },
]

async function expectInside(page: Page, testId: string) {
  const box = await page.getByTestId(testId).boundingBox()
  const vp = page.viewportSize()!
  expect(box, `${testId} visível`).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.y, testId).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width, testId).toBeLessThanOrEqual(vp.width + 1)
  expect(box!.y + box!.height, testId).toBeLessThanOrEqual(vp.height + 1)
}

for (const size of sizes) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size })

    test('sala e interfaces diegéticas', async ({ page }) => {
      const dir = path.join(out, `${size.width}x${size.height}`)
      const shot = (name: string) => page.screenshot({ path: path.join(dir, `${name}.png`) })

      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('saturnus-ui-hints-v1', '1'))
      await page.reload()
      if (await page.getByTestId('main-menu').count()) {
        const cont = page.getByTestId('main-menu-continue')
        if (await cont.isVisible().catch(() => false)) await cont.click()
        else await page.getByTestId('main-menu-new').click()
      }
      await expect(page.getByTestId('investigation-scene')).toBeVisible()

      // todos os objetos interativos presentes e dentro da tela
      for (const id of [
        'scene-monitor',
        'scene-notebook',
        'scene-evidence-box',
        'scene-audio-station',
        'scene-landline',
        'scene-wall-map',
        'scene-mariana-phone',
        'scene-augusto-phone',
      ]) {
        await expectInside(page, id)
      }
      await shot('01-room')

      await page.getByTestId('scene-mariana-phone').hover()
      await page.waitForTimeout(250)
      await shot('02-hover-phone')
      await page.mouse.move(2, 2)

      const panels: { object: string; panel: string; name: string }[] = [
        { object: 'scene-monitor', panel: 'hub-computer', name: '03-computer' },
        { object: 'scene-landline', panel: 'hub-landline', name: '06-landline' },
        { object: 'scene-notebook', panel: 'hub-casebook', name: '07-notebook' },
        { object: 'scene-wall-map', panel: 'hub-map', name: '08-map' },
        { object: 'scene-evidence-box', panel: 'hub-case-files', name: '09-case-files' },
        { object: 'scene-audio-station', panel: 'hub-audio-lab', name: '10-audio' },
      ]
      for (const p of panels) {
        await page.getByTestId(p.object).click()
        await expect(page.getByTestId(p.panel)).toBeVisible()
        await page.waitForTimeout(450)
        await expectInside(page, p.panel)
        await shot(p.name)
        await page.getByTestId('hub-close').click()
        await expect(page.getByTestId(p.panel)).toHaveCount(0)
      }

      // dois celulares distintos
      await page.getByTestId('scene-mariana-phone').click()
      await expect(page.getByTestId('phone-shell')).toHaveAttribute('data-device', 'mariana')
      await expectInside(page, 'phone-shell')
      await page.waitForTimeout(350)
      await shot('04-mariana-phone')
      await page.getByTestId('phone-close').click()

      await page.getByTestId('scene-augusto-phone').click()
      await expect(page.getByTestId('phone-shell')).toHaveAttribute('data-device', 'augusto')
      await page.waitForTimeout(350)
      await shot('05-augusto-phone')
      await page.getByTestId('phone-close').click()

      // pendências: aba fechada, folha aberta
      await page.getByTestId('notepad-toggle').click()
      await page.waitForTimeout(350)
      await shot('11-notepad')
      await expect(page.getByTestId('objectives-strip')).toContainText('CASO MARIANA SILVA')
    })
  })
}
