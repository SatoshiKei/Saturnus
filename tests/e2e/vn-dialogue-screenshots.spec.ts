import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vnAdvanceSteps, vnDrainTopic, vnOpenNvl, vnPlayTopic } from './vnHelpers'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../artifacts/ui/vn-dialogue-refactor')

async function dismissMenu(page: Page) {
  const menu = page.getByTestId('main-menu')
  if (await menu.isVisible()) await page.getByTestId('main-menu-new').click()
  const opening = page.getByTestId('block01-opening')
  if (await opening.isVisible()) await expect(opening).toBeHidden({ timeout: 8000 })
}

async function openHospital(page: Page) {
  await page.goto('/')
  await dismissMenu(page)
  await page.getByTestId('dev-panel-open').click()
  await page.getByTestId('dev-b01-hospital-open').click()
  await page.getByTestId('dev-panel-close').click()
  await page.getByTestId('scene-wall-map').click()
  await page.getByTestId('map-pin-hospital').click()
  await page.getByTestId('visit-hospital').click()
  await expect(page.getByTestId('hospital-scene')).toBeVisible()
}

async function startTopic(page: Page, label: string) {
  await page.getByTestId('hospital-scene').getByRole('button', { name: label, exact: true }).click()
  await expect(page.getByTestId('vn-advance-zone')).toBeVisible()
}

for (const { width, height, tag } of [
  { width: 1920, height: 1080, tag: '1920x1080' },
  { width: 1600, height: 900, tag: '1600x900' },
  { width: 1366, height: 768, tag: '1366x768' },
]) {
  test.describe(`${tag} VN dialogue`, () => {
    test.use({ viewport: { width, height } })

    test('ADV, choices, NVL states', async ({ page }) => {
      test.setTimeout(180_000)
      const out = path.join(root, tag)
      await openHospital(page)

      await page.screenshot({ path: path.join(out, '04-choices-five.png'), fullPage: true })

      await startTopic(page, 'Comportamento recente')
      await page.screenshot({ path: path.join(out, '01-adv-short.png'), fullPage: true })

      await page.getByTestId('hospital-scene').getByRole('button', { name: 'Sair' }).click()
      await openHospital(page)

      await vnPlayTopic(page, 'Última vez que viram Mariana', 'hospital-scene')
      await vnPlayTopic(page, 'Comportamento recente', 'hospital-scene')
      await page.screenshot({ path: path.join(out, '03-choices-three.png'), fullPage: true })

      await startTopic(page, 'Falhas de memória')
      await vnAdvanceSteps(page, 'hospital-scene', 3)
      await page.screenshot({ path: path.join(out, '02-adv-multi-line.png'), fullPage: true })

      await vnAdvanceSteps(page, 'hospital-scene', 3)
      await vnOpenNvl(page)
      await expect(page.getByTestId('vn-nvl')).toBeVisible({ timeout: 3000 })
      await page.screenshot({ path: path.join(out, '05-nvl-three-speakers.png'), fullPage: true })

      await page.keyboard.press('Escape')
      await expect(page.getByTestId('vn-nvl')).toBeHidden()
      await vnAdvanceSteps(page, 'hospital-scene', 2)
      await vnOpenNvl(page)
      await expect(page.getByTestId('vn-nvl')).toBeVisible()
      await page.screenshot({ path: path.join(out, '06-nvl-page-full.png'), fullPage: true })
      await page.keyboard.press('Escape')

      await page.getByTestId('hospital-scene').getByRole('button', { name: 'Sair' }).click()

      await page.getByTestId('dev-panel-open').click()
      await page.getByTestId('dev-b02-vertice-unlocked').click()
      await page.getByTestId('dev-panel-close').click()
      await page.getByTestId('scene-wall-map').click()
      await page.getByTestId('map-pin-vertice').click()
      await page.getByTestId('visit-vertice').click()
      await expect(page.getByTestId('vertice-scene')).toBeVisible()
      await page.screenshot({ path: path.join(out, '08-scene-dark-bg.png'), fullPage: true })
      await page.getByTestId('vertice-scene').getByRole('button', { name: 'Sair' }).click()

      await page.getByTestId('dev-panel-open').click()
      await page.getByTestId('dev-b02-after-paula').click()
      await page.getByTestId('dev-panel-close').click()
      await page.getByTestId('scene-monitor').click()
      await page.getByRole('button', { name: 'Pessoas' }).click()
      await page.getByTestId('lucas-interview-open').click()
      await expect(page.getByTestId('lucas-scene')).toBeVisible()
      await page.screenshot({ path: path.join(out, '07-scene-light-bg.png'), fullPage: true })
      await page.getByTestId('lucas-scene').getByRole('button', { name: 'Sair' }).click()
    })
  })
}
