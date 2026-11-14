import { augustoDeviceCallLog } from '../../data/block01/augustoCalls'
import { marianaDeviceCallLog } from '../../data/block01/marianaCalls'
import { contactById } from '../../data/mockContacts'
import type { Contact } from '../../types/messaging'
import { phoneFeatureLocks } from '../../data/phoneFeatures'
import { Avatar } from '../../components/Avatar'
import { UiGlyph } from '../../components/UiGlyph'
import { onUnknownCallerNumberSeen } from '../../game/story/block04PhoneHooks'

interface CallListProps {
  variant: 'whatsapp' | 'phone'
  device?: 'mariana' | 'augusto'
}

export function CallList({ variant, device = 'augusto' }: CallListProps) {
  const locked = phoneFeatureLocks.voiceCall
  const log = device === 'mariana' ? marianaDeviceCallLog : augustoDeviceCallLog

  const contactFor = (contactId: string): Contact =>
    contactById[contactId] ?? {
      id: contactId,
      name: 'Contato',
      avatarHue: 200,
      initials: '?',
    } satisfies Contact

  return (
    <div className={`wa-calls wa-calls--${variant}`} data-testid="call-history">
      <ul className="wa-calls__list">
        {log.map((entry) => {
          const contact = contactFor(entry.contactId)
          return (
            <li key={entry.id}>
              <div
                className="wa-calls__row"
                role={entry.contactId === 'unknown' && device === 'mariana' ? 'button' : undefined}
                tabIndex={entry.contactId === 'unknown' && device === 'mariana' ? 0 : undefined}
                onClick={() => {
                  if (device !== 'mariana' || entry.contactId !== 'unknown') return
                  onUnknownCallerNumberSeen()
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  if (device !== 'mariana' || entry.contactId !== 'unknown') return
                  e.preventDefault()
                  onUnknownCallerNumberSeen()
                }}
              >
                <Avatar contact={contact} size={44} />
                <div className="wa-calls__body">
                  <span className={`wa-calls__name wa-calls__name--${entry.direction}`}>
                    {contact.name}
                    {entry.contactId === 'unknown' && contact.phone ? (
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
