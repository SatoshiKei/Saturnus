import { expect, test } from '@playwright/test'
import {
  callFromAugustoPhone,
  callLandlineExt,
  closeHub,
  dev,
  dismissEvidenceCards,
  leaveScene,
  newGame,
  openHubObject,
  playTopic,
  readSave,
  searchAndOpen,
  waitForNotice,
  travelTo,
} from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

test('Bloco 3 — Nico: arquivo da boate → nome completo → cadastro com telefone → ligação → cena', async ({ page }) => {
  test.setTimeout(180_000)
  await newGame(page)
  await dev(page, 'b03-start')

  // Sem o cadastro, Nico não está na agenda nem no mapa.
  let save = await readSave(page)
  expect(save.contacts['contact-nico'].unlocked).toBeFalsy()
  expect(save.locations.titan.status).toBe('unknown')

  // O computador não entrega "pessoa encontrada": entrega um cadastro com telefone.
  await searchAndOpen(page, 'Nicolas Prado Reis', 'doc-nico-cadastro')
  await expect(page.getByTestId('evidence-card')).toBeVisible({ timeout: 8000 })
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.contacts['contact-nico'].unlocked).toBe(true)
  // Telefone anotado, mas o local de trabalho ainda não: só depois da ligação.
  expect(save.locations.titan.status).toBe('unknown')

  await callFromAugustoPhone(page, 'contact-nico')
  save = await readSave(page)
  expect(save.locations.titan.status).toBe('visitAvailable')

  await travelTo(page, 'titan', 'nico-scene')
  for (const label of [
    'Elisa Duarte',
    'A Noite X no Vértice',
    'Visita de Mariana',
    'O que ela queria saber',
    'Registros sonoros',
  ]) {
    await playTopic(page, label, 'nico-scene')
  }
  await leaveScene(page, 'nico-scene')
  await dismissEvidenceCards(page)

  save = await readSave(page)
  expect(save.flags.block03_nico_interview_done).toBe(true)
  expect(save.evidenceOwned).toContain('nico_recording_booth')
  expect(save.evidenceOwned).toContain('nico_recording_portable')

  // As duas gravações chegam à bancada com selo NOVO; Janus é operação do jogador.
  await openHubObject(page, 'audio-station')
  await expect(page.getByTestId('audio-new-count')).toBeVisible()
  await page.getByTestId('audio-file-nico_recording_booth').click()
  await expect(page.getByTestId('janus-provisional-panel')).toBeVisible()
  await page.getByTestId('janus-provisional-sync').click()
  await closeHub(page)
  await dismissEvidenceCards(page)

  save = await readSave(page)
  expect(save.flags.block03_janus_done).toBe(true)
  expect(save.contradictionsConfirmed.length).toBe(0)

  // A cronologia original do processo vem do cartório (ramal 204), depois de "algumas horas".
  await searchAndOpen(page, 'Elisa Duarte', 'doc-elisa-resumo')
  await dismissEvidenceCards(page)
  await callLandlineExt(page, '204')
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.documentsOwned).toContain('doc-elisa-cronologia')
  expect(save.contradictionsConfirmed.length).toBe(0)

  // Receber o documento não basta: o jogador precisa lê-lo em Processos / Autos.
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-autos').click()
  await page.getByTestId('pc-open-doc-elisa-cronologia').click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
  await dismissEvidenceCards(page)
  // A fila de descobertas mostra um aviso por vez; a contradição entra na fila e aparece na sua vez.
  await waitForNotice(page, 'discovery-contradiction')
  save = await readSave(page)
  // Contradição registrada automaticamente quando as duas evidências estão no caderno.
  expect(save.contradictionsConfirmed.some((c: { id: string }) => c.id === 'contra_vertice_clock')).toBe(true)
})
