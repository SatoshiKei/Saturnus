import type { ChatThread } from '../../types/messaging'

const t = (id: string, from: 'me' | 'them', text: string, time: string) =>
  ({ id, kind: 'text' as const, from, text, timestamp: time })

/** Conversa Bloco 2 — Augusto × Rafael (WhatsApp profissional). */
export const rafaelAugustoBlock02Thread: ChatThread = {
  id: 'chat-rafael-augusto',
  contactId: 'rafael',
  lastPreview: 'Áudio encaminhado',
  lastTime: '10:14',
  messages: [
    t('r2-1', 'them', 'Alô?', '10:02'),
    t('r2-2', 'me', 'Rafael?\nDelegado Augusto Nogueira.\nEstou investigando o desaparecimento de Mariana Silva.', '10:03'),
    t('r2-3', 'them', 'Caralho.\nEla sumiu mesmo então?', '10:03'),
    t('r2-4', 'me', 'Por que “mesmo”?', '10:04'),
    t('r2-5', 'them', 'A Júlia me chamou ontem perguntando se eu sabia onde ela tava.\nEu achei que ela só tinha desligado o celular ou sei lá.', '10:04'),
    t('r2-6', 'me', 'Quando foi a última vez que você falou com ela?', '10:05'),
    t('r2-7', 'them', 'Sábado.\nPor mensagem.', '10:05'),
    t('r2-8', 'me', 'Vocês estavam falando de uma gravação.', '10:06'),
    t('r2-9', 'them', 'Tá com o celular dela?', '10:06'),
    t('r2-10', 'me', 'Estou com o que foi apreendido no apartamento.', '10:07'),
    t('r2-11', 'them', 'Então tu viu.', '10:07'),
    t('r2-12', 'me', 'O arquivo que ela mandou não está mais no aparelho.', '10:08'),
    t('r2-13', 'them', 'Eu ainda tenho aqui.', '10:08'),
    t('r2-14', 'me', 'Pode encaminhar para este número?', '10:09'),
    t('r2-15', 'them', 'Mando agora.', '10:09'),
    {
      id: 'r2-audio-forward',
      kind: 'audio',
      from: 'them',
      audioSrc: '/assets/audio/rafael-forward-block02.wav',
      durationSec: 34,
      timestamp: '10:10',
      showAvatar: true,
    },
    t('r2-16', 'me', 'O que Mariana queria descobrir?', '10:11'),
    t('r2-17', 'them', 'Quem tava trabalhando no lugar quando isso foi gravado.', '10:11'),
    t('r2-18', 'me', 'Que lugar?', '10:12'),
    t('r2-19', 'them', 'Eu falei pra ela que parecia o Vértice.', '10:12'),
    t('r2-20', 'me', 'Parecia?', '10:12'),
    t('r2-21', 'them', 'Trabalho com som, não sou vidente.\nTem coisa ali que lembra o sistema antigo deles.', '10:13'),
    t('r2-22', 'me', 'Mariana disse de onde tirou a gravação?', '10:13'),
    t('r2-23', 'them', 'Disse que sabia de onde veio.\nNão disse como conseguiu.', '10:14'),
    t('r2-24', 'them', 'Perguntei.\nEla mudou de assunto.', '10:14'),
  ],
}
