# FurgoRent - Documentación Técnica Completa

## Estado del Proyecto
Proyecto completo de marketplace de alquiler de furgonetas con Next.js 15, Supabase y Tailwind CSS.

---

## 1. Estructura del Proyecto

```
/src
  /app
    /admin           # Panel de administración (protegido)
    /auth            # Login/Register
    /gracias         # Página de confirmación
    /mis-reservas    # Reservas del usuario
    /vans/[id]      # Detalle de furgoneta
    page.tsx         # Home con buscador
    layout.tsx       # Layout raíz con Navbar/Footer
    globals.css      # Estilos globales y variables
  /components
    /ui             # Componentes Shadcn UI
    Navbar.tsx       # Barra de navegación con dropdown
    VanCard.tsx      # Tarjeta de furgoneta
    Footer.tsx       # Pie de página
    AuthProvider.tsx # Proveedor de autenticación
    ThemeProvider.tsx # Proveedor de tema (dark mode)
  /lib/supabase
    client.ts        # Cliente de Supabase
    auth.ts         # Funciones de autenticación
  /services
    vans.ts         # Funciones de datos (vans, bookings)
    bookings.ts     # Funciones de disponibilidad
```

---

## 2. Base de Datos (Supabase)

### Tabla: `vans`
```sql
CREATE TABLE public.vans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT,
  price_per_day INTEGER NOT NULL, -- en céntimos
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photos TEXT[],
  amenities TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `bookings`
```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  van_id UUID REFERENCES public.vans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas RLS
```sql
-- Vans
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vans_visibles" ON public.vans FOR SELECT USING (true);
CREATE POLICY "permite_insert_vans" ON public.vans FOR INSERT TO anon WITH CHECK (true);

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permite_insert_bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "permite_select_bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "permite_update_bookings" ON public.bookings FOR UPDATE TO authenticated USING (true);
```

### Storage (Imágenes)
- Bucket: `van-images` (público)
- Políticas necesarias para upload y visualización.

---

## 3. Autenticación (Supabase + Google)

### Configuración en Supabase:
1. **Authentication → Providers → Google**
   - Habilitar Google OAuth
   - Client ID y Client Secret de Google Cloud

### Configuración en Google Cloud:
1. Crear proyecto en Google Cloud Console
2. **APIs & Services → Credentials**
   - Crear OAuth 2.0 Client ID
   - **Authorized redirect URIs**:
     - `https://tu-proyecto.supabase.co/auth/v1/callback`
   - **Authorized JavaScript origins**:
     - `https://tu-proyecto.supabase.co`

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
```

---

## 4. Rutas y Flujo de Navegación

| Ruta | Descripción | Protección |
|------|-------------|-------------|
| `/` | Home con buscador y grid de furgonetas | No |
| `/vans/[id]` | Detalle de furgoneta con calendario y reserva | Requiere auth para reservar |
| `/auth` | Login/Register con email y Google | No |
| `/mis-reservas` | Lista de reservas del usuario | Requiere auth |
| `/admin` | Panel de gestión (solo admin) | Requiere auth + email específico |
| `/gracias` | Confirmación de reserva | No |

---

## 5. Componentes Principales

### Navbar
- Logo con enlace a home
- Toggle modo oscuro (sol/luna)
- Dropdown usuario con:
  - Mis Reservas
  - Panel Admin (solo si es admin)
  - Cerrar Sesión
- Login button si no hay sesión

### VanCard
- Imagen 16:9
- Badge "Best Owner" (opcional)
- Título, ubicación con icono
- Descripción truncada
- Precio "desde X€/día"
- Clickable → `/vans/[id]`

### AuthProvider (Context)
- `user`: Usuario actual o null
- `loading`: Estado de carga
- `signOut()`: Función para cerrar sesión

### Calendario (Detalle Van)
- Fechas ocupadas mostradas en gris
- Selección con click
- Validación de rango disponible

---

## 6. Paleta de Colores

| Elemento | Light | Dark |
|----------|-------|-------|
| Primary | `#00476D` | `#0EA5E9` |
| Accent (Reservar) | `#FF5A5F` | `#FF5A5F` |
| Background | `#F4F7F9` | `#0B1120` |
| Card | `#FFFFFF` | `#1E293B` |
| Text | `#0F172A` | `#F1F5F9` |
| Muted | `#64748B` | `#94A3B8` |

---

## 7. Comandos

```bash
npm run dev     # Desarrollo (puerto 3000)
npm run build   # Producción
npm run start   # Servidor producción
```

---

## 8. Notas Importantes

- **Admin**: Solo el email `ibrahim.riani91@gmail.com` puede acceder a `/admin`
- **Dark Mode**: Implementado con `next-themes`, toggle en Navbar
- **Booking**: Se crea con `user_id` del usuario autenticado
- **Precios**: Almacenados en céntimos (75€ = 7500)

---

## 9. Dependencias Principales

```json
{
  "next": "^15.x",
  "@supabase/supabase-js": "^2.x",
  "next-themes": "^0.4.x",
  "lucide-react": "^0.400.x",
  "shadcn-ui": "latest"
}
```

---

## 10. Próximos Pasos Sugeridos

1. **Stripe Connect**: Implementar pagos reales
2. **Maps API**: Añadir mapa interactivo
3. **Notificaciones**: Email de confirmación
4. **Reviews**: Sistema de valoraciones
5. **Perfiles Host**: Dashboard para propietarios
6. **Mensajes**: Chat entre usuario y propietario
