import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Gracias! Tu solicitud ha sido enviada
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Nos pondremos en contacto contigo en breve para confirmar tu reserva.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button className="bg-pink-500 hover:bg-pink-600">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}