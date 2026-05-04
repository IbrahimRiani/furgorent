import { supabase } from "@/lib/supabase/client";

export interface Van {
  id: string;
  owner_id: string | null;
  brand: string;
  model: string;
  description: string | null;
  price_per_day: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  photos: string[] | null;
  amenities: string[] | null;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  van_id: string;
  user_id: string | null;
  user_email: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  van?: Van;
}

export async function getVans(location?: string): Promise<Van[]> {
  let query = supabase
    .from("vans")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (location && location.trim()) {
    query = query.ilike("location", `%${location.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching vans:", error);
    return [];
  }

  return data || [];
}

export async function getVanById(id: string): Promise<Van | null> {
  const { data, error } = await supabase
    .from("vans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching van:", error);
    return null;
  }

  return data;
}

export async function createVan(van: Omit<Van, "id" | "created_at" | "updated_at">): Promise<Van | null> {
  const { data, error } = await supabase
    .from("vans")
    .insert([van])
    .select()
    .single();

  if (error) {
    console.error("DETALLE DEL ERROR:", error.message, error.details, error.hint);
    return null;
  }

  console.log("Furgoneta insertada con éxito");
  return data;
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at">): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .insert([booking])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating booking:", error.message);
    if (error.code === "PGRST205") {
      console.error("🔧 Solución: Ejecuta el SQL para crear la tabla bookings en Supabase");
    }
    return null;
  }

  console.log("✅ Reserva creada con éxito");
  return data;
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, van:van_id(brand, model)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching bookings:", error.message);
    if (error.code === "PGRST205") {
      console.error("🔧 Solución: Ejecuta el SQL para crear la tabla bookings en Supabase");
    }
    return [];
  }

  return data || [];
}

export async function updateBookingStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("❌ Error updating booking:", error.message);
    return false;
  }

  console.log("✅ Reserva actualizada a", status);
  return true;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, van:van_id(brand, model, location, photos)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching user bookings:", error.message);
    return [];
  }

  return data || [];
}

export async function uploadVanImage(file: File): Promise<string | null> {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
  
  const { data, error } = await supabase.storage
    .from("van-images")
    .upload(fileName, file);

  if (error) {
    console.error("❌ Error uploading image:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("van-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function createVanWithImage(
  brand: string,
  model: string,
  location: string,
  pricePerDay: number,
  description: string,
  imageFile: File
): Promise<Van | null> {
  const imageUrl = await uploadVanImage(imageFile);
  if (!imageUrl) {
    console.error("❌ Error: No se pudo subir la imagen");
    return null;
  }

  return createVan({
    owner_id: null,
    brand,
    model,
    location,
    price_per_day: pricePerDay,
    description,
    photos: [imageUrl],
    latitude: null,
    longitude: null,
    amenities: null,
    is_available: true,
  });
}

export async function checkTables(): Promise<{ vans: boolean; bookings: boolean }> {
  const result = { vans: false, bookings: false };
  
  const { data: vansData, error: vansError } = await supabase
    .from("vans")
    .select("id")
    .limit(1);
  
  if (!vansError) result.vans = true;
  else console.warn("⚠️ Tabla 'vans' no encontrada en Supabase");
  
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("id")
    .limit(1);
  
  if (!bookingsError) result.bookings = true;
  else console.warn("⚠️ Tabla 'bookings' no encontrada en Supabase");
  
  return result;
}