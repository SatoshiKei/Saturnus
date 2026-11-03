import { describe, expect, it } from 'vitest'
import { formatAdvDialogueText } from '../../src/components/story/vn/advText'

describe('formatAdvDialogueText', () => {
  it('colapsa quebras do roteiro em uma linha', () => {
    expect(
      formatAdvDialogueText(
        'Claro que não achei normal.\n\nMas ela sabia que tava acontecendo.\n\nPor isso começou a anotar tudo.',
      ),
    ).toBe('Claro que não achei normal. Mas ela sabia que tava acontecendo. Por isso começou a anotar tudo.')
  })
})
