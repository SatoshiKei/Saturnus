/** Clima mock — Costeira (sem fetch). */
export type WeatherCondition = 'clear' | 'partly' | 'cloud' | 'rain' | 'storm'

export interface HourlyForecast {
  hourLabel: string
  tempC: number
  condition: WeatherCondition
}

export interface DailyForecast {
  dayLabel: string
  highC: number
  lowC: number
  condition: WeatherCondition
}

export interface WeatherSnapshot {
  location: string
  condition: WeatherCondition
  conditionLabel: string
  tempC: number
  highC: number
  lowC: number
  feelsLikeC: number
  humidityPct: number
  windKmh: number
  hourly: HourlyForecast[]
  daily: DailyForecast[]
}

export const COSTEIRA_WEATHER: WeatherSnapshot = {
  location: 'Costeira',
  condition: 'partly',
  conditionLabel: 'Parcialmente nublado',
  tempC: 26,
  highC: 29,
  lowC: 21,
  feelsLikeC: 28,
  humidityPct: 72,
  windKmh: 14,
  hourly: [
    { hourLabel: 'Agora', tempC: 26, condition: 'partly' },
    { hourLabel: '14', tempC: 27, condition: 'partly' },
    { hourLabel: '15', tempC: 28, condition: 'clear' },
    { hourLabel: '16', tempC: 28, condition: 'clear' },
    { hourLabel: '17', tempC: 27, condition: 'partly' },
    { hourLabel: '18', tempC: 25, condition: 'cloud' },
    { hourLabel: '19', tempC: 24, condition: 'cloud' },
    { hourLabel: '20', tempC: 23, condition: 'rain' },
    { hourLabel: '21', tempC: 22, condition: 'rain' },
    { hourLabel: '22', tempC: 22, condition: 'cloud' },
  ],
  daily: [
    { dayLabel: 'Hoje', highC: 29, lowC: 21, condition: 'partly' },
    { dayLabel: 'Sáb', highC: 30, lowC: 22, condition: 'clear' },
    { dayLabel: 'Dom', highC: 28, lowC: 21, condition: 'rain' },
    { dayLabel: 'Seg', highC: 27, lowC: 20, condition: 'cloud' },
    { dayLabel: 'Ter', highC: 29, lowC: 21, condition: 'partly' },
    { dayLabel: 'Qua', highC: 31, lowC: 23, condition: 'clear' },
    { dayLabel: 'Qui', highC: 26, lowC: 20, condition: 'storm' },
  ],
}
