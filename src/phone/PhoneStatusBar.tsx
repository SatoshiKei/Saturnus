export function PhoneStatusBar() {
  return (
    <header className="phone-status" aria-hidden>
      <span className="phone-status__time">22:14</span>
      <div className="phone-status__icons">
        <svg className="phone-status__glyph" viewBox="0 0 18 12" aria-hidden>
          <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="currentColor" />
          <rect x="4" y="6" width="2.5" height="6" rx="0.5" fill="currentColor" />
          <rect x="8" y="4" width="2.5" height="8" rx="0.5" fill="currentColor" />
          <rect x="12" y="2" width="2.5" height="10" rx="0.5" fill="currentColor" opacity="0.35" />
        </svg>
        <svg className="phone-status__glyph phone-status__glyph--wifi" viewBox="0 0 16 12" aria-hidden>
          <path
            fill="currentColor"
            d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM3.2 5.8a7.8 7.8 0 0110.6 0l-1.1 1.1a6.3 6.3 0 00-8.4 0L3.2 5.8zM0 2.7A12 12 0 0116 2.7l-1.2 1.2a10.5 10.5 0 00-13.6 0L0 2.7z"
          />
        </svg>
        <svg className="phone-status__glyph phone-status__glyph--battery" viewBox="0 0 26 12" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.45"
          />
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor" />
          <rect x="23" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.45" />
        </svg>
      </div>
    </header>
  )
}
