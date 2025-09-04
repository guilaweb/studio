
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
import { MapPin, Share2, PlusCircle, X, Trash2, Locate } from "lucide-react";
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
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  title: z.string().min(5, "O nome do croqui é obrigatório."),
  description: z.string().optional(),
  collectionName: z.string().optional(),
  requesterName: z.string().min(3, "O nome do requerente é obrigatório."),
  province: z.string().min(3, "A província é obrigatória."),
  municipality: z.string().min(3, "O município é obrigatório."),
  technicianName: z.string().optional(),
  technicianId: z.string().optional(),
  surveyDate: z.string().optional(),
});

type DrawingMode = 'points' | 'route' | 'polygon' | null;

const DrawingManager: React.FC<{
    onPolylineComplete: (polyline: google.maps.Polyline) => void,
    onPolygonComplete: (polygon: google.maps.Polygon) => void,
    drawingMode: DrawingMode,
}> = ({ onPolylineComplete, onPolygonComplete, drawingMode }) => {
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

         const polygonListener = manager.addListener('polygoncomplete', (poly: google.maps.Polygon) => {
            onPolygonComplete(poly);
            manager.setDrawingMode(null);
        });
        
        return () => {
            polylineListener.remove();
            polygonListener.remove();
            manager.setMap(null);
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, drawing]);

    useEffect(() => {
        if (drawingManager) {
            if(drawingMode === 'route') {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            } else if (drawingMode === 'polygon') {
                 drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
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
  onCroquiSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'croquiPoints' | 'croquiRoute' | 'collectionName' | 'polygon' | 'customData'>, propertyIdToLink?: string) => void;
  initialCenter: google.maps.LatLngLiteral;
  mapRef?: React.RefObject<google.maps.Map>;
  poiToEdit: PointOfInterest | null;
  editMode: 'edit' | 'divide' | null;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function CroquiReport({ 
    open, 
    onOpenChange, 
    onCroquiSubmit,
    initialCenter,
    poiToEdit,
    editMode,
}: CroquiReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [referencePoints, setReferencePoints] = useState<CroquiPoint[]>([]);
  const [newReferenceLabel, setNewReferenceLabel] = useState("");
  const [newReferencePosition, setNewReferencePosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
  const [drawnRoute, setDrawnRoute] = useState<google.maps.Polyline | null>(null);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  const [propertyToLink, setPropertyToLink] = useState<PointOfInterest | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [coords, setCoords] = useState('');
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      collectionName: "",
      requesterName: "",
      province: "",
      municipality: "",
      technicianName: "",
      technicianId: "",
      surveyDate: "",
    },
  });
  
  const clearForm = () => {
    form.reset({
      title: "",
      description: "",
      collectionName: "",
      requesterName: "",
      province: "",
      municipality: "",
      technicianName: "",
      technicianId: "",
      surveyDate: "",
    });
    setReferencePoints([]);
    setDrawingMode(null);
    if (drawnRoute) drawnRoute.setMap(null);
    setDrawnRoute(null);
    if (drawnPolygon) drawnPolygon.setMap(null);
    setDrawnPolygon(null);
    setPropertyToLink(null);
    sessionStorage.removeItem('poiForCroqui');
    setIsEdit(false);
    setCoords('');
  }

  useEffect(() => {
    if (open) {
        setIsEdit(!!poiToEdit);
        if (poiToEdit) {
             form.reset({
                title: editMode === 'divide' ? `${poiToEdit.title} (Cópia)` : poiToEdit.title,
                description: poiToEdit.description,
                collectionName: poiToEdit.collectionName || '',
                requesterName: poiToEdit.customData?.requesterName || '',
                province: poiToEdit.customData?.province || '',
                municipality: poiToEdit.customData?.municipality || '',
                technicianName: poiToEdit.customData?.technicianName || '',
                technicianId: poiToEdit.customData?.technicianId || '',
                surveyDate: poiToEdit.customData?.surveyDate || '',
            });
            setMapCenter(poiToEdit.position);
            setMapZoom(16);
            setReferencePoints(poiToEdit.croquiPoints || []);
            // Note: Re-drawing the route/polygon is complex; for now, we don't pre-populate it on edit.
            // A more advanced implementation would handle this.
            if(drawnRoute) drawnRoute.setMap(null);
            setDrawnRoute(null);
            if(drawnPolygon) drawnPolygon.setMap(null);
            setDrawnPolygon(null);

        } else {
            const poiForCroquiJSON = sessionStorage.getItem('poiForCroqui');
            if (poiForCroquiJSON) {
                const poi: PointOfInterest = JSON.parse(poiForCroquiJSON);
                setPropertyToLink(poi);
                setMapCenter(poi.position);
                setMapZoom(16);
                form.reset({ title: `Acesso a: ${poi.title}`, description: `Croqui para o imóvel ${poi.title}`, collectionName: "Meus Imóveis" });
            } else {
                const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
                const center = isDefaultLocation ? defaultCenter : initialCenter;
                const zoom = isDefaultLocation ? defaultZoom : 15;
                setMapCenter(center);
                setMapZoom(zoom);
                clearForm();
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCenter, poiToEdit, editMode]);
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
      if(drawingMode === 'points' && event.latLng) {
          setNewReferencePosition(event.latLng.toJSON());
          setIsAlertOpen(true);
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
        setIsAlertOpen(false);
    }
  }
  
  const handleCancelAddReference = () => {
    setNewReferencePosition(null);
    setNewReferenceLabel("");
    setDrawingMode(null);
    setIsAlertOpen(false);
  }
  
  const removeReferencePoint = (index: number) => {
    setReferencePoints(prev => prev.filter((_, i) => i !== index));
  }

  const handleClearRoute = () => {
    if (drawnRoute) {
        drawnRoute.setMap(null);
        setDrawnRoute(null);
    }
    setDrawingMode('route');
  }
  
  const handleClearPolygon = () => {
    if (drawnPolygon) {
        drawnPolygon.setMap(null);
        setDrawnPolygon(null);
    }
    setDrawingMode('polygon');
  }
  
  const handleLocateFromCoords = () => {
    const trimmedCoords = coords.trim();

    // Check for Decimal Degrees format (e.g., -14.1309, 14.6753)
    if (trimmedCoords.includes(',')) {
        const parts = trimmedCoords.split(',').map(p => p.trim());
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
                setMapZoom(18);
                toast({ title: 'Localização Encontrada', description: 'O mapa foi centrado nas coordenadas decimais.' });
                return;
            }
        }
    }

    // Check for DMS format (e.g., 14°07'51.4"S 14°40'31.4"E)
    const dmsToDd = (d: number, m: number, s: number, direction: string) => {
        let dd = d + m/60 + s/3600;
        if (direction === 'S' || direction === 'W') {
            dd = dd * -1;
        }
        return dd;
    };
    
    const dmsParts = trimmedCoords.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/g);
    if (dmsParts?.length === 2) {
        try {
            const [latStr, lonStr] = dmsParts;
            const latParts = latStr.match(/(\d+)°(\d+)'([\d.]+)"([NS])/);
            const lonParts = lonStr.match(/(\d+)°(\d+)'([\d.]+)"([EW])/);
            if (!latParts || !lonParts) throw new Error("Formato DMS inválido.");

            const lat = dmsToDd(parseFloat(latParts[1]), parseFloat(latParts[2]), parseFloat(latParts[3]), latParts[4]);
            const lng = dmsToDd(parseFloat(lonParts[1]), parseFloat(lonParts[2]), parseFloat(lonParts[3]), lonParts[4]);
            
            setMapCenter({ lat, lng });
            setMapZoom(18);
            toast({ title: 'Localização Encontrada', description: 'O mapa foi centrado nas coordenadas DMS.' });
            return;
        } catch (e) {
            // Fall through to error toast
        }
    }

    toast({ variant: 'destructive', title: 'Formato de Coordenadas Inválido', description: 'Use o formato "-14.13, 14.67" ou \'14°07..."S 14°40..."E\'' });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalPosition = mapCenter;
    const routePath = drawnRoute?.getPath().getArray().map(p => p.toJSON());
    const polygonPath = drawnPolygon?.getPath().getArray().map(p => p.toJSON());
    
    const customData = {
        requesterName: values.requesterName,
        province: values.province,
        municipality: values.municipality,
        technicianName: values.technicianName,
        technicianId: values.technicianId,
        surveyDate: values.surveyDate,
    };

    onCroquiSubmit({ 
        title: values.title,
        description: values.description,
        collectionName: values.collectionName,
        customData,
        position: finalPosition, 
        croquiPoints: referencePoints, 
        croquiRoute: routePath,
        polygon: polygonPath,
    }, propertyToLink?.id);
  }

  const sheetTitle = isEdit ? (editMode === 'divide' ? 'Dividir Croqui (Criar Cópia)' : 'Editar Croqui') : 'Criar Croqui de Localização';
  const submitButtonText = isEdit ? (editMode === 'divide' ? 'Criar Cópia Editada' : 'Guardar Alterações') : 'Criar e Partilhar';

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
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription>
            {propertyToLink ? `A criar um croqui para "${propertyToLink.title}". ` : ''}
            Arraste o mapa para posicionar o pino principal, adicione pontos de referência e desenhe a rota ou a área.
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 py-2">
             <Label htmlFor="coords">Localizar por Coordenadas</Label>
            <div className="flex gap-2 mt-1">
                <Input id="coords" placeholder='-14.12, 14.67 ou 14°07..."S...' value={coords} onChange={e => setCoords(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleLocateFromCoords}><Locate className="h-4 w-4"/></Button>
            </div>
        </div>
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
                        onPolygonComplete={setDrawnPolygon}
                        drawingMode={drawingMode}
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
                    name="requesterName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome do Requerente</FormLabel>
                        <FormControl>
                            <Input placeholder="Insira o nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="province" render={({ field }) => (
                        <FormItem><FormLabel>Província</FormLabel><FormControl><Input placeholder="Ex: Luanda" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="municipality" render={({ field }) => (
                        <FormItem><FormLabel>Município</FormLabel><FormControl><Input placeholder="Ex: Viana" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
                 <FormField
                    control={form.control}
                    name="collectionName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Coleção (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Meus Clientes, Rede de Postes" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <Separator />
                 <h4 className="text-sm font-medium text-foreground">Detalhes Técnicos (Opcional)</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="technicianName" render={({ field }) => (
                        <FormItem><FormLabel>Técnico Responsável</FormLabel><FormControl><Input placeholder="Nome do técnico" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="technicianId" render={({ field }) => (
                        <FormItem><FormLabel>Nº da Ordem</FormLabel><FormControl><Input placeholder="001234" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
                 <FormField control={form.control} name="surveyDate" render={({ field }) => (
                        <FormItem><FormLabel>Data do Levantamento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                 )} />

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
                    <Label>Ferramentas de Desenho</Label>
                    <div className="flex flex-wrap gap-2">
                         <Button type="button" variant={drawingMode === 'points' ? 'secondary' : 'outline'} size="sm" onClick={() => setDrawingMode(prev => prev === 'points' ? null : 'points')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Referência
                        </Button>
                        <Button type="button" variant={drawingMode === 'route' ? 'secondary' : 'outline'} size="sm" onClick={handleClearRoute}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {drawnRoute ? 'Redesenhar Rota' : 'Desenhar Rota'}
                        </Button>
                         <Button type="button" variant={drawingMode === 'polygon' ? 'secondary' : 'outline'} size="sm" onClick={handleClearPolygon}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {drawnPolygon ? 'Redesenhar Área' : 'Desenhar Área'}
                        </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                        {drawingMode === 'points' && 'Clique no mapa para adicionar um ponto de referência personalizado.'}
                        {drawingMode === 'route' && 'Clique no mapa para começar a desenhar a rota. Clique duas vezes para terminar.'}
                        {drawingMode === 'polygon' && 'Clique no mapa para começar a desenhar a área. Clique no primeiro ponto para fechar.'}
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
                    {submitButtonText}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
    
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
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
          <AlertDialogCancel onClick={handleCancelAddReference}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddReference} disabled={!newReferenceLabel}>Adicionar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
