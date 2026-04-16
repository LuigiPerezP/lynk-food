import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'lynk.food — Ordena desde tu mesa',
    short_name: 'lynk.food',
    description: 'Escanea el QR de tu mesa y ordena sin esperar',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1D9E75',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Panel de Cocina',
        url: '/cocina',
        description: 'Ver pedidos en tiempo real',
      },
      {
        name: 'Administración',
        url: '/admin',
        description: 'Gestionar el restaurante',
      },
    ],
  }
}
