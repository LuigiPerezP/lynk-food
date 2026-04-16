'use client'

import { useEffect, useRef } from 'react'

interface QRGeneratorProps {
  mesa: number
  baseUrl: string
  restaurante?: string
}

type QRInstance = { append: (el: HTMLElement) => void; download: (opts: object) => void }

export default function QRGenerator({ mesa, baseUrl, restaurante = 'lynk.food' }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRInstance | null>(null)
  const url = `${baseUrl}/mesa/${mesa}`

  useEffect(() => {
    if (!canvasRef.current) return
    canvasRef.current.innerHTML = ''

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      const qr = new QRCodeStyling({
        width: 220,
        height: 220,
        data: url,
        margin: 8,
        dotsOptions: { type: 'rounded', color: '#1D9E75' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#1D9E75' },
        cornersDotOptions: { color: '#1D9E75' },
        backgroundOptions: { color: '#ffffff' },
        qrOptions: { errorCorrectionLevel: 'H' },
      })
      if (canvasRef.current) qr.append(canvasRef.current)
      qrRef.current = qr
    })
  }, [url])

  function handleDownload() {
    qrRef.current?.download({ name: `${restaurante}-mesa-${mesa}`, extension: 'png' })
  }

  function handlePrint() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const img = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR - Mesa ${mesa}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; font-family: -apple-system, sans-serif; background: #fff;
    }
    .card {
      display: flex; flex-direction: column; align-items: center;
      border: 2px solid #1D9E75; border-radius: 16px; padding: 24px 32px; gap: 12px;
      width: 300px;
    }
    .logo { font-size: 14px; font-weight: 700; color: #1D9E75; letter-spacing: 0.05em; }
    img { width: 220px; height: 220px; }
    .mesa { font-size: 28px; font-weight: 900; color: #111; }
    .sub { font-size: 11px; color: #666; }
    .url { font-size: 9px; color: #999; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <p class="logo">${restaurante.toUpperCase()}</p>
    <img src="${img}" />
    <p class="mesa">Mesa ${mesa}</p>
    <p class="sub">Escanea para ordenar</p>
    <p class="url">${url}</p>
  </div>
  <script>window.onload = () => { window.print(); window.close() }<\/script>
</body>
</html>`)
    win.document.close()
  }

  return (
    <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border-2 shadow-sm"
      style={{ borderColor: '#1D9E75' }}>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1D9E75' }}>
        {restaurante}
      </p>
      <div ref={canvasRef} />
      <p className="text-xl font-black text-gray-900">Mesa {mesa}</p>
      <p className="text-xs text-gray-400">Escanea para ordenar</p>
      <p className="text-xs text-gray-300 font-mono truncate max-w-[220px]">{url}</p>
      <div className="flex gap-2 pt-1 w-full">
        <button onClick={handleDownload}
          className="flex-1 text-xs py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">
          ⬇ Descargar PNG
        </button>
        <button onClick={handlePrint}
          className="flex-1 text-xs py-2 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: '#1D9E75' }}>
          🖨 Imprimir
        </button>
      </div>
    </div>
  )
}
