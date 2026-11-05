import { expect, test } from '@playwright/test'
import { closeHub, dev, newGame, openHubObject, readSave } from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

/** E2E enxuto: entrada, Puzzle 10 via checkpoint, veículo/Mauro, escala → fim. */
test('Bloco 8 — Morsa=André, acidente, Augusto na cadeia, estado final', async ({ page }) => {
  test.setTimeout(120_000)
  await newGame(page)
  await dev(page, 'b08-start')

  let save = await readSave(page)
  expect(save.flags.block08_started).toBe(true)
  expect(save.flags.block08_rings_available).toBe(true)
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_identify_morsa')).toBe(true)

  await dev(page, 'b08-rings-done')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('morsa_was_andre')
  expect(save.locations.presidio.status).toBe('visitAvailable')

  await dev(page, 'b08-after-andre2', 'b08-after-miro3')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('guardrail_impact_signs')
  expect(save.flags.block08_vehicle_search_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('guardrail')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-camera-veiculo-madrugada')).toBeVisible({
    timeout: 10_000,
  })
  await closeHub(page)

  await dev(page, 'b08-mauro-denis', 'b08-bia-rui', 'b08-rotation-done')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('approach_callsign_reconstructed')
  expect(save.flags.block08_scale_search_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('vtr-14')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-escala-vtr14')).toBeVisible()
  await closeHub(page)

  await dev(page, 'b08-end')
  save = await readSave(page)
  expect(save.flags.block08_complete).toBe(true)
  expect(save.flags.block09_entry_ready).toBe(true)
  expect(save.evidenceOwned).toContain('scale_links_callsign_to_augusto')
  expect(save.hypotheses.hyp_elisa_died_accident).toBeTruthy()
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_how_mariana_knew')).toBe(true)
})
