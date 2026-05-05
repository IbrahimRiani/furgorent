"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getBookingsForOwnerVans, updateBookingStatus, Booking } from "@/services/vans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Check, X, Clock, Truck, Mail } from "lucide-react";

export default function ReservasRecibidasPage() {
  const { user, loading: authLoading, viewMode } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && viewMode === "propietario") {
      loadBookings();
    }
  }, [user, viewMode]);

  async function loadBookings() {
    if (!user) return;
    setLoading(true);
    const data = await getBookingsForOwnerVans(user.id);
    setBookings(data);
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    const success = await updateBookingStatus(id, status);
    if (success) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="flex items-center gap-1 text-green-600 text-sm"><Check className="h-4 w-4" />Confirmada</span>;
      case "cancelled":
        return <span className="flex items-center gap-1 text-red-600 text-sm"><X className="h-4 w-4" />Cancelada</span>;
      case "completed":
        return <span className="flex items-center gap-1 text-blue-600 text-sm"><Check className="h-4 w-4" />Completada</span>;
      default:
        return <span className="flex items-center gap-1 text-yellow-600 text-sm"><Clock className="h-4 w-4" />Pendiente</span>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (viewMode !== "propietario") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Accede desde el modo propietario</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Reservas Recibidas</h1>

        {bookings.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No tienes reservas todavía</p>
              <p className="text-sm text-muted-foreground mt-2">Las reservas de tus furgonetas aparecerán aquí</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                        {booking.van?.photos?.[0] ? (
                          <img src={booking.van.photos[0]} alt="" className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <Truck className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {booking.van?.brand} {booking.van?.model}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {booking.van?.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3 w-3" />
                          {booking.user_email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.start_date).toLocaleDateString("es-ES")} - {new Date(booking.end_date).toLocaleDateString("es-ES")}
                        </div>
                        <div className="mt-1">{getStatusBadge(booking.status)}</div>
                      </div>
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, "confirmed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}