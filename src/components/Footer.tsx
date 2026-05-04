import Link from "next/link";
import { CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">FurgoRent</h3>
            <p className="text-sm text-slate-400">
              Alquila la furgoineta perfecta para tu proximo viaje.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Alquiler</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white">Furgonetas Madrid</Link></li>
              <li><Link href="#" className="hover:text-white">Furgonetas Barcelona</Link></li>
              <li><Link href="#" className="hover:text-white">Furgonetas Valencia</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Propietarios</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white">Anunciar tu furgo</Link></li>
              <li><Link href="#" className="hover:text-white">Seguro incluido</Link></li>
              <li><Link href="#" className="hover:text-white">Centro de ayuda</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Siguenos</h4>
            <div className="flex gap-4 text-sm text-slate-400">
              <Link href="#" className="hover:text-white">Facebook</Link>
              <Link href="#" className="hover:text-white">Instagram</Link>
              <Link href="#" className="hover:text-white">Twitter</Link>
            </div>
            <div className="flex gap-2">
              <Link href="#" className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-900">
                App Store
              </Link>
              <Link href="#" className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-900">
                Google Play
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard className="h-4 w-4" />
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; 2026 FurgoRent.
          </p>
        </div>
      </div>
    </footer>
  );
}