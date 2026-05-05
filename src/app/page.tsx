"use client";

import { useEffect, useState, useMemo } from "react";
import { getVans, createVan, Van } from "@/services/vans";
import { VanCard } from "@/components/VanCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Search, MapPin, Truck } from "lucide-react";

const BRANDS = ["Citroën", "Peugeot", "Renault", "Ford", "Mercedes", "Volkswagen"];
const MODELS = ["Jumper", "Boxer", "Transit", "Sprinter", "Crafter", "Partner"];
const LOCATIONS = [
  "Madrid, centro",
  "Barcelona, Gràcia",
  "Valencia, centre",
  "Sevilla, centro",
  "Bilbao, centro",
  "Málaga, centro",
];

const ADMIN_EMAIL = "ibrahim.riani91@gmail.com";

function generateRandomVan(): Partial<Van> {
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  const model = MODELS[Math.floor(Math.random() * MODELS.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const pricePerDay = Math.floor(Math.random() * 150 + 50) * 100;

  return {
    owner_id: null,
    brand,
    model,
    description: `Furgoneta ${brand} ${model} perfecta para mudanzas o transporte.`,
    price_per_day: pricePerDay,
    location,
    photos: null,
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  const { user, viewMode } = useAuth();
  const [allVans, setAllVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const debouncedSearch = useDebounce(searchQuery, 150);

  useEffect(() => {
    loadAllVans();
  }, []);

  async function loadAllVans() {
    setLoading(true);
    const data = await getVans();
    setAllVans(data);
    setLoading(false);
  }

  async function addTestVan() {
    setAdding(true);
    const van = generateRandomVan() as Omit<Van, "id" | "created_at" | "updated_at">;
    await createVan(van);
    await loadAllVans();
    setAdding(false);
  }

  const filteredVans = useMemo(() => {
    if (!debouncedSearch.trim()) return allVans;
    const query = debouncedSearch.toLowerCase();
    return allVans.filter(
      (van) =>
        van.location.toLowerCase().includes(query) ||
        van.brand.toLowerCase().includes(query) ||
        van.model.toLowerCase().includes(query)
    );
  }, [allVans, debouncedSearch]);

  const showEmptyState = !loading && filteredVans.length === 0;
  const showResults = !loading && filteredVans.length > 0;
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative bg-primary py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Alquila la furgoneta perfecta para tu proximo viaje
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Descubre las mejores furgonetas al mejor precio
          </p>

          <div className="mt-8 mx-auto max-w-4xl rounded-2xl bg-card p-2 shadow-xl">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center gap-2 rounded-lg px-4 py-3 md:flex-1">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Donde quieres recoger? (ciudad, marca...)"
                  className="flex-1 outline-none bg-transparent text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button className="bg-[#FF5A5F] hover:bg-[#E84850] text-white md:rounded-xl px-8">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {hasSearch
              ? `Resultados (${filteredVans.length})`
              : `Furgonetas disponibles (${filteredVans.length})`}
          </h2>
          {user?.email === ADMIN_EMAIL && viewMode === "propietario" && (
            <Button onClick={addTestVan} disabled={adding} variant="outline" size="sm">
              {adding ? "Añadiendo..." : "+ Añadir furgo de prueba"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : showEmptyState ? (
          <Card className="rounded-xl border-0 shadow-sm bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Truck className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                {hasSearch
                  ? `No hay furgoinetas que incluyan "${searchQuery}"`
                  : "No hay furgoinetas disponibles"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {hasSearch
                  ? "Prueba con otra busqueda!"
                  : "Añade una furgo de prueba para comenzar"}
              </p>
            </CardContent>
          </Card>
        ) : showResults ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredVans.map((van, index) => (
              <VanCard key={van.id} van={van} isBestOwner={index === 0} />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}