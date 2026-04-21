# lynk.food

Sistema de pedidos por QR para restaurantes. El cliente escanea un código QR en su mesa, ordena desde su celular y el pedido llega en tiempo real a cocina. Luis y nelson Kbron.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Firebase Firestore** (base de datos en tiempo real)
- **Vercel** (deploy)

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd lynk.food
npm install
```

### 2. Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto nuevo
3. En el panel: **Firestore Database → Crear base de datos → Modo prueba**
4. En **Configuración del proyecto → General → Tus apps → Web** copia el objeto `firebaseConfig`

### 3. Crear el archivo `.env.local`

Copia `.env.local.example` como `.env.local` y llena los valores:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_RESTAURANTE_ID=mi-restaurante

ADMIN_PASSWORD=tu_clave_admin
KITCHEN_PASSWORD=tu_clave_cocina
```

### 4. Levantar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Cargar el menú de ejemplo

```bash
curl -X POST http://localhost:3000/api/seed
```

---

## Rutas del sistema

| Ruta | Quién accede | Descripción |
|---|---|---|
| `/mesa/[numero]` | Cliente (público) | Menú y carrito |
| `/cocina` | Personal de cocina | Panel kanban de pedidos |
| `/admin` | Dueño/administrador | Menú, mesas, reportes |
| `/login` | Ambos roles | Pantalla de acceso |

---

## Deploy en Vercel

### 1. Conectar el repositorio

```bash
npm install -g vercel
vercel login
vercel
```

O importa el repositorio directamente desde [vercel.com/new](https://vercel.com/new).

### 2. Agregar variables de entorno en Vercel

En **Settings → Environment Variables** agrega todas las variables de `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_RESTAURANTE_ID`
- `ADMIN_PASSWORD`
- `KITCHEN_PASSWORD`

### 3. Deploy

```bash
vercel --prod
```

---

## Cómo agregar mesas

Las mesas se generan dinámicamente. Para agregar más:

1. Ve a `/admin` → pestaña **Mesas**
2. Cambia el número total de mesas en el campo superior
3. Haz click en el número de mesa que quieras
4. Descarga o imprime el QR generado

No se requiere configuración en Firestore — las mesas son solo números en la URL.

---

## Cómo agregar un nuevo restaurante (multitenancy)

Cada restaurante tiene su propio `NEXT_PUBLIC_RESTAURANTE_ID`. Para manejar múltiples restaurantes:

1. Crea un nuevo proyecto en Vercel (fork del repo)
2. Configura las mismas variables con `NEXT_PUBLIC_RESTAURANTE_ID=nombre-restaurante`
3. La estructura en Firestore separa los datos: `/restaurante/{id}/menu` y `/restaurante/{id}/pedidos`

---

## Estructura del proyecto

```
app/
  mesa/[numero]/    → Vista cliente
  cocina/           → Panel cocina (protegido)
  admin/            → Panel admin (protegido)
  login/            → Login de acceso
  api/
    auth/login/     → POST: autenticación
    auth/logout/    → POST: cerrar sesión
    seed/           → POST: cargar menú de ejemplo (solo dev)

components/
  menu/             → Componentes vista cliente
  kitchen/          → Componentes panel cocina
  admin/            → Componentes panel admin
  shared/           → Componentes reutilizables

lib/
  firebase.ts       → Configuración Firebase
  auth.ts           → Token HMAC para sesiones
  types.ts          → Tipos TypeScript
  time.ts           → Utilidades de tiempo
  sound.ts          → Alertas Web Audio API
  hooks/            → Custom hooks (useMenu, useOrders, useCart, ...)

middleware.ts       → Protección de rutas /admin y /cocina
```
