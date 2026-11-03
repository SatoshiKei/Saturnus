/** Uma linha contínua na caixa ADV (quebras do roteiro viram espaço). */
export function formatAdvDialogueText(text: string): string {
  return text.replace(/\s*\n+\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
}
