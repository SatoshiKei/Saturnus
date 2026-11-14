import { expect, test } from '@playwright/test'
import {
  closeHub,
  closePhone,
  dismissEvidenceCards,
  newGame,
  openAugustoPhone,
  openHubObject,
  readSave,
  waitForNotice,
  dev,
} from './helpers'
import { openEmergencyWorkbench } from './helpersForensic'

test.use({ viewport: { width: 1920, height: 1080 } })

test('Bloco 1 — BO + bancada + celular + fim de bloco', async ({ page }) => {
  test.setTimeout(180_000)
  await newGame(page)

  await openHubObject(page, 'evidence-box')
  await expect(page.getByTestId('hub-case-files')).toBeVisible()
  await page.getByTestId('case-file-doc-bo-inicial').click()
  await page.getByTestId('extract-b1').click()
  await closeHub(page)
  await dismissEvidenceCards(page)

  await openEmergencyWorkbench(page)
  await closeHub(page)
  await dev(page, 'b01-after-call')
  await dismissEvidenceCards(page)
  let save = await readSave(page)
  expect(save.flags.block01_emergency_provisional).toBe(true)

  await openHubObject(page, 'mariana-phone')
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-julia').click()
  await page.getByRole('button', { name: 'Voltar à lista' }).click()
  await page.getByTestId('chat-row-rafael').click()
  await page.getByRole('button', { name: 'Reproduzir áudio' }).click()
  await closePhone(page)

  await waitForNotice(page, 'discovery-contradiction')
  save = await readSave(page)
  expect(save.contradictionsConfirmed.some((c: { id: string }) => c.id === 'contra_selective_memory')).toBe(true)

  await waitForNotice(page, 'discovery-location')
  await dev(page, 'b01-end')
  save = await readSave(page)
  expect(save.flags.block01_complete).toBe(true)

  await openAugustoPhone(page)
  await page.getByTestId('app-whatsapp').click()
  await expect(page.getByTestId('chat-row-rafael')).toBeVisible()
  await closePhone(page)
})
