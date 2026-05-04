# FurgoRent - Documentación Técnica

## Estructura del Proyecto

```
/src
  /app                 # Next.js App Router
    /admin            # Panel de administración (protegido)
    /auth             # Login/Register
    /gracias          # Página de confirmación
    /mis-reservas     # Reservas del usuario
    /vans/[id]        # Detalle de furgoneta
    page.tsx           # Home con buscador
    layout.tsx        # Layout raíz
  /components
    /ui               # Componentes Shadcn UI
    Navbar.tsx        # Barra de navegación
    VanCard.tsx      # Tarjeta de furgoneta
    AuthProvider.tsx # Proveedor de autenticación
    ThemeProvider.tsx# Proveedor de tema
  /lib/supabase
    client.ts        # Cliente de Supabase
    auth.ts          # Funciones de autenticación
  /services
    vans.ts          # Funciones de datos (vans, bookings)
    bookings.ts      # Funciones de disponibilidad
```

## Base de Datos (Supabase)

### Tablas

```sql
-- Perfiles de usuarios
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Furgonetas
CREATE TABLE public.vans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT,
  price_per_day INTEGER NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photos TEXT[],
  amenities TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservas
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  van_id UUID REFERENCES public.vans(id),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas RLS

```sql
-- Habilitar RLS
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Políticas para vans
CREATE POLICY "vans_visibles" ON public.vans FOR SELECT USING (true);
CREATE POLICY "permite_insert_vans" ON public.vans FOR INSERT TO anon WITH CHECK (true);

-- Políticas para bookings
CREATE POLICY "permite_insert_bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "permite_select_bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "permite_update_bookings" ON public.bookings FOR UPDATE TO authenticated USING (true);
```

### Storage (Imágenes)

```sql
-- Crear bucket van-images
-- En Supabase Dashboard: Storage > New bucket
-- Nombre: van-images
-- Public bucket: ON

-- Políticas
CREATE POLICY "Permitir uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'van-images');
CREATE POLICY "Ver imagenes" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'van-images');
```

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU CLAVE ANON
```

## Flujo de Navegación

1. **Home** (`/`)
   - Buscador con filtro instantáneo
   - Grid de furgonetas disponibles

2. **Detalle** (`/vans/[id]`)
   - Calendario visual con fechas ocupadas
   - Widget de reserva protegido

3. **Auth** (`/auth`)
   - Login/Register email+password
   - OAuth Google

4. **Reserva**
   - Sin login → redirige a /auth?redirect=/vans/[id]
   - Con login → crea reserva en Supabase

5. **Mis Reservas** (`/mis-reservas`)
   - Solo usuarios autenticados
   - Lista de reservas del usuario

6. **Admin** (`/admin`)
   - Solo ibrahim.riani91@gmail.com
   - Gestión de reservas y furgonetas

## Tecnologías

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + Shadcn/UI
- **Base de Datos/Auth**: Supabase
- **Estado**: React Context (AuthProvider)
- **Tema**: next-themes (Dark Mode)

## Ejecutar

```bash
npm run dev    # Desarrollo
npm run build  # Producción
```