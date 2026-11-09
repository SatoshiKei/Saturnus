import { achievementProgress, seedAchievements } from '../../data/game/seedAchievements'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { formatSaveClock } from '../../lib/caseProgress'

export function AchievementsScreen({ onBack }: { onBack: () => void }) {
  const inv = useInvestigation()
  const { unlocked, total } = achievementProgress(inv)

  return (
    <div className="inv-ach" data-testid="achievements-screen">
      <header className="inv-saves__head">
        <button type="button" className="inv-saves__back" onClick={onBack}>
          ‹ Voltar
        </button>
        <h2>Conquistas</h2>
        <p className="inv-ach__count">
          {unlocked} / {total}
        </p>
      </header>
      <ul className="inv-ach__list">
        {seedAchievements.map((a) => {
          const at = inv.achievementUnlocks?.[a.id]
          const on = Boolean(at) || a.unlocked(inv)
          const hide = a.spoiler && !on
          return (
            <li key={a.id} className="inv-ach__item" data-locked={!on || undefined} data-testid={`ach-${a.id}`}>
              <span className="inv-ach__mark" aria-hidden>
                {on ? '◆' : '◇'}
              </span>
              <div>
                <strong>{hide ? '???' : a.title}</strong>
                <p>{hide ? 'Ainda não revelado.' : on ? a.description : (a.hint ?? a.description)}</p>
                {on && at ? <small>{formatSaveClock(at)}</small> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
