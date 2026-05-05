import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            ¡Gracias! Tu solicitud ha sido enviada
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nos pondremos en contacto contigo en breve para confirmar tu reserva.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button className="bg-[#FF5A5F] hover:bg-[#E84850]">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}