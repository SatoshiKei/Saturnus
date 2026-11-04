export type JanaFollowupTopicId = 'resist' | 'belongings' | 'fear' | 'valter'

export const JANA_FOLLOWUP_TOPIC_IDS: JanaFollowupTopicId[] = ['resist', 'belongings', 'fear', 'valter']

export const janaFollowupLabels: Record<JanaFollowupTopicId, string> = {
  resist: 'Insistir na jaqueta',
  belongings: 'Outros pertences',
  fear: 'Por que entregar',
  valter: 'De quem tinha medo',
}

export const janaFollowupFlags: Record<JanaFollowupTopicId, string> = {
  resist: 'block06_jana2_resist',
  belongings: 'block06_jana2_belongings',
  fear: 'block06_jana2_fear',
  valter: 'block06_jana2_valter',
}

export type JanaFollowupBeat = { speaker?: string; text: string }

export const janaFollowupBeats: Record<JanaFollowupTopicId, JanaFollowupBeat[]> = {
  resist: [
    { speaker: 'Augusto', text: 'Elisa bebeu mais do que os autos diziam. E usava a sua jaqueta. Preciso voltar a isso.' },
    { speaker: 'Jana', text: 'Já falei.\nFaz seis anos.\nFoi um empréstimo.\nFim.' },
    { speaker: 'Augusto', text: 'Mariana insistiu nesse detalhe. Não era só frio na saída.' },
    { speaker: 'Jana', text: 'Mariana também estava presa no passado.\nEu não.' },
  ],
  belongings: [
    { speaker: 'Augusto', text: 'Só a jaqueta?' },
    { speaker: 'Jana', text: '…' },
    { speaker: 'Augusto', text: 'Bolsa. Algo reconhecível. Algo que fosse claramente seu.' },
    { speaker: 'Jana', text: 'Não era um empréstimo casual.\nEu entreguei a jaqueta.\nE a bolsa.\nDe propósito.' },
  ],
  fear: [
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Jana', text: 'Eu estava com medo.\nAchei que tinha gente me procurando naquela noite.\nQueria sair da atenção deles.' },
    { speaker: 'Augusto', text: 'Você queria que seguissem ela?' },
    { speaker: 'Jana', text: 'Não.\nEu estava assustada.\nFiz uma coisa egoísta e não pensei nas consequências.\nNão planejei o que aconteceu com a Elisa.' },
  ],
  valter: [
    { speaker: 'Augusto', text: 'Quem te assustava?' },
    { speaker: 'Jana', text: 'Gente ligada ao Válter.\nSó isso.\nNão vou ficar listando nomes.' },
    { speaker: 'Augusto', text: 'Válter quem?' },
    { speaker: 'Jana', text: 'Válter.\nNa época todo mundo no círculo sabia o suficiente para ter medo.\nIsso nunca entrou direito na investigação da Elisa.' },
  ],
}
