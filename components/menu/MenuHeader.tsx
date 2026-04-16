interface MenuHeaderProps {
  restaurante: string
  mesa: number
}

export default function MenuHeader({ restaurante, mesa }: MenuHeaderProps) {
  return (
    <div className="sticky top-0 z-10 shadow-lg"
      style={{ background: 'linear-gradient(135deg, #0a2e1f 0%, #0F6B4F 60%, #1D9E75 100%)' }}>
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5">
        <div>
          <h1 className="text-base font-bold text-white leading-tight">{restaurante}</h1>
          <p className="text-xs text-green-300 mt-0.5">Menú digital</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#6EE7B7', border: '1px solid rgba(110,231,183,0.3)' }}>
            Mesa {mesa}
          </div>
        </div>
      </div>
    </div>
  )
}
