import { expect, test } from '@playwright/test'
import { closeHub, dev, newGame, openHubObject, readSave, waitForNotice } from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

/** E2E enxuto: entrada, Geraldo pelos autos, trilha Válter→Miro, G17N via checkpoint. */
test('Bloco 6 — Geraldo pelos autos, Válter→Miro, G17N, estado final', async ({ page }) => {
  test.setTimeout(120_000)
  await newGame(page)
  await dev(page, 'b06-start')

  let save = await readSave(page)
  expect(save.flags.block06_started).toBe(true)
  expect(save.flags.block06_geraldo_search_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('geraldo')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-geraldo-ficha')).toBeVisible()
  await page.getByTestId('search-open-doc-geraldo-ficha').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
  await waitForNotice(page, 'discovery-location')
  save = await readSave(page)
  expect(save.locations['geraldo-casa'].status).toBe('visitAvailable')

  await openHubObject(page, 'wall-map')
  await page.getByTestId('map-pin-geraldo-casa').click()
  await expect(page.getByTestId('visit-geraldo-casa')).toBeVisible()
  await closeHub(page)

  await dev(page, 'b06-geraldo-ready', 'b06-after-geraldo', 'b06-after-jana2')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('jana_feared_valter_people')
  expect(save.flags.block06_valter_search_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('valter')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-valter-associados')).toBeVisible()
  await page.getByTestId('search-open-doc-valter-associados').click()
  await closeHub(page)

  await dev(page, 'b06-valter-trail', 'b06-pastor-done')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('pastor_token_g17n')
  expect(save.locations['galpao-17'].status).toBe('visitAvailable')

  await dev(page, 'b06-after-operation', 'b06-end')
  save = await readSave(page)
  expect(save.flags.block06_complete).toBe(true)
  expect(save.evidenceOwned).toContain('miro_followed_elisa_by_mistake')
  expect(save.hypotheses.hyp_miro_followed_to_fall).toBeTruthy()
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_press_miro_further')).toBe(true)
})
