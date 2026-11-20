import { COSTEIRA_WEATHER, type WeatherCondition } from '../../data/phoneWeather'

interface WeatherAppProps {
  onBack: () => void
}

function conditionGlyph(c: WeatherCondition): string {
  switch (c) {
    case 'clear':
      return '☀'
    case 'partly':
      return '⛅'
    case 'cloud':
      return '☁'
    case 'rain':
      return '🌧'
    case 'storm':
      return '⛈'
  }
}

/**
 * Clima estilo Weather iOS — dados locais (Costeira).
 * Voltar: home indicator do PhoneShell (sem “‹ Início” no topo).
 */
export function WeatherApp(_props: WeatherAppProps) {
  const w = COSTEIRA_WEATHER

  return (
    <div className="ios-weather" data-testid="weather-app" data-condition={w.condition}>
      <div className="ios-weather__hero">
        <p className="ios-weather__city">{w.location}</p>
        <p className="ios-weather__temp">{w.tempC}°</p>
        <p className="ios-weather__cond">{w.conditionLabel}</p>
        <p className="ios-weather__hi-lo">
          Máx.: {w.highC}° · Mín.: {w.lowC}°
        </p>
      </div>

      <section className="ios-weather__card" aria-label="Previsão horária">
        <ul className="ios-weather__hourly">
          {w.hourly.map((h) => (
            <li key={h.hourLabel} className="ios-weather__hour">
              <span>{h.hourLabel}</span>
              <span className="ios-weather__glyph" aria-hidden>
                {conditionGlyph(h.condition)}
              </span>
              <strong>{h.tempC}°</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="ios-weather__card" aria-label="Previsão diária">
        <h2 className="ios-weather__card-title">Previsão para 7 dias</h2>
        <ul className="ios-weather__daily">
          {w.daily.map((d) => (
            <li key={d.dayLabel} className="ios-weather__day">
              <span className="ios-weather__day-name">{d.dayLabel}</span>
              <span className="ios-weather__glyph" aria-hidden>
                {conditionGlyph(d.condition)}
              </span>
              <span className="ios-weather__day-range">
                <span className="is-low">{d.lowC}°</span>
                <span className="ios-weather__bar" aria-hidden />
                <span className="is-high">{d.highC}°</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ios-weather__meta">
        <div>
          <span>Sensação</span>
          <strong>{w.feelsLikeC}°</strong>
        </div>
        <div>
          <span>Umidade</span>
          <strong>{w.humidityPct}%</strong>
        </div>
        <div>
          <span>Vento</span>
          <strong>{w.windKmh} km/h</strong>
        </div>
      </section>
      <span className="ios-weather__home-spacer" aria-hidden />
    </div>
  )
}
