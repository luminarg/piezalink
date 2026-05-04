# PiezaLink

Marketplace B2B/B2C de repuestos automotrices. Conecta compradores con vendedores especializados.

## Stack

- **Next.js 15** (App Router + TypeScript)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS v4**
- **SheetJS** (importación Excel)

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/luminarg/piezalink.git
cd piezalink
npm install
```

### 2. Variables de entorno

Copiá `.env.local` y completá con tus credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_EMAIL=tu@email.com
```

### 3. Base de datos

Ejecutá la migración en Supabase → SQL Editor:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Correr el proyecto

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## Importación de stock (Excel)

| Columna | Requerida |
|---------|-----------|
| part_number | ✅ |
| description | ✅ |
| compatibility | ✅ |
| stock_quantity | ✅ |
| brand | opcional |
| category | opcional |

## Admin

El usuario con el email `ADMIN_EMAIL` tiene acceso al panel `/admin`.
