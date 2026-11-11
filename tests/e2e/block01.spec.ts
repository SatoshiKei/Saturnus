import { expect, test } from '@playwright/test'
import {
  closeHub,
  closePhone,
  dismissEvidenceCards,
  leaveScene,
  newGame,
  openAugustoPhone,
  openHubObject,
  playTopic,
  readSave,
  travelTo,
  waitForNotice,
} from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

test('Bloco 1 — fluxo principal por ferramentas físicas', async ({ page }) => {
  test.setTimeout(180_000)
  await newGame(page)

  // Pasta do caso: o jogador abre o BO e extrai o que importa.
  await openHubObject(page, 'evidence-box')
  await expect(page.getByTestId('hub-case-files')).toBeVisible()
  await page.getByTestId('case-file-doc-bo-inicial').click()
  await page.getByTestId('extract-b1').click()
  await closeHub(page)
  await dismissEvidenceCards(page)

  // Bancada forense: o jogador registra a transcrição identificada.
  await openHubObject(page, 'audio-station')
  await page.getByTestId('audio-file-emergency_call_raw').click()
  await expect(page.getByTestId('forensic-workbench')).toBeVisible()
  await page.getByRole('tab', { name: 'NOTES' }).click()
  await page.locator('.fw-notes').fill(
    [
      'escute isso até o fim',
      'desde aquela noite',
      'eu sentia medo',
      'eu estava confusa',
      'eu não lembro',
    ].join('\n'),
  )
  await expect(page.getByText(/Análise registrada/i)).toBeVisible()
  await closeHub(page)
  await dismissEvidenceCards(page)

  // Celular de Mariana: conversas e o áudio de Rafael.
  await openHubObject(page, 'mariana-phone')
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-julia').click()
  await page.getByRole('button', { name: 'Voltar à lista' }).click()
  await page.getByTestId('chat-row-rafael').click()
  await page.getByRole('button', { name: 'Reproduzir áudio' }).click()
  await closePhone(page)

  // A contradição é registrada sozinha quando as duas evidências estão no caderno.
  await waitForNotice(page, 'discovery-contradiction')
  let save = await readSave(page)
  expect(save.contradictionsConfirmed.some((c: { id: string }) => c.id === 'contra_selective_memory')).toBe(true)

  // O hospital entra no mapa como local; o jogador abre o mapa e decide ir.
  await waitForNotice(page, 'discovery-location')
  await travelTo(page, 'hospital', 'hospital-scene')
  for (const label of [
    'Última vez que viram Mariana',
    'Comportamento recente',
    'Falhas de memória',
    'Pasta guardada por Júlia',
    'Conversar com Camila a sós',
  ]) {
    await playTopic(page, label, 'hospital-scene')
  }
  await leaveScene(page, 'hospital-scene')
  await dismissEvidenceCards(page)

  save = await readSave(page)
  expect(save.flags.block01_hospital_done).toBe(true)
  expect(save.flags.block01_complete).toBe(true)

  await openAugustoPhone(page)
  await page.getByTestId('app-whatsapp').click()
  await expect(page.getByTestId('chat-row-rafael')).toBeVisible()
  await closePhone(page)
})
