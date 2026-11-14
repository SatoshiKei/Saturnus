import { expect, test } from '@playwright/test'
import {
  closeHub,
  callLandlineExt,
  dev,
  dismissEvidenceCards,
  newGame,
  openHubObject,
  readSave,
  searchAndOpen,
  waitForNotice,
} from './helpers'
import { completeJanusOnWorkbench } from './helpersForensic'

test.use({ viewport: { width: 1920, height: 1080 } })

test('Bloco 3 — Janus na bancada (sem UI provisional) + contradição de cronologia', async ({ page }) => {
  test.setTimeout(240_000)
  await newGame(page)
  // Após Nico: material na bancada sem nico_recording_portable / janus-provisional.
  await dev(page, 'b03-after-nico')
  let save = await readSave(page)
  expect(save.evidenceOwned).toContain('nico_recording_booth')
  expect(save.evidenceOwned).not.toContain('nico_recording_portable')

  await completeJanusOnWorkbench(page)
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.flags.block03_janus_done).toBe(true)

  await searchAndOpen(page, 'Elisa Duarte', 'doc-elisa-resumo')
  await dismissEvidenceCards(page)
  await callLandlineExt(page, '204')
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.documentsOwned).toContain('doc-elisa-cronologia')

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-autos').click()
  await page.getByTestId('pc-open-doc-elisa-cronologia').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
  await dismissEvidenceCards(page)
  await waitForNotice(page, 'discovery-contradiction')
  save = await readSave(page)
  expect(save.contradictionsConfirmed.some((c: { id: string }) => c.id === 'contra_vertice_clock')).toBe(
    true,
  )
})
