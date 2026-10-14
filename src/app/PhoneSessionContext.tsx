import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PhoneRoute } from '../types/phone'
import {
  currentRoute,
  navigateBack,
  phoneHome,
  pushRoute,
} from '../lib/phoneRouter'

interface PhoneSessionContextValue {
  phoneOpen: boolean
  openPhone: () => void
  closePhone: () => void
  routeStack: PhoneRoute[]
  route: PhoneRoute
  push: (route: PhoneRoute) => void
  back: () => void
  resetRoutes: () => void
}

const PhoneSessionContext = createContext<PhoneSessionContextValue | null>(null)

export function PhoneSessionProvider({ children }: { children: ReactNode }) {
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [routeStack, setRouteStack] = useState<PhoneRoute[]>([phoneHome()])

  const openPhone = useCallback(() => setPhoneOpen(true), [])
  const closePhone = useCallback(() => {
    setPhoneOpen(false)
    setRouteStack([phoneHome()])
  }, [])

  const push = useCallback((route: PhoneRoute) => {
    setRouteStack((s) => pushRoute(s, route))
  }, [])

  const back = useCallback(() => {
    setRouteStack((s) => navigateBack(s))
  }, [])

  const resetRoutes = useCallback(() => setRouteStack([phoneHome()]), [])

  const value = useMemo(
    () => ({
      phoneOpen,
      openPhone,
      closePhone,
      routeStack,
      route: currentRoute(routeStack),
      push,
      back,
      resetRoutes,
    }),
    [phoneOpen, openPhone, closePhone, routeStack, push, back, resetRoutes],
  )

  return (
    <PhoneSessionContext.Provider value={value}>{children}</PhoneSessionContext.Provider>
  )
}

export function usePhoneSession(): PhoneSessionContextValue {
  const ctx = useContext(PhoneSessionContext)
  if (!ctx) throw new Error('usePhoneSession outside provider')
  return ctx
}
