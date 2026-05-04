"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { getBookings, updateBookingStatus, createVanWithImage, Booking } from "@/services/vans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_EMAIL = "ibrahim.riani91@gmail.com";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newVan, setNewVan] = useState({ brand: "", model: "", location: "", price: "", description: "", image: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.email !== ADMIN_EMAIL) {
        router.push("/");
      } else {
        loadBookings();
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadBookings();
    }
  }, [user]);

  async function loadBookings() {
    setLoading(true);
    const data = await getBookings();
    setBookings(data);
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    const success = await updateBookingStatus(id, status);
    if (success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  }

  async function handleAddVan(e: React.FormEvent) {
    e.preventDefault();
    if (!newVan.brand || !newVan.model || !newVan.location || !newVan.price || !newVan.image) return;
    
    setAdding(true);
    const price = parseFloat(newVan.price) * 100;
    await createVanWithImage(
      newVan.brand,
      newVan.model,
      newVan.location,
      price,
      newVan.description,
      newVan.image
    );
    setNewVan({ brand: "", model: "", location: "", price: "", description: "", image: null });
    setShowAddForm(false);
    setAdding(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setNewVan((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      completed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Admin - Reservas</h1>
          <Link href="/">
            <Button variant="outline" size="sm">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Añadir Furgoneta</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancelar" : "+ Nueva"}
            </Button>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <form onSubmit={handleAddVan} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      placeholder="Citroën"
                      value={newVan.brand}
                      onChange={(e) => setNewVan((prev) => ({ ...prev, brand: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      placeholder="Jumper"
                      value={newVan.model}
                      onChange={(e) => setNewVan((prev) => ({ ...prev, model: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Ciudad</Label>
                    <Input
                      id="location"
                      placeholder="Madrid, centro"
                      value={newVan.location}
                      onChange={(e) => setNewVan((prev) => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio/día (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="75"
                      value={newVan.price}
                      onChange={(e) => setNewVan((prev) => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Furgoneta perfecta para mudanzas..."
                    value={newVan.description}
                    onChange={(e) => setNewVan((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Foto</Label>
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                <Button type="submit" disabled={adding} className="w-full">
                  {adding ? "Añadiendo..." : "Añadir Furgoneta"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reservas ({bookings.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadBookings}>
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500">Cargando...</p>
            ) : bookings.length === 0 ? (
              <p className="text-slate-500">No hay reservas</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-4 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{booking.user_email}</p>
                      <p className="text-sm text-slate-500">
                        {booking.van?.brand} {booking.van?.model}
                      </p>
                      <p className="text-xs text-slate-400">
                        {booking.start_date} - {booking.end_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(booking.id, "confirmed")}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}