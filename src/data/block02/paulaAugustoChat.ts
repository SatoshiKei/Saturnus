import type { ChatThread } from '../../types/messaging'

const t = (id: string, from: 'me' | 'them', text: string, time: string) =>
  ({ id, kind: 'text' as const, from, text, timestamp: time })

export const paulaAugustoBlock02Thread: ChatThread = {
  id: 'chat-paula-augusto',
  contactId: 'paula',
  lastPreview: 'Lucas Moreira',
  lastTime: '15:22',
  messages: [
    t('p2-1', 'them', 'Ela tá bem?', '15:18'),
    t('p2-2', 'me', 'Ainda estamos tentando localizar Mariana.\nPreciso entender algumas coisas que ela estava fazendo antes de desaparecer.', '15:18'),
    t('p2-3', 'them', 'Tá.', '15:19'),
    t('p2-4', 'me', 'Ela pediu alguma coisa incomum recentemente?', '15:19'),
    t('p2-5', 'them', 'Ela tava procurando um cara.', '15:20'),
    t('p2-6', 'me', 'Quem?', '15:20'),
    t('p2-7', 'them', 'Lucas.', '15:20'),
    t('p2-8', 'me', 'Sobrenome?', '15:21'),
    t('p2-9', 'them', 'Moreira.', '15:21'),
    t('p2-10', 'me', 'Você conhece ele?', '15:21'),
    t('p2-11', 'them', 'Não.\nNem ela conhecia.', '15:21'),
    t('p2-12', 'me', 'Então por que Mariana pediu sua ajuda?', '15:22'),
    t('p2-13', 'them', 'Porque eu ainda tenho contato com gente da faculdade.\nEla sabia que ele tinha estudado lá.', '15:22'),
    t('p2-14', 'me', 'E vocês encontraram?', '15:22'),
    t('p2-15', 'them', 'Eu consegui o Instagram.\nPassei pra ela.', '15:22'),
    t('p2-16', 'me', 'Ela falou o que queria com ele?', '15:23'),
    t('p2-17', 'them', 'Não direito.\nDisse que era coisa antiga da família.', '15:23'),
  ],
}
