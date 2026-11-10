import { expect, test } from '@playwright/test'
import { closeHub, dev, newGame, openHubObject, readSave } from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

/** E2E enxuto: entrada, Sandra pelos autos, Enceladus→Ricardo→Henrique via checkpoints. */
test('Bloco 7 — Miro2, Sandra, Puzzle 8/9, estado final', async ({ page }) => {
  test.setTimeout(120_000)
  await newGame(page)
  await dev(page, 'b07-start')

  let save = await readSave(page)
  expect(save.flags.block07_started).toBe(true)
  expect(save.locations['detencao-miro'].status).toBe('visitAvailable')
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_press_miro_further')).toBe(true)

  await dev(page, 'b07-after-miro2')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('miro_descended_fall_area')
  expect(save.flags.block07_sandra_search_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('sandra')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-sandra-ficha')).toBeVisible()
  await page.getByTestId('search-open-doc-sandra-ficha').click()
  await closeHub(page)

  save = await readSave(page)
  expect(save.locations['sandra-casa'].status).toBe('visitAvailable')

  await dev(page, 'b07-sandra-ready', 'b07-after-sandra', 'b07-morsa-memory', 'b07-enceladus-done')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('anon_audio_ricardo_name')
  expect(save.flags.block07_julia_ricardo_audio_unlocked).toBe(true)

  await dev(page, 'b07-ricardo-henrique', 'b07-henrique-trail', 'b07-after-cecilia', 'b07-end')
  save = await readSave(page)
  expect(save.flags.block07_complete).toBe(true)
  expect(save.evidenceOwned).toContain('henrique_two_rtp_sessions')
  expect(save.hypotheses.hyp_unknown_tech_origin).toBeTruthy()
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_identify_morsa')).toBe(true)
  expect(
    save.tasks.some((t: { id: string }) => t.id === 'task_compare_henrique_mariana_system'),
  ).toBe(true)
})
