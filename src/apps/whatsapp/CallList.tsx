import { useState } from 'react'
import { augustoDeviceCallLog } from '../../data/block01/augustoCalls'
import { MARIANA_RADIO_CALL_LOG_ID, marianaDeviceCallLog } from '../../data/block01/marianaCalls'
import { contactById } from '../../data/mockContacts'
import type { CallDirection, CallLogEntry } from '../../data/mockCalls'
import type { Contact } from '../../types/messaging'
import { phoneFeatureLocks } from '../../data/phoneFeatures'
import { Avatar } from '../../components/Avatar'
import { UiGlyph } from '../../components/UiGlyph'
import { onUnknownCallerNumberSeen } from '../../game/story/block04PhoneHooks'
import { onMarianaRadioCallLogEntryOpened } from '../../game/story/block03PhoneHooks'

interface CallListProps {
  variant: 'whatsapp' | 'phone'
  device?: 'mariana' | 'augusto'
}

function directionLabel(direction: CallDirection): string {
  if (direction === 'outgoing') return 'Chamada efetuada'
  if (direction === 'incoming') return 'Chamada recebida'
  return 'Chamada não atendida'
}

export function CallList({ variant, device = 'augusto' }: CallListProps) {
  const locked = phoneFeatureLocks.voiceCall
  const log = device === 'mariana' ? marianaDeviceCallLog : augustoDeviceCallLog
  const [detail, setDetail] = useState<CallLogEntry | null>(null)

  const contactFor = (contactId: string): Contact =>
    contactById[contactId] ?? {
      id: contactId,
      name: 'Contato',
      avatarHue: 200,
      initials: '?',
    } satisfies Contact

  const openMarianaEntry = (entry: CallLogEntry) => {
    setDetail(entry)
    if (entry.contactId === 'unknown') onUnknownCallerNumberSeen()
  }

  const onRowActivate = (entry: CallLogEntry) => {
    if (device !== 'mariana') return
    openMarianaEntry(entry)
    if (entry.id === MARIANA_RADIO_CALL_LOG_ID) onMarianaRadioCallLogEntryOpened(entry.id)
  }

  if (detail && device === 'mariana') {
    return (
      <div
        className={`wa-calls wa-calls--${variant} wa-calls--detail-view`}
        data-testid="call-history"
      >
        <CallLogDetail
          entry={detail}
          contact={contactFor(detail.contactId)}
          onClose={() => setDetail(null)}
        />
      </div>
    )
  }

  return (
    <div className={`wa-calls wa-calls--${variant}`} data-testid="call-history">
      <ul className="wa-calls__list">
        {log.map((entry) => {
          const contact = contactFor(entry.contactId)
          const rowInteractive = device === 'mariana'
          return (
            <li key={entry.id}>
              <div
                className="wa-calls__row"
                role={rowInteractive ? 'button' : undefined}
                tabIndex={rowInteractive ? 0 : undefined}
                data-testid={entry.id === MARIANA_RADIO_CALL_LOG_ID ? 'mcall-radio' : undefined}
                onClick={() => rowInteractive && onRowActivate(entry)}
                onKeyDown={(e) => {
                  if (!rowInteractive) return
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  onRowActivate(entry)
                }}
              >
                <Avatar contact={contact} size={44} />
                <div className="wa-calls__body">
                  <span className={`wa-calls__name wa-calls__name--${entry.direction}`}>
                    {contact.name}
                    {entry.contactId.startsWith('unsaved') || entry.contactId === 'unknown' ? (
                      contact.phone ? (
                        <span className="wa-calls__number"> · {contact.phone}</span>
                      ) : null
                    ) : contact.phone && entry.contactId === 'radio_costeira' ? null : contact.phone ? (
                      <span className="wa-calls__number"> · {contact.phone}</span>
                    ) : null}
                  </span>
                  <span className="wa-calls__meta">
                    <CallDirectionIcon direction={entry.direction} video={entry.video} />
                    {entry.dateLabel} · {entry.time}
                    {entry.duration ? ` · ${entry.duration}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="wa-calls__action"
                  aria-label={`Ligar para ${contact.name}`}
                  aria-disabled={locked}
                  disabled={locked}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M6.6 10.8c1.4 2.8 3.4 5.2 6 6.8l2-2c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.7.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C9.2 21.2 2.8 14.8 2.8 6.8 2.8 6.1 3.3 5.6 4 5.6c1.1 0 2.2.3 3.2.7.4.2.9.1 1.2-.2l2-2z"
                    />
                  </svg>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CallLogDetail({
  entry,
  contact,
  onClose,
}: {
  entry: CallLogEntry
  contact: Contact
  onClose: () => void
}) {
  return (
    <div className="wa-calls__detail" data-testid="call-log-detail">
      <button type="button" className="wa-calls__detail-back" onClick={onClose}>
        ‹ Voltar
      </button>
      <p className="wa-calls__detail-name">{contact.name}</p>
      {contact.about ? <p className="wa-calls__detail-sub">{contact.about}</p> : null}
      {contact.phone ? <p className="wa-calls__detail-num">{contact.phone}</p> : null}
      <p className="wa-calls__detail-line">{directionLabel(entry.direction)}</p>
      <p className="wa-calls__detail-line">
        {entry.dateLabel} · {entry.time}
        {entry.duration ? ` · ${entry.duration}` : ''}
      </p>
    </div>
  )
}

function CallDirectionIcon({
  direction,
  video,
}: {
  direction: 'incoming' | 'outgoing' | 'missed'
  video?: boolean
}) {
  const color =
    direction === 'missed' ? '#e74c3c' : direction === 'incoming' ? '#27ae60' : '#3498db'
  return (
    <span className="wa-calls__dir" style={{ color }} aria-hidden>
      {video ? (
        <UiGlyph name="video" />
      ) : (
        <UiGlyph
          name={direction === 'incoming' ? 'call-in' : direction === 'outgoing' ? 'call-out' : 'call-missed'}
        />
      )}
    </span>
  )
}