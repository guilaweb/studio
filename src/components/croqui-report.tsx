

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { CroquiPoint, PointOfInterest } from "@/lib/data";
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, Share2, PlusCircle, X, Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "./ui/label";


const formSchema = z.object({
  title: z.string().min(5, "O nome do croqui é obrigatório."),
  description: z.string().optional(),
});

type DrawingMode = 'points' | 'route' | null;

const DrawingManager: React.FC<{
    onPolygonComplete: (polygon: google.maps.Polygon) => void,
    onPolylineComplete: (polyline: google.maps.Polyline) => void,
    drawingMode: DrawingMode,
    clearTrigger: boolean,
}> = ({ onPolygonComplete, onPolylineComplete, drawingMode, clearTrigger }) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingControl: false, // We use our own UI
            polygonOptions: {
                fillColor: "hsl(var(--primary) / 0.2)",
                strokeColor: "hsl(var(--primary))",
                strokeWeight: 2,
                editable: true,
            },
            polylineOptions: {
                strokeColor: "hsl(var(--accent))",
                strokeWeight: 4,
                editable: true,
            }
        });
        
        setDrawingManager(manager);
        manager.setMap(map);

        const polylineListener = manager.addListener('polylinecomplete', (poly: google.maps.Polyline) => {
            onPolylineComplete(poly);
            manager.setDrawingMode(null);
        });
        
        return () => {
            polylineListener.remove();
            manager.setMap(null);
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, drawing]);

    useEffect(() => {
        if (drawingManager) {
            if(drawingMode === 'route') {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            } else {
                 drawingManager.setDrawingMode(null);
            }
        }
    }, [drawingManager, drawingMode]);
    
    return null;
};


type CroquiReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCroquiSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'croquiPoints' | 'croquiRoute'>, propertyIdToLink?: string) => void;
  initialCenter: google.maps.LatLngLiteral;
  mapRef?: React.RefObject<google.maps.Map>;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function CroquiReport({ 
    open, 
    onOpenChange, 
    onCroquiSubmit,
    initialCenter, 
}: CroquiReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [referencePoints, setReferencePoints] = useState<CroquiPoint[]>([]);
  const [newReferenceLabel, setNewReferenceLabel] = useState("");
  const [newReferencePosition, setNewReferencePosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
  const [drawnRoute, setDrawnRoute] = useState<google.maps.Polyline | null>(null);
  const [propertyToLink, setPropertyToLink] = useState<PointOfInterest | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  const clearForm = () => {
    form.reset({
      title: "",
      description: "",
    });
    setReferencePoints([]);
    setDrawingMode(null);
    if (drawnRoute) drawnRoute.setMap(null);
    setDrawnRoute(null);
    setPropertyToLink(null);
    sessionStorage.removeItem('poiForCroqui');
  }

  useEffect(() => {
    if (open) {
        const poiForCroquiJSON = sessionStorage.getItem('poiForCroqui');
        if (poiForCroquiJSON) {
            const poi: PointOfInterest = JSON.parse(poiForCroquiJSON);
            setPropertyToLink(poi);
            setMapCenter(poi.position);
            setMapZoom(16);
            form.reset({ title: `Acesso a: ${poi.title}`, description: `Croqui para o imóvel ${poi.title}` });
        } else {
            const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
            const center = isDefaultLocation ? defaultCenter : initialCenter;
            const zoom = isDefaultLocation ? defaultZoom : 15;
            setMapCenter(center);
            setMapZoom(zoom);
            clearForm();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCenter]);
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
      if(drawingMode === 'points' && event.latLng) {
          setNewReferencePosition(event.latLng.toJSON());
      }
  }

  const handleAddReference = () => {
    if (newReferencePosition && newReferenceLabel) {
        setReferencePoints(prev => [...prev, {
            position: newReferencePosition,
            label: newReferenceLabel,
            type: 'custom'
        }]);
        setNewReferenceLabel("");
        setNewReferencePosition(null);
        setDrawingMode(null);
    }
  }
  
  const removeReferencePoint = (index: number) => {
    setReferencePoints(prev => prev.filter((_, i) => i !== index));
  }

  const handleClearRoute = () => {
    if (drawnRoute) {
        drawnRoute.setMap(null);
        setDrawnRoute(null);
        setDrawingMode('route');
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalPosition = mapCenter;
    const routePath = drawnRoute?.getPath().getArray().map(p => p.toJSON()) || [];
    onCroquiSubmit({ ...values, position: finalPosition, croquiPoints: referencePoints, croquiRoute: routePath }, propertyToLink?.id);
  }

  return (
    <>
    <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen) clearForm();
        onOpenChange(isOpen);
    }}>
      <SheetContent 
        className="sm:max-w-lg w-full flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Criar Croqui de Localização</SheetTitle>
          <SheetDescription>
            {propertyToLink ? `A criar um croqui para "${propertyToLink.title}". ` : ''}
            Arraste o mapa para posicionar o pino principal, adicione pontos de referência e desenhe a rota.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[40vh] bg-muted">
                <Map
                    mapId="croqui-report-map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                    onClick={handleMapClick}
                >
                    <DrawingManager 
                        onPolylineComplete={setDrawnRoute}
                        onPolygonComplete={() => {}} // dummy
                        drawingMode={drawingMode}
                        clearTrigger={false}
                    />
                    {referencePoints.map((point, index) => (
                         <AdvancedMarker key={index} position={point.position} title={point.label}>
                            <Pin background={'#FB923C'} borderColor={'#F97316'} glyphColor={'#ffffff'} />
                         </AdvancedMarker>
                    ))}
                    {propertyToLink && (
                        <AdvancedMarker position={propertyToLink.position} title={propertyToLink.title}>
                           <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'} />
                        </AdvancedMarker>
                    )}
                </Map>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin className="text-primary h-10 w-10" />
                 </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome do Croqui</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Casa da Família Santos, Festa do Kito" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notas Adicionais (Opcional)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: Tocar a campainha 3 vezes. Procurar pelo portão verde."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div className="space-y-2">
                    <Label>Pontos de Referência</Label>
                    <div className="flex flex-wrap gap-2">
                         <Button type="button" variant={drawingMode === 'points' ? 'secondary' : 'outline'} size="sm" onClick={() => setDrawingMode(prev => prev === 'points' ? null : 'points')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Referência
                        </Button>
                        <Button type="button" variant={drawingMode === 'route' ? 'secondary' : 'outline'} size="sm" onClick={() => setDrawingMode('route')} disabled={!!drawnRoute}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Desenhar Rota
                        </Button>
                        {drawnRoute && (
                            <Button type="button" variant="destructive" size="sm" onClick={handleClearRoute}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Limpar Rota
                            </Button>
                        )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                        {drawingMode === 'points' && 'Clique no mapa para adicionar um ponto de referência personalizado.'}
                        {drawingMode === 'route' && 'Clique no mapa para começar a desenhar a rota. Clique duas vezes para terminar.'}
                    </p>

                    {referencePoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                            <span>{point.label}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeReferencePoint(index)}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>

            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">
                    <Share2 className="mr-2 h-4 w-4" />
                    Criar e Partilhar
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
    
    <AlertDialog open={drawingMode === 'points' && !!newReferencePosition} onOpenChange={(open) => !open && setDrawingMode(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar Ponto de Referência</AlertDialogTitle>
          <AlertDialogDescription>
            Dê um nome a este ponto de referência para ajudar os outros a localizá-lo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
            <Label htmlFor="reference-label">Nome da Referência</Label>
            <Input 
                id="reference-label"
                value={newReferenceLabel}
                onChange={(e) => setNewReferenceLabel(e.target.value)}
                placeholder="Ex: Mangueira grande, Paragem de táxi"
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setNewReferencePosition(null); setNewReferenceLabel(""); setDrawingMode(null); }}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddReference} disabled={!newReferenceLabel}>Adicionar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
