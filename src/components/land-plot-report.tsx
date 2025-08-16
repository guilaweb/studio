
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
import { PointOfInterest, PointOfInterestStatus } from "@/lib/data";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";


// Component to handle the drawing functionality on the map
const DrawingManager: React.FC<{onPolygonComplete: (polygon: google.maps.Polygon) => void}> = ({onPolygonComplete}) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingMode: drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
                fillColor: "hsl(var(--primary) / 0.2)",
                strokeColor: "hsl(var(--primary))",
                strokeWeight: 2,
                editable: true,
            },
        });
        
        setDrawingManager(manager);
        manager.setMap(map);
        
        const listener = manager.addListener('polygoncomplete', (poly: google.maps.Polygon) => {
            onPolygonComplete(poly);
            setPolygon(poly);
            manager.setDrawingMode(null); // Exit drawing mode
        });
        
        return () => {
            listener.remove();
            manager.setMap(null);
        };

    }, [map, drawing, onPolygonComplete]);

    const handleClearPolygon = () => {
        if (polygon) {
            polygon.setMap(null);
            setPolygon(null);
            if (drawingManager) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }
        }
    }

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            {polygon && (
                <Button onClick={handleClearPolygon} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Seleção
                </Button>
            )}
        </div>
    );
};


const formSchema = z.object({
  plotNumber: z.string().optional(),
  registrationCode: z.string().optional(),
  zoningInfo: z.string().optional(),
  status: z.enum(['available', 'occupied', 'protected', 'in_dispute', 'reserved']),
});

type LandPlotReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLandPlotSubmit: (data: Pick<PointOfInterest, 'status' | 'plotNumber' | 'registrationCode' | 'zoningInfo' | 'polygon'>) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function LandPlotReport({ 
    open, 
    onOpenChange, 
    onLandPlotSubmit,
    initialCenter, 
}: LandPlotReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "available",
      plotNumber: "",
      registrationCode: "",
      zoningInfo: "",
    },
  });
  
  const clearForm = () => {
    form.reset({
      status: "available",
      plotNumber: "",
      registrationCode: "",
      zoningInfo: "",
    });
    if (drawnPolygon) {
        drawnPolygon.setMap(null);
    }
    setDrawnPolygon(null);
  }

  useEffect(() => {
    if (open) {
        const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
        const center = isDefaultLocation ? defaultCenter : initialCenter;
        const zoom = isDefaultLocation ? defaultZoom : 15;
        setMapCenter(center);
        setMapZoom(zoom);
        clearForm();
    }
  }, [open, initialCenter, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!drawnPolygon) {
        toast({
           variant: "destructive",
           title: "Área em falta",
           description: "Por favor, desenhe os limites do lote no mapa.",
       });
       return;
    }
    
    const polygonPath = drawnPolygon.getPath().getArray().map(p => p.toJSON());

    onLandPlotSubmit({ 
        ...values,
        status: values.status as PointOfInterestStatus,
        polygon: polygonPath,
    });
  }


  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen) clearForm();
        onOpenChange(isOpen);
    }}>
      <SheetContent 
        className="sm:max-w-lg w-full flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Mapear Lote de Terreno</SheetTitle>
          <SheetDescription>
            Desenhe os limites do lote no mapa e preencha as informações cadastrais.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                >
                     <DrawingManager onPolygonComplete={setDrawnPolygon} />
                </Map>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado do Lote</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado atual do lote" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="available">Disponível</SelectItem>
                                <SelectItem value="occupied">Ocupado</SelectItem>
                                <SelectItem value="reserved">Reservado</SelectItem>
                                <SelectItem value="in_dispute">Em Litígio</SelectItem>
                                <SelectItem value="protected">Protegido</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="plotNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nº do Lote (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Lote 24-A" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="registrationCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Código de Registo (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 12345/IGCA/2024" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                    control={form.control}
                    name="zoningInfo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Informação de Zoneamento (Opcional)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Descreva as restrições de uso, altura máxima, etc."
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Mapear Lote</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
