import { elapsedMinutes, elapsedLabel, timeLabel } from '@/lib/time'

describe('elapsedMinutes', () => {
  it('retorna 0 para fechas recientes', () => {
    const now = new Date()
    expect(elapsedMinutes(now)).toBe(0)
  })

  it('retorna minutos correctos para pedidos antiguos', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    expect(elapsedMinutes(tenMinutesAgo)).toBe(10)
  })

  it('detecta correctamente pedidos demorados (>= 10 min)', () => {
    const elevenMinutesAgo = new Date(Date.now() - 11 * 60 * 1000)
    expect(elapsedMinutes(elevenMinutesAgo)).toBeGreaterThanOrEqual(10)
  })
})

describe('elapsedLabel', () => {
  it('formatea segundos con padding', () => {
    const nineSecondsAgo = new Date(Date.now() - 9000)
    const label = elapsedLabel(nineSecondsAgo)
    expect(label).toMatch(/^0:0[5-9]$|^0:09$/) // aproximado por timing
  })

  it('formatea minutos correctamente', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const label = elapsedLabel(twoMinutesAgo)
    expect(label).toMatch(/^2:\d{2}$/)
  })
})

describe('timeLabel', () => {
  it('retorna una cadena de tiempo que contiene la hora y minutos', () => {
    const date = new Date('2024-01-15T14:30:00')
    const label = timeLabel(date)
    // El locale es-VE puede devolver "2:30 p. m." — verificamos que incluye horas y minutos
    expect(label).toMatch(/\d{1,2}:\d{2}/)
  })
})
