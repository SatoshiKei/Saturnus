import type { Page } from '@playwright/test'

/** Avança N falas VN (para sem terminar o tópico). */
export async function vnAdvanceSteps(page: Page, sceneTestId: string, steps: number) {
  const scene = page.getByTestId(sceneTestId)
  if (await page.getByTestId('vn-nvl').isVisible()) {
    await page.keyboard.press('Escape')
  }
  for (let i = 0; i < steps; i++) {
    if (await scene.locator('.vn-choice').first().isVisible()) break
    const zone = scene.getByTestId('vn-advance-zone')
    if (!(await zone.isVisible())) break
    if ((await zone.getAttribute('data-advance')) !== 'true') break
    await zone.click()
  }
}

/** Abre modo NVL (↑) — requer cena em ADV com histórico. */
export async function vnOpenNvl(page: Page) {
  await page.keyboard.press('ArrowUp')
}

/** Avança falas VN (clique na barra inferior) até acabar o tópico ou aparecer menu de escolhas. */
export async function vnDrainTopic(page: Page, sceneTestId: string) {
  const scene = page.getByTestId(sceneTestId)
  for (let i = 0; i < 80; i++) {
    if (await scene.locator('.vn-choice').first().isVisible()) break
    const zone = scene.getByTestId('vn-advance-zone')
    if (!(await zone.isVisible())) break
    if ((await zone.getAttribute('data-advance')) !== 'true') break
    await zone.click()
  }
}

export async function vnPlayTopic(page: Page, label: string, sceneTestId: string) {
  await page.getByTestId(sceneTestId).getByRole('button', { name: label, exact: true }).click()
  await vnDrainTopic(page, sceneTestId)
}

/** Encerrar visita / outro — avança até a cena sumir ou não haver mais avanço. */
export async function vnLeaveScene(page: Page, sceneTestId: string) {
  for (let i = 0; i < 6; i++) {
    const scene = page.getByTestId(sceneTestId)
    if (!(await scene.isVisible().catch(() => false))) return
    const zone = scene.getByTestId('vn-advance-zone')
    if (!(await zone.isVisible().catch(() => false))) return
    if ((await zone.getAttribute('data-advance')) !== 'true') return
    await zone.click()
  }
}
