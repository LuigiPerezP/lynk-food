interface OrderConfirmationProps {
  orderId: string
  mesa: number
  hora: string
  onBack: () => void
}

export default function OrderConfirmation({ orderId, mesa, hora, onBack }: OrderConfirmationProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)' }}>

      {/* Check icon */}
      <div className="animate-check-pop mb-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #0F6B4F, #1D9E75)', boxShadow: '0 8px 30px rgba(29,158,117,0.4)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¡Pedido enviado!</h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          Cocina recibió tu orden. Te avisamos cuando esté listo.
        </p>
      </div>

      {/* Receipt card */}
      <div className="animate-fade-in-up w-full max-w-xs rounded-3xl overflow-hidden shadow-lg mb-8"
        style={{ animationDelay: '0.1s' }}>
        <div className="px-5 py-3"
          style={{ background: 'linear-gradient(135deg, #0a2e1f, #0F6B4F)' }}>
          <p className="text-green-300 text-xs font-semibold tracking-widest uppercase">Comprobante</p>
        </div>
        <div className="bg-white px-5 py-4 space-y-3">
          {[
            { label: 'Mesa', value: String(mesa) },
            { label: 'N° pedido', value: `#${orderId.slice(-6).toUpperCase()}`, mono: true },
            { label: 'Hora', value: hora },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{row.label}</span>
              <span className={`font-bold text-gray-900 ${row.mono ? 'font-mono text-xs' : ''}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="px-8 py-3.5 rounded-2xl font-bold text-white text-sm active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #0F6B4F, #1D9E75)', boxShadow: '0 4px 20px rgba(29,158,117,0.35)' }}
      >
        Volver al menú
      </button>

      <p className="mt-4 text-xs text-gray-400">Puedes hacer otro pedido en cualquier momento</p>
    </div>
  )
}
