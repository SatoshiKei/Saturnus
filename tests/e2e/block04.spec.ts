import { expect, test } from '@playwright/test'
import {
  callFromAugustoPhone,
  dev,
  dismissEvidenceCards,
  leaveScene,
  newGame,
  openHubObject,
  playTopic,
  readSave,
  searchAndOpen,
  travelTo,
  waitForNotice,
} from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

test('Bloco 4 — Samuel: protestos → relação de detidos → ficha com endereço → mapa → viagem', async ({ page }) => {
  test.setTimeout(180_000)
  await newGame(page)
  await dev(page, 'b04-start')

  let save = await readSave(page)
  expect(save.locations['samuel-casa'].status).toBe('unknown')

  // Consulta por nome ainda não existe como pista: Samuel só é alcançado pelos registros dos protestos.
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill('Samuel')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByText('Nenhum registro encontrado')).toBeVisible()
  await page.getByTestId('hub-close').click()

  await searchAndOpen(page, 'Maralto protesto', 'doc-protesto-ocorrencia')
  await searchAndOpen(page, 'Maralto', 'doc-protesto-detidos')
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.flags.block04_samuel_search_unlocked).toBe(true)
  expect(save.locations['samuel-casa'].status).toBe('unknown')

  await searchAndOpen(page, 'Samuel', 'doc-samuel-ficha')
  await waitForNotice(page, 'discovery-location')
  save = await readSave(page)
  expect(save.locations['samuel-casa'].status).toBe('visitAvailable')

  await travelTo(page, 'samuel-casa', 'samuel-scene')
  for (const label of [
    'Quem era Morsa',
    'O núcleo dos protestos',
    'Por que ninguém fala',
    'Visita de Mariana',
    'O que ela queria saber',
  ]) {
    await playTopic(page, label, 'samuel-scene')
  }
  await leaveScene(page, 'samuel-scene')
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.flags.block04_samuel_interview_done).toBe(true)
  expect(save.evidenceOwned).toContain('samuel_confirms_morsa')
})

test('Bloco 4 — André: registro de visitas → ligação à unidade → visita → cronologia', async ({ page }) => {
  test.setTimeout(240_000)
  await newGame(page)
  await dev(page, 'b04-start', 'b04-samuel-ready', 'b04-after-samuel')

  let save = await readSave(page)
  expect(save.locations.presidio.status).toBe('unknown')

  await searchAndOpen(page, 'André Silva', 'doc-andre-visitas')
  await waitForNotice(page, 'discovery-contact')
  save = await readSave(page)
  expect(save.contacts['contact-presidio'].unlocked).toBe(true)
  // Telefone anotado; o local ainda não existe no mapa até a ligação.
  expect(save.locations.presidio.status).toBe('unknown')

  await callFromAugustoPhone(page, 'contact-presidio')
  save = await readSave(page)
  expect(save.locations.presidio.status).toBe('visitAvailable')

  await travelTo(page, 'presidio', 'andre-scene')
  for (const label of [
    'Contato com Mariana',
    'Mudança sobre o caso',
    'O que você pediu a ela',
    'Maralto e protestos',
    'Por que falar comigo',
  ]) {
    await playTopic(page, label, 'andre-scene')
  }
  await leaveScene(page, 'andre-scene')
  await dismissEvidenceCards(page)
  save = await readSave(page)
  expect(save.flags.block04_andre_interview_done).toBe(true)
  expect(save.flags.block04_chronology_search_unlocked).toBe(true)

  // A comparação de horários é trabalho do jogador, com dois documentos.
  await searchAndOpen(page, 'André Silva', 'doc-andre-ligacoes')
  await searchAndOpen(page, 'número desconhecido', 'doc-numero-sem-nome')
  await waitForNotice(page, 'discovery-contradiction')
  save = await readSave(page)
  expect(save.contradictionsConfirmed.some((c: { id: string }) => c.id === 'contra_andre_night_hours')).toBe(true)
  expect(save.flags.block04_hex_call_pending).toBe(true)
  // Os seis áudios ainda não chegaram: dependem de atender a ligação.
  expect(save.flags.block04_hex_received).toBeFalsy()
})
