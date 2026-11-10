export type BiaTopicId = 'jaguar' | 'permission' | 'alone' | 'driver' | 'night'

export const BIA_TOPIC_IDS: BiaTopicId[] = ['jaguar', 'permission', 'alone', 'driver', 'night']

export const biaTopicLabels: Record<BiaTopicId, string> = {
  jaguar: 'O Jaguar',
  permission: 'Autorização',
  alone: 'Sozinha?',
  driver: 'Quem dirigia',
  night: 'Aquela noite',
}

export const biaTopicFlags: Record<BiaTopicId, string> = {
  jaguar: 'block08_bia_jaguar',
  permission: 'block08_bia_permission',
  alone: 'block08_bia_alone',
  driver: 'block08_bia_driver',
  night: 'block08_bia_night',
}

export type BiaBeat = { speaker?: string; text: string }

export const biaBeats: Record<BiaTopicId, BiaBeat[]> = {
  jaguar: [
    { speaker: 'Augusto', text: 'Quero falar sobre o Jaguar do Mauro.' },
    { speaker: 'Bia', text: 'O quê que tem?' },
    { speaker: 'Augusto', text: 'XJ6 verde. 1996.' },
    { speaker: 'Bia', text: 'Isso foi há uma vida.' },
    { speaker: 'Augusto', text: 'Você bateu aquele carro?' },
    { speaker: 'Bia', text: 'Já falei disso com meu padrasto.' },
    { speaker: 'Augusto', text: 'Não perguntei o que você falou pra ele.' },
    { speaker: 'Bia', text: 'Então pergunta pra ele.' },
    { speaker: 'Augusto', text: 'Perguntei.' },
  ],
  permission: [
    {
      speaker: 'Augusto',
      text: 'Mauro disse que você não tinha autorização para sair com o Jaguar.',
    },
    { speaker: 'Bia', text: 'Eu era adulta.' },
    { speaker: 'Augusto', text: 'Não foi o que eu perguntei.' },
    { speaker: 'Bia', text: 'Era um carro da família.' },
    {
      speaker: 'Augusto',
      text: 'Era o carro dele.\n\nE ele acabou de me dizer que você não podia pegar.',
    },
    {
      speaker: 'Augusto',
      text: 'Posso voltar lá agora.\n\nPosso dizer onde aquele carro realmente bateu e perguntar por que você contou que tinha raspado manobrando.\n\nOu você pode me contar antes.',
    },
    {
      speaker: 'Bia',
      text: 'Tá.\n\nEu peguei o carro.\n\nSaí sem pedir.\n\nBati.\n\nFoi isso.',
    },
  ],
  alone: [
    { speaker: 'Augusto', text: 'Sozinha?' },
    { speaker: 'Bia', text: 'Sim.' },
    {
      speaker: 'Augusto',
      text: 'O homem que consertou o carro lembra de você.\n\nE lembra que você não apareceu sozinha.',
    },
    { speaker: 'Bia', text: '…' },
  ],
  driver: [
    { speaker: 'Augusto', text: 'Você quer continuar dizendo que estava dirigindo?' },
    { speaker: 'Bia', text: 'Eu já disse o que aconteceu.' },
    {
      speaker: 'Augusto',
      text: 'Onde vocês estavam antes.\n\nDe que lado você acertou a proteção.\n\nOnde o carro parou.\n\nQuem estava com você.',
    },
    {
      speaker: 'Augusto',
      text: 'Eu não estou aqui por causa de um Jaguar arranhado.\n\nHoras depois, uma garota morreu porque aquela proteção não segurou o peso dela.',
    },
    { speaker: 'Bia', text: 'Eu não sabia.' },
    { speaker: 'Augusto', text: 'Eu acredito que você não sabia.\n\nMas preciso saber quem estava dirigindo.' },
    { speaker: 'Bia', text: 'Rui.' },
    { speaker: 'Augusto', text: 'Rui quem?' },
    { speaker: 'Bia', text: 'Ele estava dirigindo.' },
    {
      speaker: 'Bia',
      text: 'Porque eu tinha pegado o carro escondida.\n\nPorque o Rui tinha bebido.\n\nPorque meu padrasto ia acabar com a gente se descobrisse que eu entreguei aquele carro pra ele.',
    },
  ],
  night: [
    {
      speaker: 'Bia',
      text: 'Rui perdeu o controle numa curva.\n\nPegou o guardrail de raspão.\n\nO Jaguar continuou rodando.\n\nA gente parou, entrou em pânico e foi embora.',
    },
    {
      speaker: 'Bia',
      text: 'Depois levamos o carro pro Dênis.\n\nPaguei em dinheiro.\n\nContei pro Mauro que tinha raspado manobrando.\n\nNunca liguei isso à Elisa.',
    },
    { speaker: 'Augusto', text: 'Você também tinha bebido?' },
    { speaker: 'Bia', text: 'Um pouco.\n\nEle disse que conseguia dirigir.\n\nEu tinha dezenove anos.' },
  ],
}
