import { usePhoneSession } from '../app/PhoneSessionContext'
import { CalendarEventView } from '../apps/calendar/CalendarEventView'
import { CalendarHome } from '../apps/calendar/CalendarHome'
import { NoteView } from '../apps/notes/NoteView'
import { NotesHome } from '../apps/notes/NotesHome'
import { ChatView } from '../apps/whatsapp/ChatView'
import { WhatsAppHome } from '../apps/whatsapp/WhatsAppHome'
import { PhoneHome } from './PhoneHome'

export function PhoneAppRouter() {
  const { route, back } = usePhoneSession()

  switch (route.screen) {
    case 'home':
      return <PhoneHome />
    case 'app':
      if (route.appId === 'whatsapp') return <WhatsAppHome onBack={back} />
      if (route.appId === 'notes') return <NotesHome onBack={back} />
      if (route.appId === 'calendar') return <CalendarHome onBack={back} />
      return <PhoneHome />
    case 'whatsapp-chat':
      return <ChatView chatId={route.chatId} onBack={back} />
    case 'note':
      return <NoteView noteId={route.noteId} onBack={back} />
    case 'calendar-event':
      return <CalendarEventView eventId={route.eventId} onBack={back} />
    default:
      return <PhoneHome />
  }
}
