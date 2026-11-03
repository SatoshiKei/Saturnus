import { useEffect, useState } from 'react'
import { popToast, subscribeInvestigation } from '../../game/state/investigationStore'
import '../../styles/investigation.css'

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    return subscribeInvestigation(() => {
      const next = popToast()
      if (next) setMsg(next)
    })
  }, [])

  useEffect(() => {
    if (!msg) return
    const t = window.setTimeout(() => setMsg(null), 2800)
    return () => window.clearTimeout(t)
  }, [msg])

  if (!msg) return null
  return (
    <div className="inv-toast" role="status" data-testid="inv-toast">
      {msg}
    </div>
  )
}
