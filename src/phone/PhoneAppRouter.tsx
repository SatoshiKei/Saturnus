import { usePhoneSession } from '../app/PhoneSessionContext'
import { CalculatorApp } from '../apps/calculator/CalculatorApp'
import { CalendarEventView } from '../apps/calendar/CalendarEventView'
import { CalendarHome } from '../apps/calendar/CalendarHome'
import { ClockApp } from '../apps/clock/ClockApp'
import { AppStoreView } from '../apps/device/AppStoreView'
import { DeviceSettingsApp } from '../apps/device/DeviceSettingsApp'
import { FilesApp } from '../apps/device/FilesApp'
import { HiddenDiaryApp } from '../apps/device/HiddenDiaryApp'
import { PhotosApp } from '../apps/device/PhotosApp'
import { WaveLabApp } from '../apps/device/WaveLabApp'
import { NoteView } from '../apps/notes/NoteView'
import { NotesHome } from '../apps/notes/NotesHome'
import { PhoneCallsHome } from '../apps/phone/PhoneCallsHome'
import { TikTokApp } from '../apps/tiktok/TikTokApp'
import { WeatherApp } from '../apps/weather/WeatherApp'
import { ArchivedChatsView } from '../apps/whatsapp/ArchivedChatsView'
import { ChatView } from '../apps/whatsapp/ChatView'
import { WhatsAppShell } from '../apps/whatsapp/WhatsAppShell'
import { PhoneHome } from './PhoneHome'

export function PhoneAppRouter() {
  const { route, back } = usePhoneSession()

  switch (route.screen) {
    case 'home':
      return <PhoneHome />
    case 'app':
      if (route.appId === 'whatsapp') return <WhatsAppShell onBackToPhone={back} />
      if (route.appId === 'notes') return <NotesHome onBack={back} />
      if (route.appId === 'calendar') return <CalendarHome onBack={back} />
      if (route.appId === 'phone') return <PhoneCallsHome onBack={back} />
      if (route.appId === 'hidden-diary') return <HiddenDiaryApp onBack={back} />
      if (route.appId === 'calculator') return <CalculatorApp onBack={back} />
      if (route.appId === 'clock') return <ClockApp onBack={back} />
      if (route.appId === 'weather') return <WeatherApp onBack={back} />
      if (route.appId === 'tiktok') return <TikTokApp onBack={back} />
      return <PhoneHome />
    case 'whatsapp':
      return <WhatsAppShell initialTab={route.tab} onBackToPhone={back} />
    case 'whatsapp-archived':
      return <ArchivedChatsView onBack={back} />
    case 'whatsapp-chat':
      return <ChatView chatId={route.chatId} onBack={back} />
    case 'note':
      return <NoteView noteId={route.noteId} onBack={back} />
    case 'calendar-event':
      return <CalendarEventView eventId={route.eventId} onBack={back} />
    case 'appstore':
      return <AppStoreView onBack={back} />
    case 'wavelab':
      return <WaveLabApp onBack={back} />
    case 'device-settings':
      return <DeviceSettingsApp onBack={back} />
    case 'photos':
      return <PhotosApp onBack={back} />
    case 'files':
      return <FilesApp onBack={back} />
    case 'calculator':
      return <CalculatorApp onBack={back} />
    case 'clock':
      return <ClockApp onBack={back} />
    case 'weather':
      return <WeatherApp onBack={back} />
    case 'tiktok':
      return <TikTokApp onBack={back} />
    default:
      return <PhoneHome />
  }
}
