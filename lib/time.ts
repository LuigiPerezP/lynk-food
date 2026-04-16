export function elapsedMinutes(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000)
}

export function elapsedLabel(date: Date): string {
  const totalSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function timeLabel(date: Date): string {
  return date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}
