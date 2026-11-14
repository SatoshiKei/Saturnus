export type CasebookFilterOption<T extends string> = {
  id: T
  label: string
}

/** Controlo de filtros editorial do caderno (Quadro / Evidências). `compact` = chips de cabeçalho. */
export function CasebookFilterBar<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  compact = false,
  testIdPrefix,
}: {
  options: readonly CasebookFilterOption<T>[]
  value: T
  onChange: (id: T) => void
  ariaLabel: string
  compact?: boolean
  testIdPrefix?: string
}) {
  return (
    <div
      className={`cb-filter-bar${compact ? ' cb-filter-bar--compact' : ''}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          className="cb-filter-chip"
          aria-selected={value === opt.id}
          data-active={value === opt.id || undefined}
          data-testid={testIdPrefix ? `${testIdPrefix}-${opt.id}` : undefined}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
