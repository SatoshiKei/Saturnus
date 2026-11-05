export type CeciliaTopicId = 'henrique' | 'incident' | 'decline' | 'company'

export const CECILIA_TOPIC_IDS: CeciliaTopicId[] = ['henrique', 'incident', 'decline', 'company']

export const ceciliaTopicLabels: Record<CeciliaTopicId, string> = {
  henrique: 'Henrique no trabalho',
  incident: 'O incidente de segurança',
  decline: 'A deterioração',
  company: 'Como a empresa tratou',
}

export const ceciliaTopicFlags: Record<CeciliaTopicId, string> = {
  henrique: 'block07_cecilia_henrique',
  incident: 'block07_cecilia_incident',
  decline: 'block07_cecilia_decline',
  company: 'block07_cecilia_company',
}

export type CeciliaBeat = { speaker?: string; text: string }

export const ceciliaBeats: Record<CeciliaTopicId, CeciliaBeat[]> = {
  henrique: [
    { speaker: 'Augusto', text: 'Cecília Prado? Augusto Nogueira, Polícia Civil. Sobre Henrique Valença.' },
    { speaker: 'Cecília', text: 'Conheci profissionalmente.\nEle era competente.\nNo começo, normal.' },
    { speaker: 'Augusto', text: 'E depois?' },
    { speaker: 'Cecília', text: 'Depois… mudou.\nNão sei se o que ele dizia era verdade.\nSó sei o que vi.' },
  ],
  incident: [
    { speaker: 'Augusto', text: 'Houve um incidente de segurança.' },
    { speaker: 'Cecília', text: 'Houve.\nEle ficou obcecado com isso.\nAcessos, logs, sessões que não fechavam direito.' },
    { speaker: 'Augusto', text: 'Ele falava em sistema automatizado?' },
    { speaker: 'Cecília', text: 'Falava em coisa que respondia demais.\nQue lembrava demais.\nEu não entendi o jargão todo.' },
  ],
  decline: [
    { speaker: 'Augusto', text: 'Como ele deteriorou?' },
    { speaker: 'Cecília', text: 'Preocupação.\nDepois obsessão.\nDepois paranoia.\nMedo de estar sendo observado ou… manipulado.' },
    { speaker: 'Augusto', text: 'A senhora acreditava nele?' },
    { speaker: 'Cecília', text: 'Eu acreditava que ele estava sofrendo.\nNão sabia se a causa era real.' },
  ],
  company: [
    { speaker: 'Augusto', text: 'A empresa?' },
    { speaker: 'Cecília', text: 'Preferiu tratar como problema pessoal dele.\nBurnout. Stress.\nArquivaram o que puderam.' },
    { speaker: 'Augusto', text: 'Sobrou material digital?' },
    { speaker: 'Cecília', text: 'Talvez em backup antigo.\nEu apontei o caminho aos peritos na época.\nSe ainda existe, não está comigo.' },
  ],
}
