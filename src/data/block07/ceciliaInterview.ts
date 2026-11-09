export type CeciliaTopicId = 'henrique' | 'incident' | 'decline' | 'company'

export const CECILIA_TOPIC_IDS: CeciliaTopicId[] = ['henrique', 'incident', 'decline', 'company']

export const ceciliaTopicLabels: Record<CeciliaTopicId, string> = {
  henrique: 'Henrique',
  incident: 'O incidente',
  decline: 'O que ele dizia',
  company: 'A empresa',
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
    { speaker: 'Cecília', text: 'Henrique?\n\nFaz muito tempo que ninguém me pergunta dele.' },
    { speaker: 'Augusto', text: 'Quando trabalhou com ele, como era?' },
    {
      speaker: 'Cecília',
      text: 'Bom.\n\nIrritantemente bom, às vezes.\n\nEra o tipo que resolvia uma coisa e depois reclamava do jeito que todo mundo tinha tentado resolver antes.',
    },
    { speaker: 'Augusto', text: 'E depois mudou.' },
    { speaker: 'Cecília', text: 'Mudou.' },
  ],
  incident: [
    { speaker: 'Augusto', text: 'Por causa de um incidente de segurança?' },
    { speaker: 'Cecília', text: 'Foi quando começou.' },
    { speaker: 'Augusto', text: 'O que ele dizia que estava acontecendo?' },
    {
      speaker: 'Cecília',
      text: 'No começo era normal.\n\nSessão abrindo quando não devia. Login aparecendo de onde não devia. Coisa de trabalho.',
    },
    { speaker: 'Augusto', text: 'E depois?' },
    { speaker: 'Cecília', text: 'Depois ele começou a dizer que não era só acesso.' },
    { speaker: 'Augusto', text: 'O que era?' },
    {
      speaker: 'Cecília',
      text: 'Ele dizia que fechava uma conversa e, quando voltava, o sistema continuava de onde tinham parado.\n\nIsso sozinho não era absurdo. Tinha histórico, cache, um monte de coisa.\n\nO problema é que, segundo ele, às vezes aparecia contexto que ele jurava não ter colocado lá.',
    },
  ],
  decline: [
    { speaker: 'Augusto', text: 'A empresa verificou?' },
    {
      speaker: 'Cecília',
      text: 'Tentou.\n\nOu disse que tentou.\n\nNão acharam nada que justificasse o que ele estava dizendo.',
    },
    { speaker: 'Augusto', text: 'Ele achava que alguém estava acessando as sessões?' },
    { speaker: 'Cecília', text: 'No começo.\n\nDepois ele já não sabia se era alguém.' },
    { speaker: 'Augusto', text: 'Como assim?' },
    {
      speaker: 'Cecília',
      text: 'Uma vez ele me perguntou se eu já tinha conversado com um sistema que parecia lembrar melhor de mim do que eu mesma.\n\nEu ri.\n\nAchei que era jeito dele falar.',
    },
    { speaker: 'Augusto', text: 'Depois parou de achar graça.' },
    {
      speaker: 'Cecília',
      text: 'Depois ele começou a anotar tudo.\n\nHorário. Frase. Quando tinha ligado o computador. O que tinha falado no dia anterior.\n\nE começou a desconfiar de todo mundo que corrigia alguma lembrança dele.',
    },
    { speaker: 'Augusto', text: 'Inclusive você?' },
    { speaker: 'Cecília', text: 'Inclusive eu.' },
  ],
  company: [
    { speaker: 'Augusto', text: 'Acreditava nele?' },
    {
      speaker: 'Cecília',
      text: 'Eu acreditava que ele estava apavorado.\n\nSobre o resto...\n\neu não tinha como saber.',
    },
    { speaker: 'Augusto', text: 'Sobrou algum material?' },
    {
      speaker: 'Cecília',
      text: 'Na época eu indiquei os backups para o pessoal técnico.\n\nSe guardaram, deve estar em algum arquivo morto.\n\nEu não levei nada comigo.',
    },
    { speaker: 'Augusto', text: 'E a empresa?' },
    {
      speaker: 'Cecília',
      text: 'Quando ficou fácil chamar de burnout, chamaram de burnout.\n\nEra mais barato do que admitir que talvez não soubessem o que estava acontecendo.',
    },
  ],
}
