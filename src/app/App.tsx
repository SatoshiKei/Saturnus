import { PhoneSessionProvider } from './PhoneSessionContext'
import { Scene } from '../scene/Scene'
import '../styles/global.css'
import '../styles/whatsapp.css'
import '../styles/notes-calendar.css'

export default function App() {
  return (
    <PhoneSessionProvider>
      <main aria-label="SATURNUS — mesa de investigação">
        <Scene />
      </main>
    </PhoneSessionProvider>
  )
}
