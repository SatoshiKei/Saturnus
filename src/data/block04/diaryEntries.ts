export type DiaryEntryDef = {
  id: string
  title: string
  dateLabel: string
  body: string
  /** Flag set when the entry is opened (once). */
  readFlag: string
  /** Optional story hook after read. */
  unlocksUnknownRecording?: boolean
}

export const block04DiaryEntries: DiaryEntryDef[] = [
  {
    id: 'diary-forget',
    title: 'Antes que mude',
    dateLabel: '12/10',
    body: 'Escrevo agora porque daqui a pouco posso jurar que senti outra coisa. Não é só esquecer compromisso. É esquecer o tom. O que eu achei que alguém quis dizer.',
    readFlag: 'block04_diary_read_forget',
  },
  {
    id: 'diary-others',
    title: 'Eles sabem',
    dateLabel: '18/10',
    body: 'Às vezes acho que as pessoas ao redor lembram de mim melhor do que eu. Completam frases. Corrigem. Como se eu fosse a última a saber o que eu mesma fiz.',
    readFlag: 'block04_diary_read_others',
  },
  {
    id: 'diary-julia-a',
    title: 'Júlia',
    dateLabel: '22/10',
    body: 'Júlia insiste demais. Repete o que eu “já disse”. Às vezes parece que ela decide a versão e eu assino. Odeio pensar isso dela.',
    readFlag: 'block04_diary_read_julia_a',
  },
  {
    id: 'diary-julia-b',
    title: 'Fui injusta',
    dateLabel: '24/10',
    body: 'Fui injusta com a Júlia. Ela só tenta me ajudar a não me perder. Se eu desconfio de todo mundo, o problema sou eu.',
    readFlag: 'block04_diary_read_julia_b',
  },
  {
    id: 'diary-record',
    title: 'Gravar pra conferir',
    dateLabel: '28/10',
    body: 'Gravei a conversa com o número sem nome. Se eu esquecer o que foi dito, pelo menos o arquivo não esquece. Pasta Downloads — CHK_UNK. Preciso ouvir de novo quando a cabeça estiver firme.',
    readFlag: 'block04_diary_read_record',
    unlocksUnknownRecording: true,
  },
]
