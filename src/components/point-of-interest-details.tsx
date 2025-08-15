"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PointOfInterest } from "@/lib/data";
import { Landmark, Construction, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PointOfInterestDetailsProps = {
  poi: PointOfInterest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const layerConfig = {
    atm: { label: "Caixa Eletrônico", Icon: Landmark, variant: "default" as const},
    construction: { label: "Obras e Projetos", Icon: Construction, variant: "secondary" as const },
    incident: { label: "Incidência", Icon: TriangleAlert, variant: "destructive" as const},
};

export default function PointOfInterestDetails({ poi, open, onOpenChange }: PointOfInterestDetailsProps) {
  if (!poi) return null;

  const config = layerConfig[poi.type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
                <Badge variant={config.variant} className="mb-2">{config.label}</Badge>
                <SheetTitle className="text-2xl">{poi.title}</SheetTitle>
            </div>
            <config.Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        </SheetHeader>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{poi.description}</p>
            </div>
             <div>
                <h3 className="font-semibold mb-2">Localização</h3>
                <p className="text-muted-foreground">{`Lat: ${poi.position.lat.toFixed(6)}, Lng: ${poi.position.lng.toFixed(6)}`}</p>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
