export function PhoneStatusBar() {
  return (
    <header className="phone-status" aria-hidden>
      <span className="phone-status__time">22:14</span>
      <span className="phone-status__icons">
        <span className="phone-status__signal" />
        <span className="phone-status__wifi" />
        <span className="phone-status__battery" />
      </span>
    </header>
  )
}
