import { PhoneSessionProvider } from './PhoneSessionContext'
import { GameHubProvider } from './GameHubContext'
import { InvestigationBootstrap } from './InvestigationBootstrap'
import { Scene } from '../scene/Scene'
import '../styles/tokens.css'
import '../styles/global.css'
import '../styles/whatsapp.css'
import '../styles/notes-calendar.css'
import '../styles/device-apps.css'
import '../styles/investigation.css'

export default function App() {
  return (
    <GameHubProvider>
      <PhoneSessionProvider>
        <InvestigationBootstrap>
          <main aria-label="SATURNUS — mesa de investigação">
            <Scene />
          </main>
        </InvestigationBootstrap>
      </PhoneSessionProvider>
    </GameHubProvider>
  )
}
