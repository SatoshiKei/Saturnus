/** Glifos de interface do celular (SVG simples, `currentColor`). Substitui emoji/unicode como ícone. */
export type UiGlyphName =
  | 'search'
  | 'archive'
  | 'doc'
  | 'wifi'
  | 'bluetooth'
  | 'bell'
  | 'gear'
  | 'contrast'
  | 'lock'
  | 'battery'
  | 'storage'
  | 'call-in'
  | 'call-out'
  | 'call-missed'
  | 'video'

interface UiGlyphProps {
  name: UiGlyphName
  className?: string
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function UiGlyph({ name, className = 'ui-glyph' }: UiGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" data-glyph={name}>
      {glyphPath(name)}
    </svg>
  )
}

function glyphPath(name: UiGlyphName) {
  switch (name) {
    case 'search':
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6" {...stroke} />
          <path d="M15 15l5 5" {...stroke} />
        </>
      )
    case 'archive':
      return (
        <>
          <rect x="3.5" y="4.5" width="17" height="4.5" rx="1.2" {...stroke} />
          <path d="M5 9v9a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 18V9M10 13h4" {...stroke} />
        </>
      )
    case 'doc':
      return (
        <>
          <path d="M7 3.5h7l4.5 4.5v11A1.5 1.5 0 0117 20.5H7A1.5 1.5 0 015.500 19V5A1.500 1.500 0 017 3.500z" {...stroke} />
          <path d="M14 3.500V8h4.500" {...stroke} />
        </>
      )
    case 'wifi':
      return (
        <>
          <path d="M3 9.500a13 13 0 0118 0M6 13a8.500 8.500 0 0112 0M9.200 16.300a4 4 0 015.600 0" {...stroke} />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </>
      )
    case 'bluetooth':
      return <path d="M7 8l10 8-5 4.500V3.500L17 8 7 16" {...stroke} />
    case 'bell':
      return (
        <>
          <path d="M6 16.500V11a6 6 0 0112 0v5.500l1.500 1.500h-15z" {...stroke} />
          <path d="M10 20.500a2 2 0 004 0" {...stroke} />
        </>
      )
    case 'gear':
      return (
        <>
          <circle cx="12" cy="12" r="3.200" {...stroke} />
          <path
            d="M12 3.500v2.300M12 18.200v2.300M3.500 12h2.300M18.200 12h2.300M6 6l1.600 1.600M16.400 16.400L18 18M6 18l1.600-1.600M16.400 7.600L18 6"
            {...stroke}
          />
        </>
      )
    case 'contrast':
      return (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M12 4a8 8 0 010 16z" fill="currentColor" />
        </>
      )
    case 'lock':
      return (
        <>
          <rect x="5.500" y="10.500" width="13" height="9.500" rx="2" {...stroke} />
          <path d="M8.500 10.500V8a3.500 3.500 0 017 0v2.500" {...stroke} />
        </>
      )
    case 'battery':
      return (
        <>
          <rect x="3" y="8" width="16" height="9" rx="2.200" {...stroke} />
          <path d="M21 11v3" {...stroke} />
          <rect x="5.200" y="10.200" width="8" height="4.600" rx="1" fill="currentColor" />
        </>
      )
    case 'storage':
      return (
        <>
          <ellipse cx="12" cy="6.500" rx="7" ry="2.800" {...stroke} />
          <path d="M5 6.500v11c0 1.500 3.100 2.800 7 2.800s7-1.300 7-2.800v-11M5 12c0 1.500 3.100 2.800 7 2.800s7-1.300 7-2.800" {...stroke} />
        </>
      )
    case 'call-in':
      return <path d="M17 7L7 17M7 9v8h8" {...stroke} />
    case 'call-out':
      return <path d="M7 17L17 7M9 7h8v8" {...stroke} />
    case 'call-missed':
      return <path d="M17 17L7 7M7 15V7h8" {...stroke} />
    case 'video':
      return (
        <>
          <rect x="3.500" y="7" width="12" height="10" rx="2.200" {...stroke} />
          <path d="M15.500 11l5-3v8l-5-3" {...stroke} />
        </>
      )
    default:
      return null
  }
}
