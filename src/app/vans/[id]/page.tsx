"use client";

import { useState, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getVanById, createBooking, Van } from "@/services/vans";
import { getOccupiedDates, checkDateAvailability, OccupiedDate } from "@/services/bookings";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Users,
  Snowflake,
  Fuel,
  Settings,
  Check,
  ArrowLeft,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

interface VanPageProps {
  params: Promise<{ id: string }>;
}

function getMinDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days: (Date | null)[] = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isDateInRange(date: Date, start: string, end: string): boolean {
  if (!start || !end) return false;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return date >= startDate && date <= endDate;
}

function isDateBlocked(date: Date, disabledDays: string[]): boolean {
  const dateStr = date.toISOString().split("T")[0];
  return disabledDays.includes(dateStr);
}

export default function VanPage({ params }: VanPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justLoggedIn = searchParams.get("logged_in") === "true";
  const { user } = useAuth();
  const [van, setVan] = useState<Van | null>(null);
  const [occupiedDates, setOccupiedDates] = useState<OccupiedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showLoginMessage, setShowLoginMessage] = useState(justLoggedIn);

  useEffect(() => {
    if (justLoggedIn) {
      setTimeout(() => setShowLoginMessage(false), 5000);
    }
  }, [justLoggedIn]);

  const disabledDays = useMemo(() => {
    const disabled: string[] = [];
    for (const period of occupiedDates) {
      const start = new Date(period.start);
      const end = new Date(period.end);
      const current = new Date(start);
      while (current <= end) {
        disabled.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }
    return disabled;
  }, [occupiedDates]);

  useEffect(() => {
    async function loadData() {
      const { id } = await params;
      const vanData = await getVanById(id);
      if (vanData) {
        setVan(vanData);
        const dates = await getOccupiedDates(id);
        setOccupiedDates(dates);
      }
      setLoading(false);
    }
    loadData();
  }, [params]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    }
  }, [user]);

  const monthDays = useMemo(() => {
    return getMonthDays(calendarDate.getFullYear(), calendarDate.getMonth());
  }, [calendarDate]);

  const monthName = calendarDate.toLocaleString("es-ES", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!van) {
    notFound();
  }

  const pricePerDay = van.price_per_day / 100;
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const nights = start && end ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights > 0 ? nights * pricePerDay : 0;

  function handleStartDateChange(value: string) {
    setAvailabilityError("");
    setStartDate(value);
    if (value && endDate) {
      const startDateCheck = new Date(value);
      const endDateCheck = new Date(endDate);
      let hasConflict = false;
      const current = new Date(startDateCheck);
      while (current <= endDateCheck) {
        if (isDateBlocked(current, disabledDays)) {
          hasConflict = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }
      if (hasConflict) setEndDate("");
    }
  }

  function handleEndDateChange(value: string) {
    setAvailabilityError("");
    setEndDate(value);
  }

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!van || nights <= 0 || !email) return;

    if (!user) {
      router.push(`/auth?redirect=/vans/${van.id}`);
      return;
    }

    const availability = checkDateAvailability(startDate, endDate, occupiedDates);
    if (!availability.available) {
      setAvailabilityError("Algunas de las fechas seleccionadas ya no estan disponibles");
      return;
    }
    
    setSubmitting(true);
    
    const booking = await createBooking({
      van_id: van.id,
      user_id: user.id,
      user_email: email,
      start_date: startDate,
      end_date: endDate,
      status: "pending",
    });
    
    if (booking) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/gracias");
      }, 1500);
    }
    setSubmitting(false);
  }

  function handleDayClick(day: Date | null) {
    if (!day) return;
    const dateStr = day.toISOString().split("T")[0];
    const minDate = getMinDate();
    
    if (dateStr < minDate || isDateBlocked(day, disabledDays)) return;

    if (!startDate || (startDate && endDate) || new Date(startDate) > new Date(dateStr)) {
      setStartDate(dateStr);
      setEndDate("");
    } else if (new Date(dateStr) < new Date(startDate)) {
      setStartDate(dateStr);
      setEndDate("");
    } else {
      let hasConflict = false;
      const current = new Date(startDate);
      const endCheck = new Date(dateStr);
      while (current <= endCheck) {
        if (isDateBlocked(current, disabledDays)) {
          hasConflict = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }
      if (hasConflict) {
        setStartDate(dateStr);
        setEndDate("");
      } else {
        setEndDate(dateStr);
      }
    }
  }

  const photoArray = van.photos;
  const hasPhoto = photoArray && photoArray.length > 0;
  const photoUrl = hasPhoto ? photoArray[0] : "/van-placeholder.svg";

  const features = [
    { icon: Users, label: "3 Plazas" },
    { icon: Snowflake, label: "Aire acondicionado" },
    { icon: Fuel, label: "Diisel" },
    { icon: Settings, label: "Cambio manual" },
  ];

  const minimumStartDate = getMinDate();
  const minimumEndDate = startDate || minimumStartDate;
  const minYear = new Date().getFullYear();
  const minMonth = new Date().getMonth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-01 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <Link href="/" className="text-2xl font-bold text-primary">
            FurgoRent
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-md">
              <img
                src={photoUrl}
                alt={`${van.brand} ${van.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {features.map((feature, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
                >
                  <feature.icon className="h-4 w-4" />
                  {feature.label}
                </span>
              ))}
            </div>

            <Card className="rounded-xl border-0 shadow-sm bg-card">
              <CardHeader>
                <h1 className="text-2xl font-bold text-foreground">
                  {van.brand} {van.model}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{van.location}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Descripcion</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {van.description || "Furgoneta perfecta para tus desplazamientos."}
                </p>
                <h2 className="text-lg font-semibold text-foreground">Incluido</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> Seguro a todo riesgo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> Assistance en carretera
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card className="rounded-xl border-0 shadow-lg bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{pricePerDay}</span>
                    <span className="text-muted-foreground">EUR/noche</span>
                  </div>
                  {occupiedDates.length > 0 && (
                    <p className="text-xs text-orange-500">
                      Fechas ocupadas en gris
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Selecciona las fechas:</p>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <input
                        type="text"
                        readOnly
                        value={startDate ? new Date(startDate).toLocaleDateString("es-ES") : "Selecciona"}
                        className="bg-card border border-border px-3 py-2 rounded cursor-pointer w-full text-center text-foreground"
                        placeholder="Desde"
                        onClick={() => {}}
                      />
                      <span className="mx-2 text-muted-foreground">-</span>
                      <input
                        type="text"
                        readOnly
                        value={endDate ? new Date(endDate).toLocaleDateString("es-ES") : "Selecciona"}
                        className="bg-card border border-border px-3 py-2 rounded cursor-pointer w-full text-center text-foreground"
                        placeholder="Hasta"
                        onClick={() => {}}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                        disabled={calendarDate.getFullYear() === minYear && calendarDate.getMonth() === minMonth}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30 text-foreground"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="font-medium capitalize text-foreground">{monthName}</span>
                      <button
                        type="button"
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                        className="p-1 hover:bg-muted rounded text-foreground"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {["D", "L", "M", "X", "J", "V", "S"].map((d, i) => (
                        <div key={i} className="py-1 text-muted-foreground">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {monthDays.map((day, i) => {
                        if (!day) return <div key={i} />;
                        const dateStr = day.toISOString().split("T")[0];
                        const isDisabled = dateStr < getMinDate() || isDateBlocked(day, disabledDays);
                        const isSelected = startDate && endDate && isDateInRange(day, startDate, endDate);
                        const isStart = startDate === dateStr;
                        const isEnd = endDate === dateStr;
                        
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDayClick(day)}
                            className={`
                              py-2 rounded text-sm
                              ${isDisabled ? "bg-muted text-muted-foreground/50 line-through cursor-not-allowed" : ""}
                              ${!isDisabled && isSelected ? "bg-[#FF5A5F]/20 text-[#FF5A5F]" : ""}
                              ${!isDisabled && isStart ? "bg-[#FF5A5F] text-white rounded-l" : ""}
                              ${!isDisabled && isEnd ? "bg-[#FF5A5F] text-white rounded-r" : ""}
                              ${!isDisabled && !isSelected && !isStart && !isEnd ? "hover:bg-muted text-foreground" : ""}
                            `}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{pricePerDay}EUR x {nights} noches</span>
                        <span>{totalPrice}EUR</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-foreground">
                        <span>Total</span>
                        <span>{totalPrice}EUR</span>
                      </div>
                    </div>
                  )}

                  {availabilityError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-900/20 p-3 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{availabilityError}</span>
                    </div>
                  )}

<div>
                      <Label className="text-foreground">Tu email</Label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    {showLoginMessage && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Ya puedes completar tu reserva</span>
                      </div>
                    )}

                    <Button
                    type="button"
                    disabled={submitting || nights <= 0 || !email}
                    onClick={handleSubmit}
                    className="w-full bg-[#FF5A5F] hover:bg-[#E84850] text-white py-6 text-lg font-medium"
                  >
                    {submitting ? "Enviando..." : "Solicitar reserva"}
                  </Button>

                  {success && (
                    <p className="text-center text-green-600 font-medium">
                      Solicitud enviada. Redirigiendo...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}