"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LogOut, Calendar, Settings, Key, Search, Truck, LogIn } from "lucide-react";
import { signInWithGoogle } from "@/lib/supabase/auth";

const ADMIN_EMAIL = "ibrahim.riani91@gmail.com";

export function Navbar() {
  const { user, signOut, viewMode, setViewMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  async function handleGoogleLogin() {
    setLoggingIn(true);
    await signInWithGoogle();
    setLoggingIn(false);
    setMenuOpen(false);
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "viajero" ? "propietario" : "viajero");
  };

  return (
    <header className={`sticky top-0 z-50 bg-card border-b border-border ${viewMode === "propietario" ? "border-l-4 border-l-[#FF5A5F]" : ""}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          FurgoRent
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-[100] mt-2 w-56 rounded-lg bg-card shadow-lg border border-border py-1">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs font-medium mt-1">
                        {viewMode === "viajero" ? "Modo Viajero" : "Modo Propietario"}
                      </p>
                    </div>

                    {viewMode === "viajero" ? (
                      <>
                        <Link
                          href="/mis-reservas"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          Mis Viajes
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/mis-furgonetas"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Truck className="h-4 w-4" />
                          Mis Furgonetas
                        </Link>
                        <Link
                          href="/reservas-recibidas"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          Reservas Recibidas
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <div className="border-t my-1" />
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Panel Admin
                        </Link>
                      </>
                    )}

                    <div className="border-t my-1" />
                    <button
                      onClick={() => { toggleViewMode(); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-accent text-[#FF5A5F]"
                    >
                      {viewMode === "viajero" ? (
                        <>
                          <Key className="h-4 w-4" />
                          Cambiar a Propietario
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Cambiar a Viajero
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => { handleSignOut(); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-destructive hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesion
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm text-foreground font-medium">Bienvenido</p>
                      <p className="text-xs text-muted-foreground">Inicia sesión para continuar</p>
                    </div>

                    <button
                      onClick={() => { handleGoogleLogin(); }}
                      disabled={loggingIn}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-accent text-foreground"
                    >
                      <LogIn className="h-4 w-4" />
                      {loggingIn ? "Conectando..." : "Iniciar con Google"}
                    </button>

                    <div className="border-t my-1" />

                    <Link
                      href="/auth"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent text-muted-foreground"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Mas opciones
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}