-- Policy for UPDATE on bookings
DROP POLICY IF EXISTS "permite_update_bookings" ON public.bookings;

CREATE POLICY "permite_update_bookings" ON public.bookings
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);