interface MenuHeaderProps {
  restaurante: string
  mesa: number
}

export default function MenuHeader({ restaurante, mesa }: MenuHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{restaurante}</h1>
          <p className="text-sm text-gray-500">Mesa {mesa}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: '#E8F7F2' }}>
          🍽️
        </div>
      </div>
    </div>
  )
}
