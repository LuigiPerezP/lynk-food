import Image from 'next/image'

interface MenuHeaderProps {
  restaurante: string
  mesa: number
}

export default function MenuHeader({ restaurante, mesa }: MenuHeaderProps) {
  return (
    <div className="sticky top-0 z-10 shadow-lg"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D3BB5 60%, #1A6BFF 100%)' }}>
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Image src="/logo.png" alt="lynkfood" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">{restaurante}</h1>
            <p className="text-xs text-blue-300 mt-0.5">Menú digital</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#93C5FD', border: '1px solid rgba(147,197,253,0.3)' }}>
            Mesa {mesa}
          </div>
        </div>
      </div>
    </div>
  )
}
