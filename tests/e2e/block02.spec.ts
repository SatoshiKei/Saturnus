import { expect, test } from '@playwright/test'
import {
  closePhone,
  searchAndOpen,
  dev,
  dismissEvidenceCards,
  leaveScene,
  newGame,
  openAugustoPhone,
  openHubObject,
  playTopic,
  readSave,
  travelTo,
} from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

test('Bloco 2 — Paula começa vazia, o jogador escreve; Lucas e Elisa chegam por registros', async ({ page }) => {
  test.setTimeout(180_000)
  await newGame(page)
  await dev(page, 'b02-start')

  // Antes da nota, Paula nem existe na agenda de Augusto.
  await openAugustoPhone(page)
  await page.getByTestId('app-phone').click()
  await expect(page.getByTestId('phone-call-contact-paula')).toHaveCount(0)
  await closePhone(page)

  // A nota "quarta" no celular de Mariana revela o contato.
  await openHubObject(page, 'mariana-phone')
  await page.getByTestId('app-notes').click()
  await page.getByTestId('note-row-n-quarta').click()
  await expect(page.getByTestId('note-view')).toBeVisible()
  await closePhone(page)

  // Evento de descoberta: contato novo (fila: o cartão de evidência pendente vem antes).
  await dismissEvidenceCards(page)
  await expect(page.getByTestId('discovery-contact')).toBeVisible({ timeout: 8000 })
  // Fecha o aviso para não interceptar cliques no celular.
  await page.getByTestId('discovery-contact').getByRole('button', { name: 'Fechar' }).click()

  await openAugustoPhone(page)
  await page.getByTestId('app-whatsapp').click()
  await page.getByTestId('chat-row-paula').click()
  await expect(page.getByTestId('chat-empty-thread')).toBeVisible()

  // Nove trocas; toca em Mensagem → escolhe uma opção cosmética (mesmo estado final).
  for (let i = 0; i < 9; i++) {
    await expect(page.getByTestId('chat-composer')).toHaveAttribute('data-compose-available', 'true', {
      timeout: 15_000,
    })
    await page.getByTestId('composer-open').click()
    const options = page.getByTestId('chat-script-options')
    await expect(options).toBeVisible({ timeout: 15_000 })
    await expect(options).toHaveAttribute('data-ready', 'true')
    await page.getByTestId(`chat-option-${i % 2}`).click()
    await expect(page.getByTestId('chat-typing')).toBeVisible()
    await expect(page.getByTestId('chat-typing')).toBeHidden({ timeout: 15_000 })
  }
  await expect(page.getByText('Moreira.', { exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/coisa antiga da família/)).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('chat-script-options')).toBeHidden({ timeout: 15_000 })
  await expect
    .poll(async () => (await readSave(page)).flags?.block02_paula_chat_done, { timeout: 10_000 })
    .toBe(true)
  await closePhone(page)
  await dismissEvidenceCards(page)

  // Nada de "entrevista desbloqueada": Lucas aparece no sistema como cadastro a ser consultado.
  await searchAndOpen(page, 'Lucas', 'doc-lucas-cadastro')
  await expect(page.getByTestId('discovery-location')).toBeVisible({ timeout: 8000 })

  await travelTo(page, 'universidade', 'lucas-scene')
  for (const label of [
    'Como Mariana o procurou',
    'Elisa Duarte',
    'Relação com Elisa e André',
    'André Silva e a condenação',
    'O que Mariana perguntou',
  ]) {
    await playTopic(page, label, 'lucas-scene')
  }
  await leaveScene(page, 'lucas-scene')
  await dismissEvidenceCards(page)

  await searchAndOpen(page, 'Elisa Duarte', 'doc-elisa-resumo')
  await searchAndOpen(page, 'Elisa Duarte', 'doc-elisa-testemunhas')
  const saved = await readSave(page)
  expect(saved.evidenceOwned).toContain('elisa_case_summary')
  expect(saved.evidenceOwned).toContain('nico_elisa_witness')
})
