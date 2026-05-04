import { supabase } from "@/lib/supabase/client";

export interface Booking {
  id: string;
  van_id: string;
  user_email: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface OccupiedDate {
  start: string;
  end: string;
}

export async function getOccupiedDates(vanId: string): Promise<OccupiedDate[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("start_date, end_date")
    .eq("van_id", vanId)
    .in("status", ["confirmed", "pending"]);

  if (error) {
    console.error("Error fetching occupied dates:", error);
    return [];
  }

  return data.map((booking) => ({
    start: booking.start_date,
    end: booking.end_date,
  }));
}

export function generateDisabledDates(occupiedDates: OccupiedDate[]): Date[] {
  const disabled: Date[] = [];

  for (const period of occupiedDates) {
    const start = new Date(period.start);
    const end = new Date(period.end);

    const current = new Date(start);
    while (current <= end) {
      disabled.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  return disabled;
}

export function checkDateAvailability(
  startDate: string,
  endDate: string,
  occupiedDates: OccupiedDate[]
): { available: boolean; conflictingDates?: string[] } {
  if (occupiedDates.length === 0) {
    return { available: true };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const conflicts: string[] = [];

  for (const period of occupiedDates) {
    const bookedStart = new Date(period.start);
    const bookedEnd = new Date(period.end);

    if (start <= bookedEnd && end >= bookedStart) {
      const conflictStart = start < bookedStart ? bookedStart : start;
      const conflictEnd = end > bookedEnd ? bookedEnd : end;

      const current = new Date(conflictStart);
      while (current <= conflictEnd) {
        conflicts.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return {
    available: conflicts.length === 0,
    conflictingDates: conflicts.length > 0 ? [...new Set(conflicts)] : undefined,
  };
}