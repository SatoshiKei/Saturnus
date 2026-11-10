import { expect, test } from '@playwright/test'
import { dev, newGame, readSave } from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

/** E2E enxuto: entrada, checkpoints canônicos guardrail→Jaguar→Dênis→Mauro→Rui→Rotação. */
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

  await dev(
    page,
    'b08-after-andre2',
    'b08-after-miro3',
    'b08-after-pericia',
    'b08-after-denis',
    'b08-mauro-bia',
    'b08-bia-rui',
    'b08-rotation-done',
    'b08-end',
  )
  save = await readSave(page)
  expect(save.flags.block08_complete).toBe(true)
  expect(save.flags.block09_entry_ready).toBe(true)
  expect(save.evidenceOwned).toContain('jaguar_x300_paint_fragment')
  expect(save.evidenceOwned).toContain('jaguar_registered_mauro')
  expect(save.evidenceOwned).toContain('denis_remembers_jaguar_green')
  expect(save.evidenceOwned).toContain('scale_links_callsign_to_augusto')
  expect(save.hypotheses.hyp_elisa_died_accident).toBeTruthy()
  expect(save.tasks.some((t: { id: string }) => t.id === 'task_how_mariana_knew')).toBe(true)
})
