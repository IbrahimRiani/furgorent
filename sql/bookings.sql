-- Tabla de reservas/bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  van_id UUID NOT NULL REFERENCES public.vans(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas
CREATE INDEX idx_bookings_van ON public.bookings(van_id);

-- Política RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar y ver bookings
CREATE POLICY "permite_insert_bookings" ON public.bookings
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "permite_select_bookings" ON public.bookings
FOR SELECT TO anon USING (true);