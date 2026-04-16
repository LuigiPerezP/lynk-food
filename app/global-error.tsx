'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍴</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Error crítico</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
            La aplicación encontró un problema grave. Recarga la página.
          </p>
          <button
            onClick={reset}
            style={{ padding: '12px 24px', borderRadius: 12, background: '#1A6BFF', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }}
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  )
}
