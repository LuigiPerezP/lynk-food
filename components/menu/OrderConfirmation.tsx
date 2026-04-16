interface OrderConfirmationProps {
  orderId: string
  mesa: number
  hora: string
  onBack: () => void
}

export default function OrderConfirmation({ orderId, mesa, hora, onBack }: OrderConfirmationProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="text-6xl mb-6">✅</div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido enviado!</h2>
      <p className="text-gray-500 mb-8">
        Tu pedido fue recibido por cocina. Te avisamos cuando esté listo.
      </p>

      <div className="w-full max-w-xs bg-gray-50 rounded-2xl p-5 space-y-3 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Mesa</span>
          <span className="font-semibold text-gray-900">{mesa}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">N° de pedido</span>
          <span className="font-mono text-xs font-semibold text-gray-900">
            {orderId.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Hora</span>
          <span className="font-semibold text-gray-900">{hora}</span>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-8 px-8 py-3 rounded-2xl font-semibold text-white text-sm"
        style={{ backgroundColor: '#1D9E75' }}
      >
        Volver al menú
      </button>

      <p className="mt-4 text-xs text-gray-400">
        Puedes hacer otro pedido en cualquier momento
      </p>
    </div>
  )
}
