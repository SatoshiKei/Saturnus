import { expect, test } from '@playwright/test'
import {
  closeHub,
  closePhone,
  dev,
  dismissEvidenceCards,
  newGame,
  openAugustoPhone,
  openHubObject,
  readSave,
} from './helpers'
import { MEMORY_SEGMENTS } from '../../src/data/block09/memoryPuzzle'

test.use({ viewport: { width: 1920, height: 1080 } })

/** E2E enxuto: entrada, Omitido via PC, Roberto, Puzzle 12, estado final. */
test('Bloco 9 — O Omitido, morte, Puzzle 12 MEMÓRIA, estado final', async ({ page }) => {
  test.setTimeout(120_000)
  await newGame(page)
  await dev(page, 'b09-start')

  let save = await readSave(page)
  expect(save.flags.block09_started).toBe(true)
  expect(save.flags.block09_compare_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b09-compare-system').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible({ timeout: 10_000 })
  await closeHub(page)

  save = await readSave(page)
  expect(save.flags.block09_omitido_named).toBe(true)
  expect(save.evidenceOwned).toContain('omitido_named_in_records')
  expect(save.evidenceOwned).toContain('mariana_used_same_system_months')

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b09-diary-reread').click()
  await closeHub(page)
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b09-omitido-assist').click()
  await closeHub(page)

  save = await readSave(page)
  expect(save.flags.block09_roberto_search_unlocked).toBe(true)

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('roberto')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByTestId('search-open-doc-roberto-denuncia')).toBeVisible({ timeout: 10_000 })
  await page.getByTestId('search-open-doc-roberto-denuncia').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)

  save = await readSave(page)
  expect(save.flags.block09_roberto_done).toBe(true)
  expect(save.evidenceOwned).toContain('augusto_placed_into_case')
  expect(save.phones.augusto.unlockedChatIds).toContain('chat-mariana-augusto')

  await dismissEvidenceCards(page)
  await openAugustoPhone(page)
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-mariana').click()
  await dismissEvidenceCards(page)
  await expect(page.getByTestId('whatsapp-chat-view')).toBeVisible()
  await expect(page.getByText('Augusto. Sou eu.')).toBeVisible({ timeout: 8_000 })
  await closePhone(page)

  save = await readSave(page)
  expect(save.flags.block09_messages_wave1_read).toBe(true)
  expect(save.evidenceOwned).toContain('messages_as_mariana_convincing')

  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b09-weigh-messages').click()
  await closeHub(page)
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-caso').click()
  await page.getByTestId('b09-physical-trail').click()
  await closeHub(page)

  save = await readSave(page)
  expect(save.locations['trilha-final'].status).toBe('visitAvailable')

  await dev(page, 'b09-death', 'b09-memory-ready')
  save = await readSave(page)
  expect(save.flags.block09_mariana_dead).toBe(true)
  expect(save.evidenceOwned).toContain('system_speaks_as_mariana_after_death')
  expect(save.evidenceOwned).toContain('other_disappearances_pattern')
  expect(save.evidenceOwned).toContain('augusto_was_observed')
  expect(save.flags.block09_memory_available).toBe(true)

  await openHubObject(page, 'audio-station')
  await page.getByTestId('audio-file-mariana_recent_recording_claim').click()
  await expect(page.getByTestId('memory-panel')).toBeVisible({ timeout: 10_000 })
  for (const seg of MEMORY_SEGMENTS) {
    await page.getByTestId(`memory-assign-${seg.id}`).selectOption(seg.trueSource)
  }
  await page.getByTestId('memory-solve').click()
  await expect(page.getByTestId('memory-solved')).toBeVisible()
  await expect(page.getByTestId('memory-word')).toHaveText('MEMÓRIA')
  await closeHub(page)

  save = await readSave(page)
  expect(save.flags.block09_memory_done).toBe(true)
  expect(save.evidenceOwned).toContain('final_audio_impossible_provenance')
  expect(save.flags.block09_memory_word_shown).toBe(true)

  await expect(page.getByTestId('memory-word-overlay')).toBeVisible({ timeout: 8_000 })
  await expect(page.getByTestId('memory-word-hero')).toHaveText('MEMÓRIA')
  await page.getByTestId('memory-word-continue').click()

  // Reflexão final + estado: checkpoint enxuto (evita atravessar VN completo no E2E)
  await dev(page, 'b09-end')
  save = await readSave(page)
  expect(save.flags.block09_complete).toBe(true)
  expect(save.flags.saturnus_complete).toBe(true)
  expect(save.evidenceOwned).toContain('memory_word_revealed')
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_saturnus_memory')).toBe(true)
})
