"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, X, User, LogOut, Calendar, Settings } from "lucide-react";

const ADMIN_EMAIL = "ibrahim.riani91@gmail.com";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
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

          {user ? (
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
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card shadow-lg border border-border py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/mis-reservas"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    Mis Reservas
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm" className="text-xs">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}