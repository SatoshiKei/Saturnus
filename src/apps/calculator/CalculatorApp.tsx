import { useCallback, useState } from 'react'

interface CalculatorAppProps {
  /** Mantido por convenção do router; o voltar é a home indicator do shell. */
  onBack: () => void
}

type Op = '+' | '-' | '×' | '÷'

function formatDisplay(n: number): string {
  if (!Number.isFinite(n)) return 'Erro'
  const abs = Math.abs(n)
  if (abs !== 0 && (abs >= 1e9 || abs < 1e-6)) {
    return n.toExponential(5).replace('+', '')
  }
  const s = String(Number(n.toPrecision(10)))
  return s.length > 11 ? n.toPrecision(6) : s
}

/**
 * Calculadora iOS (retrato): teclado básico, ops em laranja.
 * Voltar: home indicator do PhoneShell (sem “‹ Início” no topo).
 */
export function CalculatorApp(_props: CalculatorAppProps) {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [pending, setPending] = useState<Op | null>(null)
  const [fresh, setFresh] = useState(true)

  const inputDigit = useCallback(
    (d: string) => {
      setDisplay((cur) => {
        if (fresh || cur === '0' || cur === 'Erro') return d
        if (cur.replace('-', '').replace('.', '').length >= 9) return cur
        return cur + d
      })
      setFresh(false)
    },
    [fresh],
  )

  const inputDot = useCallback(() => {
    setDisplay((cur) => {
      if (fresh || cur === 'Erro') return '0.'
      if (cur.includes('.')) return cur
      return `${cur}.`
    })
    setFresh(false)
  }, [fresh])

  const clear = () => {
    setDisplay('0')
    setAcc(null)
    setPending(null)
    setFresh(true)
  }

  const toggleSign = () => {
    setDisplay((cur) => {
      if (cur === '0' || cur === 'Erro') return cur
      return cur.startsWith('-') ? cur.slice(1) : `-${cur}`
    })
  }

  const percent = () => {
    setDisplay((cur) => {
      const n = Number(cur)
      if (!Number.isFinite(n)) return 'Erro'
      return formatDisplay(n / 100)
    })
    setFresh(true)
  }

  const applyOp = (a: number, b: number, op: Op): number => {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
        return a * b
      case '÷':
        return b === 0 ? NaN : a / b
    }
  }

  const commitOp = (next: Op | null) => {
    const cur = Number(display)
    if (!Number.isFinite(cur) && display !== 'Erro') return
    if (acc != null && pending && !fresh) {
      const result = applyOp(acc, cur, pending)
      const shown = formatDisplay(result)
      setDisplay(shown)
      setAcc(Number.isFinite(result) ? result : null)
    } else if (Number.isFinite(cur)) {
      setAcc(cur)
    }
    setPending(next)
    setFresh(true)
  }

  const equals = () => {
    if (acc == null || !pending) return
    const cur = Number(display)
    const result = applyOp(acc, cur, pending)
    setDisplay(formatDisplay(result))
    setAcc(null)
    setPending(null)
    setFresh(true)
  }

  const keys: { label: string; kind: 'fn' | 'op' | 'num' | 'zero'; onPress: () => void }[] = [
    { label: display !== '0' && !fresh ? 'C' : 'AC', kind: 'fn', onPress: clear },
    { label: '±', kind: 'fn', onPress: toggleSign },
    { label: '%', kind: 'fn', onPress: percent },
    { label: '÷', kind: 'op', onPress: () => commitOp('÷') },
    { label: '7', kind: 'num', onPress: () => inputDigit('7') },
    { label: '8', kind: 'num', onPress: () => inputDigit('8') },
    { label: '9', kind: 'num', onPress: () => inputDigit('9') },
    { label: '×', kind: 'op', onPress: () => commitOp('×') },
    { label: '4', kind: 'num', onPress: () => inputDigit('4') },
    { label: '5', kind: 'num', onPress: () => inputDigit('5') },
    { label: '6', kind: 'num', onPress: () => inputDigit('6') },
    { label: '−', kind: 'op', onPress: () => commitOp('-') },
    { label: '1', kind: 'num', onPress: () => inputDigit('1') },
    { label: '2', kind: 'num', onPress: () => inputDigit('2') },
    { label: '3', kind: 'num', onPress: () => inputDigit('3') },
    { label: '+', kind: 'op', onPress: () => commitOp('+') },
    { label: '0', kind: 'zero', onPress: () => inputDigit('0') },
    { label: ',', kind: 'num', onPress: inputDot },
    { label: '=', kind: 'op', onPress: equals },
  ]

  return (
    <div className="ios-calc" data-testid="calculator-app">
      <div className="ios-calc__display" data-testid="calculator-display" aria-live="polite">
        {display.replace('.', ',')}
      </div>
      <div className="ios-calc__pad" role="group" aria-label="Teclado da calculadora">
        {keys.map((k) => (
          <button
            key={`${k.label}-${k.kind}`}
            type="button"
            className={`ios-calc__key ios-calc__key--${k.kind}${
              k.kind === 'op' && pending && !fresh && k.label === opGlyph(pending) ? ' is-active' : ''
            }`}
            data-testid={`calc-key-${k.label}`}
            onClick={k.onPress}
          >
            {k.label}
          </button>
        ))}
      </div>
      {/* Barra inferior do shell (home indicator) faz o voltar — ver PhoneShell. */}
      <span className="ios-calc__home-spacer" aria-hidden />
    </div>
  )
}

function opGlyph(op: Op): string {
  return op === '-' ? '−' : op
}
