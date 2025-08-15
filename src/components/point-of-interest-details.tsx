"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PointOfInterest } from "@/lib/data";
import { Landmark, Construction, Siren, ThumbsUp, ThumbsDown, Trash, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

type PointOfInterestDetailsProps = {
  poi: PointOfInterest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPoiStatusChange: (poiId: string, status: PointOfInterest['status']) => void;
};

const layerConfig = {
    atm: { label: "Caixa Eletrônico", Icon: Landmark, variant: "default" as const},
    construction: { label: "Obras e Projetos", Icon: Construction, variant: "secondary" as const },
    incident: { label: "Incidente", Icon: Siren, variant: "destructive" as const},
    sanitation: { label: "Ponto de Saneamento", Icon: Trash, variant: "outline" as const},
};

const getLastReportedTime = (lastReported?: string) => {
    if (!lastReported) return null;
    const time = formatDistanceToNow(new Date(lastReported), { addSuffix: true, locale: pt });
    return <p className="text-xs text-muted-foreground mt-1">Último reporte: {time}</p>
}

const ATMStatus = ({poi, onPoiStatusChange}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange']}) => {
    if (poi.type !== 'atm') return null;

    const getStatusBadge = () => {
        if (poi.status === 'available') return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Com Dinheiro</Badge>
        if (poi.status === 'unavailable') return <Badge variant="destructive">Sem Dinheiro</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Estado do ATM</h3>
            <div className="flex items-center justify-between mb-4">
                {getStatusBadge()}
                {getLastReportedTime(poi.lastReported)}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'available')}>
                    <ThumbsUp className="mr-2"/> TEM DINHEIRO
                </Button>
                <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'unavailable')}>
                    <ThumbsDown className="mr-2"/> NÃO TEM DINHEIRO
                </Button>
            </div>
        </div>
    )
}

const SanitationStatus = ({poi, onPoiStatusChange}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange']}) => {
    if (poi.type !== 'sanitation') return null;

    const getStatusBadge = () => {
        if (poi.status === 'full') return <Badge className="bg-orange-500 hover:bg-orange-600">Cheio</Badge>
        if (poi.status === 'damaged') return <Badge variant="destructive">Danificado</Badge>
        if (poi.status === 'collected') return <Badge className="bg-green-500 hover:bg-green-600">Recolhido</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Estado do Contentor</h3>
            <div className="flex items-center justify-between mb-4">
                {getStatusBadge()}
                {getLastReportedTime(poi.lastReported)}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'collected')}>
                    <ShieldCheck className="mr-2"/> RECOLHIDO
                </Button>
                <Button variant="outline" className="bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-200" onClick={() => onPoiStatusChange(poi.id, 'full')}>
                    <ShieldAlert className="mr-2"/> CHEIO
                </Button>
                <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'damaged')}>
                    <ShieldX className="mr-2"/> DANIFICADO
                </Button>
            </div>
        </div>
    )
}

export default function PointOfInterestDetails({ poi, open, onOpenChange, onPoiStatusChange }: PointOfInterestDetailsProps) {
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
            {poi.type === 'atm' && <ATMStatus poi={poi} onPoiStatusChange={onPoiStatusChange} />}
            {poi.type === 'sanitation' && <SanitationStatus poi={poi} onPoiStatusChange={onPoiStatusChange} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
