export type VerticeTopicId =
  | 'iara'
  | 'sandro'
  | 'caio'
  | 'archive'
  | 'sandro_why'
  | 'set_crossref'

export const VERTICE_TOPIC_IDS: VerticeTopicId[] = [
  'iara',
  'sandro',
  'caio',
  'sandro_why',
  'archive',
  'set_crossref',
]

export const verticeTopicLabels: Record<VerticeTopicId, string> = {
  iara: 'Falar com Iara',
  sandro: 'Falar com Sandro',
  caio: 'Falar com Caio',
  archive: 'Perguntar pelos arquivos antigos',
  sandro_why: 'Perguntar a Sandro sobre o interesse de Mariana',
  set_crossref: 'Mostrar a gravação e consultar os registros',
}

export const verticeTopicFlags: Record<VerticeTopicId, string> = {
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  archive: 'block02_vertice_archive',
  sandro_why: 'block02_vertice_sandro_why',
  set_crossref: 'block02_vertice_set_crossref',
}

export type VnBeat = { speaker?: string; text: string; portrait?: 'iara' | 'sandro' | 'caio' }

/**
 * 1ª visita (antes da cópia de Rafael): ninguém ouve, comenta ou analisa o áudio da balada.
 * 2ª visita (`set_crossref`): Caio ouve a gravação; Sandro cruza com o arquivo → Nico.
 */
