import { expect, test } from '@playwright/test'
import { closeHub, dev, newGame, openHubObject } from './helpers'

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 2560, height: 1440 },
]

for (const vp of viewports) {
  test.describe(`bancada ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp })

    test('shell forense + smartphone cabem no viewport', async ({ page }) => {
      test.setTimeout(120_000)
      await newGame(page)
      await openHubObject(page, 'audio-station')
      await page.getByTestId('audio-file-emergency_call_raw').click()
      const bench = page.getByTestId('forensic-workbench')
      await expect(bench).toBeVisible()
      const box = await bench.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(-2)
      expect(box!.y).toBeGreaterThanOrEqual(-2)
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 2)
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 2)
      for (const tab of ['Process', 'Packets', 'Timing', 'Spectrum', 'Notes']) {
        await expect(page.getByRole('tab', { name: tab })).toBeVisible()
      }
      await closeHub(page)

      await openHubObject(page, 'mariana-phone')
      const phone = page.getByTestId('phone-shell')
      await expect(phone).toBeVisible()
      const pbox = await phone.boundingBox()
      expect(pbox).not.toBeNull()
      expect(pbox!.x + pbox!.width).toBeLessThanOrEqual(vp.width + 2)
      await page.getByTestId('phone-close').click()

      await dev(page, 'b09-end')
      await openHubObject(page, 'audio-station')
      await page.getByTestId('audio-file-mariana_recent_recording_claim').click()
      await expect(page.getByTestId('forensic-workbench')).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Memory' })).toHaveCount(0)
      await closeHub(page)
    })
  })
}
