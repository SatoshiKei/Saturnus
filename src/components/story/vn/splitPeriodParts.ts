/**
 * Divide o texto em períodos por `.` e `?` fora de trechos `{…}`.
 */
export function splitPeriodParts(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const parts: string[] = []
  let buf = ''
  let braceDepth = 0

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]!
    if (ch === '{') braceDepth++
    else if (ch === '}' && braceDepth > 0) braceDepth--

    buf += ch

    if ((ch === '.' || ch === '?') && braceDepth === 0) {
      const slice = buf.trim()
      if (slice) parts.push(slice)
      buf = ''
    }
  }

  const tail = buf.trim()
  if (tail) parts.push(tail)

  return parts.length ? parts : [trimmed]
}