export const verticeBeats: Record<VerticeTopicId, VnBeat[]> = {
  iara: [
    {
      speaker: 'Augusto',
      text: 'Boa tarde. Polícia Civil. Estou no caso da Mariana Silva e ouvi que ela passou aqui há algumas semanas.',
    },
    {
      speaker: 'Iara',
      text: 'Ah, a da foto? Passou sim.\nCara, eu nem ia lembrar se não tivesse sido tão estranho de manhã.',
      portrait: 'iara',
    },
    {
      speaker: 'Augusto',
      text: 'Estranho como?',
    },
    {
      speaker: 'Iara',
      text: 'Porque casa de balada de dia é só luz acesa e gente cansada.\nEla entrou como se já conhecesse o corredor, foi direto pro fundo pedir o Sandro.',
      portrait: 'iara',
    },
    {
      speaker: 'Augusto',
      text: 'Vocês conversaram?',
    },
    {
      speaker: 'Iara',
      text: 'Troca de duas frases.\nQueria saber quem trabalhou aqui anos atrás, som, cabine, gente que já saiu.\nEu falei o que sabia e ela ficou fazendo a mesma pergunta de um jeito diferente.',
      portrait: 'iara',
    },
    {
      speaker: 'Augusto',
      text: 'Como se não acreditasse em você?',
    },
    {
      speaker: 'Iara',
      text: 'Ué, talvez.\nOu talvez ela só estava conferindo se eu e o resto do mundo lembrávamos igual.\nÓbvio que isso me irritou um pouco.',
      portrait: 'iara',
    },
    {
      speaker: 'Augusto',
      text: 'E você acha que ela estava certa em desconfiar?',
    },
    {
      speaker: 'Iara',
      text: 'Sei lá.\nEu lembro de gente sumindo, reforma, nome trocado.\nSe ela queria precisão, fez bem em não confiar só em mim.',
      portrait: 'iara',
    },
  ],
  sandro: [
    {
      speaker: 'Augusto',
      text: 'A Iara disse que a Mariana veio te procurar. Queria ouvir sua versão.',
    },
    {
      speaker: 'Sandro',
      text: 'Minha versão?\nOlha, meu amor, ela ficou aqui bastante tempo.\nNão foi visita rápida de curiosa, não. Sentou, tomou café comigo, foi enchendo o papo.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'Sobre o quê?',
    },
    {
      speaker: 'Sandro',
      text: 'Gente antiga.\nFuncionário de salão, DJ, quem mexia na cabine quando a casa era outra.\nEla tinha lista na cabeça, eu juro, porque ia riscando mentalmente quando eu falava um nome.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'E você lembrou de quantos?',
    },
    {
      speaker: 'Sandro',
      text: 'Alguns de cabeça, sim.\nMas seis anos nessa profissão é um cemitério de história.\nEntrou gente, saiu gente, mudou sistema, teve reforma que até o prédio parecia outro.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'Ela explicou por que queria isso?',
    },
    {
      speaker: 'Sandro',
      text: 'Disse que precisava conferir uma coisa.\nEu perguntei qual, ela sorriu e mudou de assunto.\nAí eu falei pra Iara: isso ainda vai render.',
      portrait: 'sandro',
    },
  ],
  caio: [
    {
      speaker: 'Augusto',
      text: 'Você também falou com ela?',
    },
    {
      speaker: 'Caio',
      text: 'Passou por mim… sim.\nEra mais com o Sandro, mas ela parou aqui no canto da mesa.',
      portrait: 'caio',
    },
    {
      speaker: 'Augusto',
      text: 'O que ela queria saber?',
    },
    {
      speaker: 'Caio',
      text: 'Se a cabine antiga guardava registro de quem operava naquela época.\nEu… acho que guardava, em parte.\nDepois da reforma eu não sei o que ficou inteiro.',
      portrait: 'caio',
    },
    {
      speaker: 'Augusto',
      text: 'Dá para chegar em uma pessoa só com isso?',
    },
    {
      speaker: 'Caio',
      text: 'Não, pera.\nQuer dizer… sem data fechada, sem noite certa, vira pilha de nome.\nEla não me deu isso.',
      portrait: 'caio',
    },
    {
      speaker: 'Iara',
      text: 'Ela queria o Sandro mesmo. O Caio só ouviu porque estava na mesa.',
      portrait: 'iara',
    },
    {
      speaker: 'Caio',
      text: 'É.',
      portrait: 'caio',
    },
  ],
  archive: [
    {
      speaker: 'Augusto',
      text: 'Ainda existe material daquele período em algum lugar?',
    },
    {
      speaker: 'Sandro',
      text: 'Existe coisa, sim.\nEscala velha, fechamento, exportação quando o sistema era outro.\nSó que não está bonito numa pasta com etiqueta, entende? É arquivo de quem sobreviveu à reforma.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'A Mariana chegou a ver isso com você?',
    },
    {
      speaker: 'Sandro',
      text: 'Comigo, não.\nEla saiu daqui com nome, com dúvida, com segunda visita marcada na cabeça dela, não na minha.',
      portrait: 'sandro',
    },
    { speaker: 'Iara', text: 'É só isso que você queria?', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Por enquanto.' },
    {
      speaker: 'Iara',
      text: 'Quando souber o que ela caçava de verdade, volta.\nAí talvez a gente ache sem ficar adivinhando.',
      portrait: 'iara',
    },
    { speaker: 'Augusto', text: 'É o que estou tentando descobrir.' },
  ],
  sandro_why: [
    {
      speaker: 'Augusto',
      text: 'Voltando na Mariana. Ela chegou a dizer o motivo das perguntas?',
    },
    {
      speaker: 'Sandro',
      text: 'Não, querido, e eu insisti.\nEla falou que era conferência, ponto.\nComo se conferir já explicasse tudo.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'E voltou?',
    },
    {
      speaker: 'Sandro',
      text: 'Voltou uma vez.\nMesma energia, mesma lista mental.\nPerguntou de novo quem eu lembrava da cabine e foi embora sem agradecer direito, eu achei feio, mas enfim.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'Você lembra se ela chegou em algum nome específico?',
    },
    {
      speaker: 'Sandro',
      text: 'Se eu lembrasse, teria dado na hora.\nNa época eu já estava perdido no meio do tanto de gente que passou.',
      portrait: 'sandro',
    },
  ],
  /** 2ª visita — só após ANÉIS técnico (a gravação já foi analisada). */
  set_crossref: [
    { speaker: 'Iara', text: 'Você de novo.\nDessa vez parece que veio com coisa na mão.', portrait: 'iara' },
    {
      speaker: 'Augusto',
      text: 'Trouxe um trecho de áudio que a Mariana tinha mandado pra um amigo. Isolamos a voz. Quero ver se bate com o que vocês lembram da casa.',
    },
    { speaker: 'Sandro', text: 'Aí sim. Vamos ouvir.', portrait: 'sandro' },
    {
      speaker: 'Augusto',
      text: 'É curto. Barulho de pista ainda, mas dá pra ouvir a fala.',
    },
    { text: '[Augusto reproduz o trecho isolado na bancada.]' },
    {
      speaker: 'Iara',
      text: 'Isso é daqui, sim.\nSó não sei quem é falando no meio do caos.',
      portrait: 'iara',
    },
    {
      speaker: 'Sandro',
      text: 'Parece alguém da época, mas eu… não fecho só no ouvido.',
      portrait: 'sandro',
    },
    {
      speaker: 'Caio',
      text: 'Coloca de novo.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'O mesmo trecho?' },
    { speaker: 'Caio', text: 'É.', portrait: 'caio' },
    { text: '[Augusto reproduz o trecho isolado na bancada.]' },
    {
      speaker: 'Caio',
      text: 'É o Nico.',
      portrait: 'caio',
    },
    { speaker: 'Iara', text: 'Tem certeza?', portrait: 'iara' },
    {
      speaker: 'Caio',
      text: 'Tenho.\nEu ouvia ele todo fim de semana naquela fase.',
      portrait: 'caio',
    },
    {
      speaker: 'Sandro',
      text: 'Então a gente olha o administrativo e para de chutar.\nEspera aqui.',
      portrait: 'sandro',
    },
    { text: '[Sandro consulta o arquivo administrativo.]' },
    {
      speaker: 'Sandro',
      text: 'Tem mais de uma noite nesse intervalo, eu aviso logo.\nMas com essa voz no meio do barulho, fecha numa sessão só.',
      portrait: 'sandro',
    },
    { speaker: 'Sandro', text: 'Nico.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Nome completo, por favor.' },
    { speaker: 'Sandro', text: 'Nicolas Prado Reis.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ele era da cabine?' },
    {
      speaker: 'Sandro',
      text: 'DJ residente.\nNesse registro a sessão está no nome dele, não era convidado de uma noite.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Ainda está na casa?' },
    {
      speaker: 'Sandro',
      text: 'Não faz anos que ele sumiu daqui.\nContato eu não tenho fresco, talvez você ache pelo nome em outro lugar.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'Quando a Mariana veio, ela chegou nesse nome com você?',
    },
    {
      speaker: 'Sandro',
      text: 'Comigo, não.\nEla perguntava demais e explicava pouco.\nEu nem sabia o que ela estava montando na cabeça.',
      portrait: 'sandro',
    },
    {
      speaker: 'Augusto',
      text: 'Agora tenho uma linha.',
    },
    {
      speaker: 'Sandro',
      text: 'Ótimo.\nPorque eu continuo sem entender o filme inteiro.',
      portrait: 'sandro',
    },
  ],
}