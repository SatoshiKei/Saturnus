import { expect, type Page } from '@playwright/test'

/** Novo jogo limpo (menu → novo → abertura). */
export async function newGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  const menu = page.getByTestId('main-menu')
  if (await menu.isVisible()) {
    const neu = page.getByTestId('main-menu-new')
    await neu.click()
    const confirm = page.getByTestId('main-menu-new-confirm')
    if (await confirm.isVisible().catch(() => false)) await confirm.click()
  }
  const opening = page.getByTestId('block01-opening')
  if (await opening.isVisible().catch(() => false)) {
    await expect(opening).toBeHidden({ timeout: 12000 })
  }
  await expect(page.getByTestId('investigation-scene')).toBeVisible()
}

/** Aplica um checkpoint do painel DEV (apenas atalho de teste para chegar ao estado de entrada). */
export async function dev(page: Page, ...ids: string[]) {
  await page.getByTestId('dev-panel-open').click()
  for (const id of ids) {
    const btn = page.getByTestId(`dev-${id}`)
    await btn.scrollIntoViewIfNeeded()
    await btn.click()
  }
  await page.getByTestId('dev-panel-close').click()
}

export async function closeHub(page: Page) {
  await page.getByTestId('hub-close').click()
}

export async function openHubObject(page: Page, objectId: string) {
  await page.getByTestId(`scene-${objectId}`).click()
}

/** Abre o mapa, escolhe o pino e viaja. A cena começa pelo cabeçalho digitado (pulado aqui). */
export async function travelTo(page: Page, locationId: string, sceneTestId: string) {
  await openHubObject(page, 'wall-map')
  await page.getByTestId(`map-pin-${locationId}`).click()
  await page.getByTestId(`visit-${locationId}`).click()
  const skip = page.getByTestId('vn-intro-skip')
  await expect(skip).toBeVisible({ timeout: 8000 })
  await skip.click()
  await expect(page.getByTestId(sceneTestId)).toBeVisible({ timeout: 8000 })
}

/** Avança falas da cena até aparecer o menu de assuntos (ou acabar). */
export async function drain(page: Page, sceneTestId: string) {
  const scene = page.getByTestId(sceneTestId)
  for (let i = 0; i < 120; i++) {
    if (!(await scene.isVisible().catch(() => false))) return
    // Cena encerrada: reflexão / fade cobrem a tela, não há mais falas a avançar.
    const phase = await page.getByTestId('scene-runner').getAttribute('data-phase').catch(() => null)
    if (phase && phase !== 'scene') return
    if (await scene.locator('.vn-choice').first().isVisible().catch(() => false)) return
    const zone = scene.getByTestId('vn-advance-zone')
    if (!(await zone.isVisible().catch(() => false))) return
    if ((await zone.getAttribute('data-advance')) !== 'true') return
    await zone.click()
  }
}

export async function playTopic(page: Page, label: string, sceneTestId: string) {
  await page.getByTestId(sceneTestId).getByRole('button', { name: label, exact: true }).click()
  await drain(page, sceneTestId)
}

/**
 * Encerra a cena: se ela já fechou sozinha (todos os assuntos feitos) apenas atravessa a reflexão e o fade;
 * senão clica em Sair.
 */
export async function leaveScene(page: Page, sceneTestId: string) {
  const runner = page.getByTestId('scene-runner')
  if (await runner.isVisible().catch(() => false)) {
    const scene = page.getByTestId(sceneTestId)
    const phase = await runner.getAttribute('data-phase').catch(() => null)
    if (phase === 'scene' && (await scene.isVisible().catch(() => false))) {
      const exit = scene.getByRole('button', { name: 'Sair' })
      if (await exit.isVisible().catch(() => false)) await exit.click()
    }
    const refl = page.getByTestId('reflection-skip')
    try {
      await refl.waitFor({ state: 'visible', timeout: 1500 })
      await refl.click()
    } catch {
      /* sem reflexão */
    }
  }
  await expect(runner).toBeHidden({ timeout: 8000 })
  await expect(page.getByTestId('vn-return-fade')).toBeHidden({ timeout: 8000 })
}

export async function openAugustoPhone(page: Page) {
  await openHubObject(page, 'augusto-phone')
  await expect(page.getByTestId('phone-shell')).toBeVisible()
}

export async function closePhone(page: Page) {
  await page.getByTestId('phone-close').click()
}

/** Dispensa o cartão de evidência persistente, se houver. */
export async function dismissEvidenceCards(page: Page) {
  for (let i = 0; i < 12; i++) {
    const close = page.getByTestId('evidence-card-close')
    if (!(await close.isVisible().catch(() => false))) {
      await page.waitForTimeout(250)
      if (!(await close.isVisible().catch(() => false))) return
    }
    await close.click()
  }
}

/** Estado persistido do jogo (leitura apenas, para asserts). */
export async function readSave(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('saturnus-investigation-v1') ?? '{}'))
}

/** Conduz uma ligação até o fim (linhas, transição, resultado) e desliga. */
export async function runCall(page: Page) {
  await expect(page.getByTestId('call-session')).toBeVisible()
  const hang = page.getByTestId('call-hangup')
  for (let i = 0; i < 40; i++) {
    if (await hang.isVisible().catch(() => false)) break
    const next = page.getByTestId('call-next')
    if (await next.isVisible().catch(() => false)) await next.click()
    else await page.waitForTimeout(250)
  }
  await hang.click()
}

/** Liga para um contato da agenda do celular de Augusto. */
export async function callFromAugustoPhone(page: Page, contactId: string) {
  await openAugustoPhone(page)
  await page.getByTestId('app-phone').click()
  await page.getByTestId(`phone-call-${contactId}`).click()
  await runCall(page)
  await closePhone(page)
}

/** Consulta no sistema policial: digita o termo e abre o registro retornado. */
export async function searchAndOpen(page: Page, query: string, docId: string) {
  await openHubObject(page, 'monitor')
  await page.getByTestId('pc-nav-consultas').click()
  await page.getByTestId('police-search-input').fill(query)
  await page.getByTestId('police-search-submit').click()
  await page.getByTestId(`search-open-${docId}`).click()
  await expect(page.getByTestId('case-document-view')).toBeVisible()
  await closeHub(page)
}

/** Liga de um ramal do telefone fixo da delegacia. */
export async function callLandlineExt(page: Page, ext: string) {
  await openHubObject(page, 'landline')
  await page.getByTestId(`landline-ext-${ext}`).click()
  await runCall(page)
  await closeHub(page)
}

/**
 * A fila de descobertas mostra cartões de evidência um por vez (persistem até serem fechados).
 * Fecha cartões enquanto espera o aviso desejado aparecer.
 */
export async function waitForNotice(page: Page, testId: string, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await page.getByTestId(testId).isVisible().catch(() => false)) return
    const close = page.getByTestId('evidence-card-close')
    if (await close.isVisible().catch(() => false)) await close.click()
    else await page.waitForTimeout(150)
  }
  throw new Error(`Aviso ${testId} não apareceu na fila de descobertas`)
}
