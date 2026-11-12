import { expect, test } from '@playwright/test'
import {
  callLandlineExt,
  closeHub,
  closePhone,
  dev,
  dismissEvidenceCards,
  newGame,
  openHubObject,
  readSave,
} from './helpers'

test.use({ viewport: { width: 1920, height: 1080 } })

const UNK = ['UNK_01', 'UNK_02', 'UNK_03', 'UNK_04', 'UNK_05', 'UNK_06'] as const

test('Diário oculto — nenhum atalho: seis áudios → Puzzle 6 → Perícia → laudo → PIN digitado', async ({ page }) => {
  test.setTimeout(240_000)
  await newGame(page)
  await dev(page, 'b04-start', 'b04-chronology-done')

  // 1–3. Nenhum caminho "normal" mostra o diário: nem launcher, nem Ajustes.
  await openHubObject(page, 'mariana-phone')
  await expect(page.getByTestId('phone-home')).toBeVisible()
  await expect(page.getByTestId('app-hidden-diary')).toHaveCount(0)
  await page.getByTestId('app-settings').click()
  await expect(page.getByText(/mostrar apps ocultos/i)).toHaveCount(0)
  await expect(page.getByText(/diário/i)).toHaveCount(0)
  await closePhone(page)

  // 4. Antes da cena das ligações, a bancada não tem os seis arquivos.
  let save = await readSave(page)
  expect(save.flags.block04_hex_received).toBeFalsy()

  // 5. O fixo toca; o jogador atende; ninguém fala; um áudio; a linha cai; reflexão.
  await openHubObject(page, 'landline')
  await page.getByTestId('landline-answer').click()
  await expect(page.getByTestId('hex-call-scene')).toBeVisible()
  await expect(page.getByTestId('hex-call-silence')).toBeVisible()
  await page.getByTestId('hex-call-skip').click()
  await expect(page.getByTestId('reflection-view')).toBeVisible()
  await page.getByTestId('reflection-skip').click()
  await expect(page.getByTestId('hex-call-scene')).toBeHidden()
  await closeHub(page)
  await dismissEvidenceCards(page)

  // 6. Seis gravações preservadas, todas marcadas como NOVAS.
  save = await readSave(page)
  expect(save.flags.block04_hex_received).toBe(true)
  await openHubObject(page, 'audio-station')
  await expect(page.getByTestId('audio-new-count')).toHaveText(/novos/)
  for (const id of UNK) {
    await expect(page.getByTestId(`audio-new-hex_audio_${id.toLowerCase()}`)).toBeVisible()
  }

  // 7–8. Puzzle 6: Spectrogram nos seis; PIN nunca aparece na bancada.
  await expect(page.locator('body')).not.toContainText('481526')
  await page.getByTestId('audio-file-hex_audio_unk_01').click()
  for (const id of UNK) {
    await page.getByTestId(`fw-file-${id}`).click()
    await expect(page.getByTestId('timeline-spectrogram')).toBeEnabled({ timeout: 20_000 })
    await page.getByTestId('timeline-spectrogram').click()
  }
  await expect(page.locator('body')).not.toContainText('481526')
  save = await readSave(page)
  expect(save.flags.block04_hexagon_done).toBe(true)
  expect(save.evidenceOwned).toContain('hex_spectral_patterns')
  await closeHub(page)
  await dismissEvidenceCards(page)

  // 9. Sem diário antes da Perícia: o módulo ainda não tem acesso forense.
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-pericia').click()
  await expect(page.getByTestId('forensic-access-panel')).toHaveCount(0)
  await closeHub(page)
  save = await readSave(page)
  expect(save.phones.mariana.diaryUnlocked).toBeFalsy()

  // 10. Depois do puzzle, o jogador liga para a Perícia (ramal 212), e o laudo chega depois.
  await callLandlineExt(page, '212')
  await dismissEvidenceCards(page)

  // 11. O laudo está no módulo Perícia e explica por que o launcher não mostra o pacote.
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-pericia').click()
  await page.getByTestId('pc-open-doc-laudo-forense').click()
  await expect(page.getByTestId('case-document-view')).toContainText(/não apresentado pelo launcher/i)
  await page.getByTestId('pc-doc-back').click()
  await dismissEvidenceCards(page)

  // 12. Acesso forense → tela de PIN. Nada preenchido sozinho.
  await expect(page.getByTestId('forensic-access-panel')).toBeVisible()
  await page.getByTestId('forensic-open-package').click()
  await expect(page.getByTestId('forensic-pin-screen')).toBeVisible()
  await expect(page.getByTestId('forensic-pin-input')).toHaveValue('')

  // 13. PIN errado falha.
  await page.getByTestId('forensic-pin-input').fill('123456')
  await page.getByTestId('forensic-pin-submit').click()
  await expect(page.getByTestId('forensic-pin-error')).toBeVisible()
  save = await readSave(page)
  expect(save.phones.mariana.diaryUnlocked).toBeFalsy()

  // 14. 481526 abre o diário.
  await page.getByTestId('forensic-pin-input').fill('481526')
  await page.getByTestId('forensic-pin-submit').click()
  await expect(page.getByTestId('forensic-pin-screen')).toBeHidden()
  save = await readSave(page)
  expect(save.phones.mariana.diaryUnlocked).toBe(true)
  expect(save.evidenceOwned).toContain('hidden_diary_recovered')

  // 15. Salvar / recarregar preserva o diário aberto.
  await page.reload()
  if (await page.getByTestId('main-menu').isVisible().catch(() => false)) {
    await page.getByTestId('main-menu-continue').click()
  }
  await expect(page.getByTestId('investigation-scene')).toBeVisible()
  save = await readSave(page)
  expect(save.phones.mariana.diaryUnlocked).toBe(true)
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-pericia').click()
  await expect(page.getByTestId('forensic-pin-screen')).toHaveCount(0)
})
