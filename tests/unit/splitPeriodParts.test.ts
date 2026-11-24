import { describe, expect, it } from 'vitest'
import { splitPeriodParts } from '../../src/components/story/vn/splitPeriodParts'

describe('splitPeriodParts', () => {
  it('divide por ponto e interrogação', () => {
    expect(splitPeriodParts('A. B? C.')).toEqual(['A.', 'B?', 'C.'])
  })

  it('não divide pontuação dentro de chaves', () => {
    expect(splitPeriodParts('Fala {ok. ainda?} depois.')).toEqual(['Fala {ok. ainda?} depois.'])
  })

  it('retorna um período se não houver divisores', () => {
    expect(splitPeriodParts('só uma frase')).toEqual(['só uma frase'])
  })
})