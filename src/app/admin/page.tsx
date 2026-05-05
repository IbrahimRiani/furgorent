"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { getBookings, updateBookingStatus, createVanWithImage, getVansByStatus, approveVan, rejectVan, Booking, Van } from "@/services/vans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Truck, MapPin, XCircle, RefreshCw, AlertCircle, Calendar, FileText } from "lucide-react";

const ADMIN_EMAIL = "ibrahim.riani91@gmail.com";

type TabType = "pending" | "approved" | "rejected" | "bookings";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingVans, setPendingVans] = useState<Van[]>([]);
  const [approvedVans, setApprovedVans] = useState<Van[]>([]);
  const [rejectedVans, setRejectedVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState("");
  const [newVan, setNewVan] = useState({ brand: "", model: "", location: "", price: "", description: "", image: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.email !== ADMIN_EMAIL) {
        router.push("/");
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [bookingsData, pending, approved, rejected] = await Promise.all([
      getBookings(),
      getVansByStatus("pending"),
      getVansByStatus("approved"),
      getVansByStatus("rejected")
    ]);
    setBookings(bookingsData);
    setPendingVans(pending);
    setApprovedVans(approved);
    setRejectedVans(rejected);
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

  async function handleApproveVan(id: string) {
    const ok = await approveVan(id);
    if (ok) {
      const van = pendingVans.find(v => v.id === id);
      setPendingVans((prev) => prev.filter((v) => v.id !== id));
      if (van) setApprovedVans((prev) => [...prev, { ...van, status: "approved" }]);
      setSuccess("Furgoneta aprobada");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  async function handleRejectVan(id: string) {
    const ok = await rejectVan(id);
    if (ok) {
      const van = pendingVans.find(v => v.id === id);
      setPendingVans((prev) => prev.filter((v) => v.id !== id));
      if (van) setRejectedVans((prev) => [...prev, { ...van, status: "rejected" }]);
      setSuccess("Furgoneta rechazada");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  async function handleReviseVan(id: string) {
    const ok = await approveVan(id);
    if (ok) {
      const van = rejectedVans.find(v => v.id === id);
      setRejectedVans((prev) => prev.filter((v) => v.id !== id));
      if (van) setPendingVans((prev) => [...prev, { ...van, status: "pending" }]);
      setSuccess("Furgoneta enviada a revisar");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  async function handleRemoveVan(id: string) {
    const ok = await rejectVan(id);
    if (ok) {
      const van = approvedVans.find(v => v.id === id);
      setApprovedVans((prev) => prev.filter((v) => v.id !== id));
      if (van) setRejectedVans((prev) => [...prev, { ...van, status: "rejected" }]);
      setSuccess("Furgoneta retirada");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  async function handleAddVan(e: React.FormEvent) {
    e.preventDefault();
    if (!newVan.brand || !newVan.model || !newVan.location || !newVan.price || !newVan.image) return;
    
    setAdding(true);
    const price = parseFloat(newVan.price) * 100;
    await createVanWithImage(
      user!.id,
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
    setSuccess("Furgoneta creada");
    setTimeout(() => setSuccess(""), 3000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setNewVan((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  }

  const tabs = [
    { id: "pending" as TabType, label: `Pendientes (${pendingVans.length})`, icon: Clock },
    { id: "approved" as TabType, label: `Aprobadas (${approvedVans.length})`, icon: CheckCircle },
    { id: "rejected" as TabType, label: `Rechazadas (${rejectedVans.length})`, icon: XCircle },
    { id: "bookings" as TabType, label: `Reservas (${bookings.length})`, icon: Calendar },
  ];

  const renderVanCard = (van: Van, type: "pending" | "approved" | "rejected") => (
    <div key={van.id} className="flex items-center justify-between rounded-lg border p-4 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-24 rounded-lg bg-muted overflow-hidden">
          {van.photos?.[0] ? (
            <img src={van.photos[0]} alt={van.brand} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{van.brand} {van.model}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {van.location}
          </p>
          <p className="text-sm text-primary">{(van.price_per_day / 100).toFixed(0)} EUR/día</p>
        </div>
      </div>
      <div className="flex gap-2">
        {type === "pending" && (
          <>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveVan(van.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprobar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleRejectVan(van.id)}>
              <XCircle className="h-4 w-4 mr-1" />
              Rechazar
            </Button>
          </>
        )}
        {type === "approved" && (
          <Button size="sm" variant="outline" onClick={() => handleRemoveVan(van.id)}>
            <FileText className="h-4 w-4 mr-1" />
            Retirar
          </Button>
        )}
        {type === "rejected" && (
          <Button size="sm" variant="outline" onClick={() => handleReviseVan(van.id)}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Revisar
          </Button>
        )}
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Admin</h1>
          <Link href="/">
            <Button variant="outline" size="sm">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {showAddForm && (
          <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Añadir Furgoneta</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </CardHeader>
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
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      placeholder="Madrid, centro"
                      value={newVan.location}
                      onChange={(e) => setNewVan((prev) => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio/día (EUR)</Label>
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
                    placeholder="Descripción..."
                    value={newVan.description}
                    onChange={(e) => setNewVan((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Foto</Label>
                  <Input
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
          </Card>
        )}

        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            + Nueva Furgoneta
          </Button>
        )}

        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "pending" && (
          <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Furgonetas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-slate-500">Cargando...</p>
              ) : pendingVans.length === 0 ? (
                <p className="text-slate-500">No hay furgonetas pendientes</p>
              ) : (
                <div className="space-y-4">
                  {pendingVans.map((van) => renderVanCard(van, "pending"))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "approved" && (
          <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Furgonetas Aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-slate-500">Cargando...</p>
              ) : approvedVans.length === 0 ? (
                <p className="text-slate-500">No hay furgonetas aprobadas</p>
              ) : (
                <div className="space-y-4">
                  {approvedVans.map((van) => renderVanCard(van, "approved"))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "rejected" && (
          <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Furgonetas Rechazadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-slate-500">Cargando...</p>
              ) : rejectedVans.length === 0 ? (
                <p className="text-slate-500">No hay furgonetas rechazadas</p>
              ) : (
                <div className="space-y-4">
                  {rejectedVans.map((van) => renderVanCard(van, "rejected"))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "bookings" && (
          <Card className="rounded-xl border-0 shadow-md dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Reservas ({bookings.length})</CardTitle>
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
                        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
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
        )}
      </main>
    </div>
  );
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  };
  return styles[status] || styles.pending;
}