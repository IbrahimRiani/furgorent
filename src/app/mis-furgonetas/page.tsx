"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getVansByOwner, createVanWithImage, uploadVanImage, Van } from "@/services/vans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Truck, MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function MisFurgonetasPage() {
  const { user, loading: authLoading, viewMode } = useAuth();
  const router = useRouter();
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newVan, setNewVan] = useState({ brand: "", model: "", location: "", price: "", description: "", image: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && viewMode === "propietario") {
      loadVans();
    }
  }, [user, viewMode]);

  async function loadVans() {
    if (!user) return;
    setLoading(true);
    const data = await getVansByOwner(user.id);
    setVans(data);
    setLoading(false);
  }

  async function handleAddVan(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newVan.brand || !newVan.model || !newVan.location || !newVan.price || !newVan.image) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const priceNum = parseInt(newVan.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("El precio debe ser mayor que 0");
      return;
    }

    const pricePerDay = priceNum * 100;
    setAdding(true);

    const van = await createVanWithImage(
      user!.id,
      newVan.brand,
      newVan.model,
      newVan.location,
      pricePerDay,
      newVan.description,
      newVan.image
    );

    if (van) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/mis-furgonetas");
      }, 2000);
    }
    setAdding(false);
  }

  const getStatusBadge = (status: string | undefined) => {
    if (status === "approved") {
      return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" />Aprobada</span>;
    }
    return <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="h-3 w-3" />Pendiente</span>;
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Mis Furgonetas</h1>
          <Button onClick={() => { setShowAddForm(!showAddForm); setError(""); setSuccess(false); }} className="bg-[#FF5A5F] hover:bg-[#E84850]">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Furgoneta
          </Button>
        </div>

        {success && (
          <Card className="mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-400">¡Furgoneta enviada!</p>
                <p className="text-sm text-green-600 dark:text-green-500">Aparecerá en la web cuando el admin la apruebe</p>
              </div>
            </CardContent>
          </Card>
        )}

        {showAddForm && (
          <Card className="mb-8 bg-card">
            <CardContent className="p-6">
              <form onSubmit={handleAddVan} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-foreground">Marca *</Label>
                    <Input
                      placeholder="ej. Citroën"
                      value={newVan.brand}
                      onChange={(e) => setNewVan({ ...newVan, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Modelo *</Label>
                    <Input
                      placeholder="ej. Jumper"
                      value={newVan.model}
                      onChange={(e) => setNewVan({ ...newVan, model: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Ubicación *</Label>
                    <Input
                      placeholder="ej. Madrid, centro"
                      value={newVan.location}
                      onChange={(e) => setNewVan({ ...newVan, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Precio/día (EUR) *</Label>
                    <Input
                      type="number"
                      placeholder="ej. 75"
                      value={newVan.price}
                      onChange={(e) => setNewVan({ ...newVan, price: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Descripción</Label>
                  <Input
                    placeholder="Descripción de la furgoneta..."
                    value={newVan.description}
                    onChange={(e) => setNewVan({ ...newVan, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-foreground">Foto *</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewVan({ ...newVan, image: e.target.files?.[0] || null })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={adding || !newVan.brand || !newVan.model || !newVan.location || !newVan.price || !newVan.image} className="bg-[#FF5A5F] hover:bg-[#E84850]">
                    {adding ? "Enviando..." : "Crear Furgoneta"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setError(""); }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {vans.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Truck className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No tienes furgonetas todavía</p>
              <p className="text-sm text-muted-foreground mt-2">Añade tu primera furgoneta para empezar a recibir reservas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vans.map((van) => (
              <Card key={van.id} className="bg-card overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {van.photos?.[0] ? (
                    <img src={van.photos[0]} alt={`${van.brand} ${van.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Truck className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{van.brand} {van.model}</h3>
                    {getStatusBadge(van.status)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {van.location}
                  </div>
                  <p className="text-xl font-bold text-primary mt-2">
                    {(van.price_per_day / 100).toFixed(0)} EUR/día
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}