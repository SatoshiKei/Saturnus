export type MiroThirdTopicId = 'alibi' | 'fall' | 'rail' | 'deny'

export const MIRO_THIRD_TOPIC_IDS: MiroThirdTopicId[] = ['alibi', 'fall', 'rail', 'deny']

export const miroThirdLabels: Record<MiroThirdTopicId, string> = {
  alibi: 'André nos protestos',
  fall: 'O que aconteceu na queda',
  rail: 'A proteção',
  deny: 'Contato físico',
}

export const miroThirdFlags: Record<MiroThirdTopicId, string> = {
  alibi: 'block08_miro3_alibi',
  fall: 'block08_miro3_fall',
  rail: 'block08_miro3_rail',
  deny: 'block08_miro3_deny',
}

export type MiroThirdBeat = { speaker?: string; text: string }

export const miroThirdBeats: Record<MiroThirdTopicId, MiroThirdBeat[]> = {
  alibi: [
    { speaker: 'Augusto', text: 'André estava nos protestos naquele intervalo. Comprovado. Você fica sozinho na região da queda.' },
    { speaker: 'Miro', text: 'Eu já disse.\nSegui. Desci. Peguei a bolsa.\nNão empurrei.' },
  ],
  fall: [
    { speaker: 'Augusto', text: 'Então diga o que viu quando ela caiu.' },
    { speaker: 'Miro', text: 'Ela percebeu que eu seguia.\nTentou se afastar.\nFoi até a proteção.' },
    { speaker: 'Miro', text: 'A estrutura cedeu.\nEla caiu.\nEu não toquei nela.' },
  ],
  rail: [
    { speaker: 'Augusto', text: 'E se a proteção já estivesse comprometida?' },
    { speaker: 'Miro', text: 'Eu não sei de engenharia.\nSei o que vi: ela encostou e aquilo não segurou.' },
  ],
  deny: [
    { speaker: 'Augusto', text: 'Você jura que não houve contato causador.' },
    { speaker: 'Miro', text: 'Juro o que posso jurar.\nNão empurrei.\nSe a grade estava podre, não fui eu quem podreceu.' },
  ],
}
