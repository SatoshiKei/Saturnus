import { expect, test } from '@playwright/test'
import {
  closeHub,
  dev,
  dismissEvidenceCards,
  newGame,
  openHubObject,
  readSave,
  searchAndOpen,
  waitForNotice,
} from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

async function skipSoloReflection(page: import('@playwright/test').Page) {
  const layer = page.getByTestId('block05-solo-reflection')
  if (await layer.isVisible().catch(() => false)) {
    await page.getByTestId('reflection-skip').click()
    await expect(layer).toBeHidden({ timeout: 8000 })
  }
}

test('Bloco 5 — entrada, Jana pelos autos, revisão, cronologia, percurso, Geraldo', async ({ page }) => {
  test.setTimeout(240_000)
  await newGame(page)
  await dev(page, 'b05-start')

  let save = await readSave(page)
  expect(save.flags.block05_started).toBe(true)
  expect(save.locations.titan.status).toBe('visitAvailable')
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_press_nico')).toBe(true)

  // Segunda conversa com Nico (checkpoint: mesma progressão dos handlers da cena).
  await dev(page, 'b05-after-nico2')
  save = await readSave(page)
  expect(save.flags.block05_nico_followup_done).toBe(true)
  expect(save.evidenceOwned).toContain('nico_believes_jacket_jana')
  expect(save.flags.block05_jana_search_unlocked).toBe(true)

  // Jana pelos autos — sem botão automático de entrevista.
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('jana')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-elisa-jana')).toBeVisible()
  await page.getByTestId('search-open-doc-elisa-jana').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
  await waitForNotice(page, 'discovery-location')
  save = await readSave(page)
  expect(save.locations['jana-casa'].status).toBe('visitAvailable')
  expect(save.people.jana.status).toBe('located')

  await openHubObject(page, 'wall-map')
  await page.getByTestId('map-pin-jana-casa').click()
  await expect(page.getByTestId('visit-jana-casa')).toBeVisible()
  await closeHub(page)

  await dev(page, 'b05-after-jana')
  save = await readSave(page)
  expect(save.evidenceOwned).toContain('jana_confirms_jacket')
  expect(save.evidenceOwned).toContain('jana_loan_explanation')
  expect(save.flags.block05_elisa_review_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('elisa')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-elisa-argumento')).toBeVisible()
  await expect(page.getByTestId('search-open-doc-elisa-alibi')).toHaveCount(0)
  await page.getByTestId('search-open-doc-elisa-argumento').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await expect(page.getByText('Relação e discussão')).toBeVisible()
  await expect(page.getByText('Álibi e cronologia')).toBeVisible()
  await expect(page.getByText('Testemunhas')).toBeVisible()
  for (const section of ['sec-relacao', 'sec-alibi', 'sec-testemunhas']) {
    await page.getByTestId(`extract-${section}`).click()
    await dismissEvidenceCards(page)
  }
  await skipSoloReflection(page)
  await closeHub(page)
  await dismissEvidenceCards(page)
  await skipSoloReflection(page)
  save = await readSave(page)
  expect(save.flags.block05_elisa_review_done).toBe(true)
  expect(save.hypotheses.hyp_mariana_needed_brother).toBeTruthy()

  await skipSoloReflection(page)
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b05-weigh-maralto').click()
  await closeHub(page)
  await skipSoloReflection(page)
  save = await readSave(page)
  expect(save.flags.block05_chronology_action_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b05-organize-chronology').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await page.getByTestId('pc-doc-back').click()
  await page.getByTestId('b05-compare-files').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
  await dismissEvidenceCards(page)
  await skipSoloReflection(page) // coincidência
  save = await readSave(page)
  expect(save.flags.block05_emergency_revisit_unlocked).toBe(true)
  expect(save.documentsOwned).toContain('doc-mariana-contact-chronology')
  expect(save.documentsOwned).toContain('doc-phone-file-dependencies')

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b05-revisit-emergency').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
  await dismissEvidenceCards(page)
  await skipSoloReflection(page) // marco 50%

  save = await readSave(page)
  expect(save.flags.block05_complete).toBe(true)
  expect(save.hypotheses.hyp_deliberate_path).toBeTruthy()
  expect(save.documentsOwned).toContain('doc-emergency-reassessment')
  expect(save.evidenceOwned).toContain('call_enabled_apartment_entry')
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_reexamine_elisa_from_scratch')).toBe(true)
  expect(save.documentsOwned).toContain('doc-elisa-geraldo-depoimento')
})
