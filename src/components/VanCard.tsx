import Link from "next/link";
import { Van } from "@/services/vans";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

interface VanCardProps {
  van: Van;
  isBestOwner?: boolean;
}

export function VanCard({ van, isBestOwner = false }: VanCardProps) {
  const priceFormatted = (van.price_per_day / 100).toFixed(0);
  const photoArray = van.photos;
  const hasPhoto = photoArray && photoArray.length > 0;

  return (
    <Link href={`/vans/${van.id}`}>
      <Card className="overflow-hidden rounded-xl border-0 shadow-md hover:shadow-lg cursor-pointer bg-card text-card-foreground transition-all hover:-translate-y-1 flex flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted flex-shrink-0">
          {hasPhoto ? (
            <img
              src={photoArray[0]}
              alt={`${van.brand} ${van.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div className={`${hasPhoto ? "hidden" : ""} w-full h-full flex items-center justify-center bg-muted`}>
            <img
              src="/van-placeholder.svg"
              alt="Furgoneta"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          {isBestOwner && (
            <span className="absolute left-3 top-3 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
              Best Owner
            </span>
          )}
        </div>
        
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground truncate">
              {van.brand} {van.model}
            </h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.8</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span className="text-sm truncate">{van.location}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4 pt-0 flex-grow">
          <p className="line-clamp-2 text-sm text-muted-foreground min-h-[3rem]">
            {van.description || "Sin descripcion disponible"}
          </p>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between pt-2 pb-6 mt-auto">
          <div />
          <p className="text-xl font-bold text-foreground">
            <span className="text-sm font-medium text-muted-foreground">desde </span>
            {priceFormatted}
            <span className="text-sm font-medium text-muted-foreground"> EUR/dia</span>
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}