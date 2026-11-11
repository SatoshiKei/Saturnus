export type SamuelAccidentalTopicId = 'marcelo' | 'close'

export const SAMUEL_ACCIDENTAL_TOPIC_IDS: SamuelAccidentalTopicId[] = ['marcelo', 'close']

export const samuelAccidentalTopicLabels: Record<SamuelAccidentalTopicId, string> = {
  marcelo: 'Marcelo Viana',
  close: 'Encerrar',
}

export const samuelAccidentalTopicFlags: Record<SamuelAccidentalTopicId, string> = {
  marcelo: 'samuel_accidental_marcelo',
  close: 'samuel_accidental_close',
}

export type SamuelAccidentalBeat = { speaker?: string; text: string }

export const samuelAccidentalBeats: Record<SamuelAccidentalTopicId, SamuelAccidentalBeat[]> = {
  marcelo: [
    { speaker: 'Augusto', text: 'Procuro Marcelo Viana. Este era o endereço dele.' },
    {
      speaker: 'Samuel',
      text: 'Não mora aqui há anos.\n\nEu moro.',
    },
    { speaker: 'Augusto', text: 'Sabe para onde ele foi?' },
    { speaker: 'Samuel', text: 'Não. E não tenho o telefone.' },
  ],
  close: [
    { speaker: 'Augusto', text: 'Tudo bem. Foi engano de endereço.' },
    { speaker: 'Samuel', text: 'Ok.' },
  ],
}
