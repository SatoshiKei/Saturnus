import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vnLeaveScene, vnPlayTopic } from './vnHelpers'

const block04Shots = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../artifacts/ui/block04')

test.use({ viewport: { width: 1920, height: 1080 } })

async function dismissMenu(page: Page) {
  const menu = page.getByTestId('main-menu')
  if (await menu.isVisible()) {
    await page.getByTestId('main-menu-new').click()
  }
  const opening = page.getByTestId('block01-opening')
  if (await opening.isVisible()) {
    await expect(opening).toBeHidden({ timeout: 8000 })
  }
}

test('Bloco 4 — Samuel até interferência na memória', async ({ page }) => {
  test.setTimeout(240_000)
  await page.goto('/')
  await dismissMenu(page)

  await page.getByTestId('dev-panel-open').click()
  await page.getByTestId('dev-b04-start').click()
  await expect(page.getByTestId('notepad-toggle')).toContainText('1', { timeout: 15_000 })
  const opening = page.getByTestId('block01-opening')
  if (await opening.isVisible().catch(() => false)) {
    await expect(opening).toBeHidden({ timeout: 8000 })
  }
  await page.getByTestId('dev-panel-close').click({ force: true })
  await expect(page.getByTestId('dev-story-panel')).toBeHidden()

  await page.getByTestId('notepad-toggle').click()
  await expect(
    page.getByTestId('objectives-strip').getByText(
      'Descobrir quem era Morsa e por que Mariana investigava os protestos',
    ),
  ).toBeVisible()
  await page.getByTestId('notepad-toggle').click()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Busca' }).click()
  await page.getByTestId('police-search-input').fill('Samuel')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByRole('heading', { name: /Cadastro — Samuel/i })).toBeVisible()
  await page.getByRole('button', { name: 'Pessoas' }).click()
  await page.getByTestId('samuel-interview-open').click()
  await expect(page.getByTestId('samuel-scene')).toBeVisible()
  for (const label of [
    'Quem era Morsa',
    'O núcleo dos protestos',
    'Por que ninguém fala',
    'Visita de Mariana',
    'O que ela queria saber',
  ]) {
    await vnPlayTopic(page, label, 'samuel-scene')
  }
  // Último tópico pode avançar o outro e fechar a cena.
  if (await page.getByTestId('samuel-scene').isVisible().catch(() => false)) {
    const leave = page.getByTestId('samuel-scene').getByRole('button', { name: /Voltar|Encerrar/i })
    if (await leave.isVisible().catch(() => false)) await leave.click()
    else await vnLeaveScene(page, 'samuel-scene')
  }
  await expect(page.getByTestId('samuel-scene')).toBeHidden()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Busca' }).click()
  await page.getByTestId('police-search-input').fill('André')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByRole('heading', { name: /Visitas\/contatos/i })).toBeVisible()
  await page.getByRole('button', { name: 'Pessoas' }).click()
  await page.getByTestId('andre-interview-open').click()
  await expect(page.getByTestId('andre-scene')).toBeVisible()
  for (const label of [
    'Contato com Mariana',
    'Mudança sobre o caso',
    'O que você pediu a ela',
    'Maralto e protestos',
    'Por que falar comigo',
  ]) {
    await vnPlayTopic(page, label, 'andre-scene')
  }
  if (await page.getByTestId('andre-scene').isVisible().catch(() => false)) {
    const leave = page.getByTestId('andre-scene').getByRole('button', { name: /Voltar|Encerrar/i })
    if (await leave.isVisible().catch(() => false)) await leave.click()
    else await vnLeaveScene(page, 'andre-scene')
  }
  await expect(page.getByTestId('andre-scene')).toBeHidden()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Busca' }).click()
  await page.getByTestId('police-search-input').fill('cronologia')
  await page.getByTestId('police-search-submit').click()
  await expect(page.getByRole('heading', { name: /Cruzamento/i })).toBeVisible()
  await page.getByTestId('hub-close').click()

  const banner = page.getByTestId('provocation-banner')
  if (await banner.isVisible().catch(() => false)) {
    await banner.getByRole('button', { name: 'Arquivar' }).click()
  }

  await page.getByTestId('scene-audio-station').click()
  await page.getByRole('button', { name: /FRAG_A/i }).click()
  await expect(page.getByTestId('hexagon-provisional-panel')).toBeVisible()
  await page.screenshot({ path: path.join(block04Shots, '01-hexagon.png'), fullPage: true })
  await page.getByTestId('hexagon-provisional-solve').click()
  await expect(page.getByTestId('hexagon-provisional-panel').getByText(/PROCURE O QUE A TELA OMITE/i)).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-monitor').click()
  await page.getByRole('button', { name: 'Arquivos' }).click()
  await expect(page.getByTestId('phone-forensics-panel')).toBeVisible()
  await page.getByTestId('phone-forensics-run').click()
  await expect(page.getByText(/Varredura concluída/i)).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-hidden-diary').click()
  await page.getByTestId('diary-password-input').fill('demo-diary')
  await page.getByTestId('diary-password-submit').click()
  await expect(page.getByTestId('hidden-diary-unlocked')).toBeVisible()
  await page.getByTestId('diary-entry-diary-forget').click()
  await page.getByRole('button', { name: /Entradas/i }).click()
  await page.getByTestId('diary-entry-diary-julia-a').click()
  await page.getByRole('button', { name: /Entradas/i }).click()
  await page.getByTestId('diary-entry-diary-julia-b').click()
  await page.getByRole('button', { name: /Entradas/i }).click()
  await page.getByTestId('diary-entry-diary-record').click()
  await expect(page.getByTestId('diary-entry-view').getByText(/CHK_UNK/i)).toBeVisible()
  await page.screenshot({ path: path.join(block04Shots, '02-diary.png'), fullPage: true })
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-mariana-phone').click()
  await page.getByTestId('app-files').click()
  await page.getByRole('button', { name: 'Downloads' }).click()
  await page.getByTestId('mariana-unknown-file').click()
  await page.getByTestId('phone-close').click()

  await page.getByTestId('scene-audio-station').click()
  await page.getByRole('button', { name: /CHK_UNK/i }).click()
  await expect(page.getByTestId('unknown-recording-panel')).toBeVisible()
  await page.getByTestId('unknown-recording-analyze').click()
  await expect(page.getByTestId('unknown-recording-panel').getByText(/Análise registrada/i)).toBeVisible()
  await page.getByTestId('hub-close').click()

  await page.getByTestId('notepad-toggle').click()
  await expect(
    page.getByTestId('objectives-strip').getByText('Pressionar Nico sobre o que omitiu da Noite X'),
  ).toBeVisible()
  await page.screenshot({ path: path.join(block04Shots, '03-end-state.png'), fullPage: true })
})
