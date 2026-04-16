interface StatsBarProps {
  nuevos: number
  preparando: number
  listos: number
  entregadosHoy: number
}

const stat = (label: string, value: number, color: string) => (
  <div className="flex flex-col items-center px-4 py-2 border-r border-gray-800 last:border-0">
    <span className="text-xl font-bold" style={{ color }}>{value}</span>
    <span className="text-xs text-gray-400 mt-0.5">{label}</span>
  </div>
)

export default function StatsBar({ nuevos, preparando, listos, entregadosHoy }: StatsBarProps) {
  return (
    <div className="flex justify-around bg-gray-950 text-white">
      {stat('Nuevos', nuevos, '#F59E0B')}
      {stat('Preparando', preparando, '#3B82F6')}
      {stat('Listos', listos, '#10B981')}
      {stat('Entregados hoy', entregadosHoy, '#9CA3AF')}
    </div>
  )
}
