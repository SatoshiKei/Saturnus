import { useCallback, useEffect, useRef, useState } from 'react'
import { contactById } from '../../data/mockContacts'
import { getChatById } from '../../data/mockChats'
import { chatScripts, formatClock } from '../../data/chatScripts'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { appendChatMessages, dispatchActions } from '../../game/state/investigationStore'
import { onRafaelForwardAudioPlayed } from '../../game/story/block02Handlers'
import { phoneFeatureLocks } from '../../data/phoneFeatures'
import { onJuliaChatReviewed, onRafaelAudioPlayed } from '../../game/story/block01Handlers'
import { Avatar } from '../../components/Avatar'
import { playSfx } from '../../lib/sfx'
import type { ChatMessage } from '../../types/messaging'
import { ChatComposer } from './ChatComposer'
import { ImageLightbox } from './ImageLightbox'
import { MessageBubble } from './MessageBubble'

interface ChatViewProps {
  chatId: string
  onBack: () => void
}

export function ChatView({ chatId, onBack }: ChatViewProps) {
  const inv = useInvestigation()
  const chat = getChatById(chatId, inv)
  const script = chatScripts[chatId]
  const scriptChat = Boolean(script) && inv.phones.augusto.unlockedChatIds.includes(chatId)
  const progress = inv.chatProgress[chatId] ?? { step: 0, done: false, messages: [] }
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption?: string } | null>(
    null,
  )
  const [composerHint, setComposerHint] = useState<string | null>(null)
  /** Campo de mensagem aberto: só então as opções cosméticas aparecem. */
  const [composing, setComposing] = useState(false)
  /** Libera clique nas opções só após o mouseup do toque no campo (evita escolher no mesmo gesto). */
  const [optionsReady, setOptionsReady] = useState(false)
  /** Quantas respostas ainda estão “sendo digitadas” (ocultas até o fim do atraso). */
  const [pendingReplies, setPendingReplies] = useState(0)
  const messagesRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (!chat) return
    if (chatId === 'chat-julia') onJuliaChatReviewed()
  }, [chatId, chat])

  useEffect(() => {
    setComposing(false)
    setOptionsReady(false)
    setComposerHint(null)
  }, [chatId])

  useEffect(() => {
    if (!composing) {
      setOptionsReady(false)
      return
    }
    // Espera o fim do gesto atual antes de aceitar clique nas opções.
    const t = window.setTimeout(() => setOptionsReady(true), 180)
    return () => window.clearTimeout(t)
  }, [composing])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  // Fim do roteiro: só conclui depois que todas as respostas foram exibidas.
  useEffect(() => {
    if (!scriptChat || !script) return
    if (pendingReplies > 0) return
    if (progress.step >= script.steps.length && !progress.done) {
      appendChatMessages(chatId, [], progress.step, true)
      dispatchActions(script.onComplete)
    }
  }, [scriptChat, script, pendingReplies, progress.step, progress.done, chatId])

  const visibleMessages = chat
    ? pendingReplies > 0
      ? chat.messages.slice(0, Math.max(0, chat.messages.length - pendingReplies))
      : chat.messages
    : []

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [chatId, visibleMessages.length, pendingReplies])

  const choose = useCallback(
    (optionIndex: number) => {
      if (!script || pendingReplies > 0) return
      const step = script.steps[progress.step]
      if (!step) return
      const text = step.options[optionIndex]
      const stamp = (n: number) => formatClock(script.startTime, progress.step * 2 + n)
      const mine: ChatMessage = {
        id: `${chatId}-s${progress.step}-me`,
        kind: 'text',
        from: 'me',
        text,
        timestamp: stamp(0),
        status: 'read',
      }
      const replies: ChatMessage[] = step.replies.map((r, j) =>
        r.kind === 'text'
          ? {
              id: `${chatId}-s${progress.step}-r${j}`,
              kind: 'text',
              from: 'them',
              text: r.text,
              timestamp: stamp(1),
            }
          : {
              id: r.id,
              kind: 'audio',
              from: 'them',
              audioSrc: r.audioSrc,
              durationSec: r.durationSec,
              timestamp: stamp(1),
              showAvatar: true,
            },
      )
      playSfx('msg-out')
      setComposing(false)
      setOptionsReady(false)
      appendChatMessages(chatId, [mine, ...replies], progress.step + 1, false)
      setPendingReplies(replies.length)
      replies.forEach((r, j) => {
        const len = r.kind === 'text' ? r.text.length : 30
        const delay = 900 + j * 1100 + Math.min(1400, len * 14)
        timers.current.push(
          window.setTimeout(() => {
            playSfx('msg-in')
            setPendingReplies((n) => Math.max(0, n - 1))
          }, delay),
        )
      })
    },
    [chatId, pendingReplies, progress.step, script],
  )

  if (!chat) {
    return (
      <div className="wa-chat-view">
        <p>Conversa não encontrada.</p>
      </div>
    )
  }
  const contact = contactById[chat.contactId]
  const title = chat.isGroup ? (chat.groupTitle ?? contact.name) : contact.name
  const currentStep = scriptChat && script && !progress.done ? script.steps[progress.step] : undefined
  const canCompose = Boolean(currentStep) && pendingReplies === 0
  const showOptions = canCompose && composing
  const typing = pendingReplies > 0

  return (
    <div className="wa-chat-view" data-testid="whatsapp-chat-view">
      <header className="wa-chat-header">
        <button type="button" className="wa-header__back" onClick={onBack} aria-label="Voltar à lista">
          ‹
        </button>
        <Avatar contact={contact} size={36} />
        <div className="wa-chat-header__title">
          <span className="wa-chat-header__name">{title}</span>
          {chat.isGroup ? (
            <span className="wa-chat-header__sub">toque para info do grupo</span>
          ) : (
            <span className="wa-chat-header__sub" data-testid="chat-presence">
              {typing ? 'digitando…' : 'online'}
            </span>
          )}
        </div>
        <div className="wa-chat-header__actions">
          <button
            type="button"
            className="wa-chat-header__action"
            aria-label="Vídeo chamada"
            aria-disabled={phoneFeatureLocks.videoCall}
            disabled={phoneFeatureLocks.videoCall}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M17 10.5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="wa-chat-header__action"
            aria-label="Ligação"
            aria-disabled={phoneFeatureLocks.voiceCall}
            disabled={phoneFeatureLocks.voiceCall}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M6.6 10.8c1.4 2.8 3.4 5.2 6 6.8l2-2c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.7.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C9.2 21.2 2.8 14.8 2.8 6.8 2.8 6.1 3.3 5.6 4 5.6c1.1 0 2.2.3 3.2.7.4.2.9.1 1.2-.2l2-2z"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="wa-messages" ref={messagesRef}>
        {scriptChat && visibleMessages.length === 0 && !typing ? (
          <p className="wa-empty-thread" data-testid="chat-empty-thread">
            {script?.emptyHint}
          </p>
        ) : null}
        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            contact={contact}
            allMessages={chat.messages}
            onImageOpen={(src, alt, caption) => setLightbox({ src, alt, caption })}
            onAudioPlay={
              message.kind === 'audio' && message.id === 'rf-audio-reply'
                ? onRafaelAudioPlayed
                : message.kind === 'audio' && message.id === 'r2-audio-forward'
                  ? onRafaelForwardAudioPlayed
                  : undefined
            }
          />
        ))}
        {typing ? (
          <div className="wa-row wa-row--in" data-testid="chat-typing">
            <span className="wa-row__avatar-spacer" />
            <div className="wa-bubble wa-bubble--text wa-bubble--tail-in wa-typing" aria-label="digitando">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      <footer className="wa-chat-view__footer">
        {showOptions && currentStep ? (
          <div
            className="wa-script-options"
            data-testid="chat-script-options"
            data-ready={optionsReady}
            role="group"
            aria-label="Escrever mensagem"
          >
            <p className="wa-script-options__label">Escrever</p>
            {currentStep.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                className="wa-script-options__btn"
                data-testid={`chat-option-${i}`}
                disabled={!optionsReady}
                onClick={() => choose(i)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : null}
        {composerHint ? <p className="wa-composer-hint">{composerHint}</p> : null}
        <ChatComposer
          composeAvailable={canCompose}
          composing={composing}
          onComposeOpen={() => {
            setComposerHint(null)
            setComposing(true)
          }}
          onBlockedAction={() =>
            setComposerHint(
              !scriptChat
                ? 'Envio indisponível nesta fase da investigação.'
                : typing
                  ? 'Aguarde a resposta…'
                  : 'Toque em Mensagem para escrever.',
            )
          }
        />
      </footer>

      {lightbox ? (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  )
}
