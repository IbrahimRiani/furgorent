"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getUserBookings, Booking } from "@/services/vans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Clock, Truck } from "lucide-react";

function getStatusBadge(status: string) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-muted text-foreground",
  };
  return styles[status as keyof typeof styles] || styles.pending;
}

export default function MisReservasPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  async function loadBookings() {
    if (!user) return;
    setLoading(true);
    const data = await getUserBookings(user.id);
    setBookings(data);
    setLoading(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Debes iniciar sesion para ver tus reservas</p>
          <Link href="/auth">
            <Button className="bg-[#FF5A5F] hover:bg-[#E84850]">Iniciar Sesion</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <main className="mx-auto max-w-3xl px-6 pb-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Mis Reservas</h1>

        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : bookings.length === 0 ? (
          <Card className="rounded-xl border-0 shadow-sm bg-card">
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes reservas</p>
              <Link href="/" className="mt-4 inline-block">
                <Button className="bg-[#FF5A5F] hover:bg-[#E84850]">
                  Ver furgoinetas disponibles
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const van = booking.van;
              const photoUrl = van?.photos?.[0] || "/van-placeholder.svg";

              return (
                <Card key={booking.id} className="rounded-xl border-0 shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={photoUrl}
                          alt={van?.brand}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {van?.brand} {van?.model}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {van?.location}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {booking.start_date} - {booking.end_date}
                          </div>
                        </div>
                        {booking.status === "confirmed" && (
                          <Link href={`/vans/${booking.van_id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                            >
                              Ver detalles
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}