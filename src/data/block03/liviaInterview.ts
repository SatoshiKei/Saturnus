export type LiviaTopicId = 'mariana' | 'material'

export const LIVIA_TOPIC_IDS: LiviaTopicId[] = ['mariana', 'material']

export const liviaTopicLabels: Record<LiviaTopicId, string> = {
  mariana: 'Mariana e a Maralto',
  material: 'Material bruto',
}

export const liviaTopicFlags: Record<LiviaTopicId, string> = {
  mariana: 'block03_livia_mariana',
  material: 'block03_livia_material',
}

export type LiviaBeat = { speaker?: string; text: string; portrait?: 'livia' }

export const liviaBeats: Record<LiviaTopicId, LiviaBeat[]> = {
  mariana: [
    {
      speaker: 'Augusto',
      text: 'Mariana Silva esteve aqui atrás de material sobre a Maralto?',
    },
    {
      speaker: 'Lívia',
      text: 'Esteve. Queria coisa antiga, dos protestos. Eu passei o que ainda tinha da cobertura.',
      portrait: 'livia',
    },
  ],
  material: [
    { speaker: 'Augusto', text: 'Você ainda tem?' },
    {
      speaker: 'Lívia',
      text: 'Tenho uma cópia. É bruto de arquivo, de seis anos atrás. Se servir, leva.',
      portrait: 'livia',
    },
    { speaker: 'Augusto', text: 'Ela disse o que estava procurando?' },
    {
      speaker: 'Lívia',
      text: 'Não. Só fez questão de levar o bruto. Não queria a matéria editada.',
      portrait: 'livia',
    },
  ],
}
