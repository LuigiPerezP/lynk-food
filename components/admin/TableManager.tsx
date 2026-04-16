'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const QRGenerator = dynamic(() => import('./QRGenerator'), { ssr: false })

interface TableManagerProps {
  baseUrl: string
  totalMesas?: number
}

export default function TableManager({ baseUrl, totalMesas = 15 }: TableManagerProps) {
  const [selectedMesa, setSelectedMesa] = useState<number | null>(null)
  const [customTotal, setCustomTotal] = useState(totalMesas)

  const mesas = Array.from({ length: customTotal }, (_, i) => i + 1)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Mesas y códigos QR</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total de mesas:</span>
          <input
            type="number" min="1" max="99" value={customTotal}
            onChange={(e) => setCustomTotal(parseInt(e.target.value) || 1)}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {mesas.map((n) => (
          <button
            key={n}
            onClick={() => setSelectedMesa(selectedMesa === n ? null : n)}
            className={`aspect-square rounded-xl text-sm font-bold transition-all border-2 ${
              selectedMesa === n
                ? 'text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
            }`}
            style={selectedMesa === n ? { backgroundColor: '#1D9E75', borderColor: '#1D9E75' } : {}}
          >
            {n}
          </button>
        ))}
      </div>

      {selectedMesa && baseUrl && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            QR para Mesa {selectedMesa}
          </h3>
          <QRGenerator mesa={selectedMesa} baseUrl={baseUrl} />
        </div>
      )}
      {selectedMesa && !baseUrl && (
        <p className="text-sm text-gray-400 text-center py-4">Cargando QR…</p>
      )}

      {!selectedMesa && (
        <p className="text-sm text-gray-400 text-center py-4">
          Selecciona una mesa para ver su código QR
        </p>
      )}
    </div>
  )
}
