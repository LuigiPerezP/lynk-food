'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Algo salió mal</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        {error.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: '#1D9E75' }}
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
