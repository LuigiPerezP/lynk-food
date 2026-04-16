import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0a2e1f 0%, #0F6B4F 50%, #1D9E75 100%)' }}>
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in-up">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="text-4xl">🍴</span>
          </div>

          <h1 className="text-5xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'var(--font-geist)' }}>
            lynk<span style={{ color: '#6EE7B7' }}>.food</span>
          </h1>
          <p className="text-lg text-green-200 mb-10 max-w-xs mx-auto leading-relaxed">
            Escanea el QR de tu mesa y ordena sin esperar
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['Sin descargas', 'Pago en mesa', 'Tiempo real'].map((f) => (
              <span key={f}
                className="px-3 py-1 rounded-full text-xs font-medium text-green-100"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* CTA cards */}
        <div className="animate-fade-in w-full max-w-xs space-y-3" style={{ animationDelay: '0.2s' }}>
          <div className="rounded-2xl p-5 text-left"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-1">Para clientes</p>
            <p className="text-white font-semibold text-sm">Escanea el código QR de tu mesa para ver el menú y ordenar</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/login?role=cocina"
              className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="text-2xl">🍳</span>
              <span className="text-white text-xs font-semibold">Cocina</span>
            </Link>
            <Link href="/login?role=admin"
              className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="text-2xl">⚙️</span>
              <span className="text-white text-xs font-semibold">Admin</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-green-400 text-xs opacity-60">
        © 2025 lynk.food
      </footer>
    </div>
  )
}
