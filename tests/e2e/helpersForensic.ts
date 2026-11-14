import { expect, type Page } from '@playwright/test'
import { closeHub, openHubObject } from './helpers'

/**
 * P01 no runtime atual: Recovered Speech por escuta + filtros (sem textarea Notes).
 * E2E valida o shell e aplica o checkpoint canónico de conclusão técnica.
 */
export async function openEmergencyWorkbench(page: Page) {
  await openHubObject(page, 'audio-station')
  await page.getByTestId('audio-file-emergency_call_raw').click()
  await expect(page.getByTestId('forensic-workbench')).toBeVisible()
  for (const tab of [
    'Process',
    'Analysis',
    'File',
    'Structure',
    'Packets',
    'Timing',
    'Spectrum',
    'Compare',
    'Notes',
  ]) {
    await expect(page.getByRole('tab', { name: tab })).toBeVisible()
  }
}

/** Janus: Timing → offset → formalize → apply → 01:23:30. */
export async function completeJanusOnWorkbench(page: Page) {
  await openHubObject(page, 'audio-station')
  await page.getByTestId('audio-file-nico_recording_booth').click()
  await expect(page.getByTestId('forensic-workbench')).toBeVisible()
  await page.getByRole('tab', { name: 'Timing' }).click()
  await expect(page.getByTestId('timing-panel')).toBeVisible()
  await page.getByTestId('timing-offset-janus_desk').fill('450')
  await page.getByTestId('formalize-clock-offset').click()
  await expect(page.getByTestId('timing-clock-difference')).toContainText('+07:30')
  await page.getByTestId('apply-clock-correction').click()
  await expect(page.getByTestId('timing-corrected-time')).toContainText('01:23:30')
  await expect(page.getByText(/Análise registrada/i)).toBeVisible({ timeout: 10000 })
  await closeHub(page)
}
