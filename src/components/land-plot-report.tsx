

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
import { PointOfInterest, PointOfInterestStatus, PointOfInterestUsageType } from "@/lib/data";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Camera, Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import Image from "next/image";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/use-auth";


// Component to handle the drawing functionality on the map
const DrawingManager: React.FC<{onPolygonComplete: (polygon: google.maps.Polygon) => void, initialPolygonPath?: google.maps.LatLngLiteral[] | null}> = ({onPolygonComplete, initialPolygonPath}) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingMode: initialPolygonPath ? null : drawing.OverlayType.POLYGON,
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
            setCurrentPolygon(poly);
            manager.setDrawingMode(null); // Exit drawing mode
        });

        // If there's an initial polygon, draw it.
        if (initialPolygonPath && !currentPolygon) {
            const poly = new google.maps.Polygon({
                paths: initialPolygonPath,
                ...manager.get('polygonOptions'),
            });
            poly.setMap(map);
            setCurrentPolygon(poly);
            onPolygonComplete(poly); // Pass the initial polygon to the parent
        }
        
        return () => {
            listener.remove();
            manager.setMap(null);
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, drawing, onPolygonComplete, initialPolygonPath]);

    const handleClearPolygon = () => {
        if (currentPolygon) {
            currentPolygon.setMap(null);
            setCurrentPolygon(null);
            if (drawingManager) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }
        }
    }

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            {currentPolygon && (
                <Button onClick={handleClearPolygon} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar e Redesenhar
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
  usageType: z.enum(['residential', 'commercial', 'industrial', 'mixed', 'other']),
  maxHeight: z.coerce.number().optional(),
  buildingRatio: z.coerce.number().optional(),
  minLotArea: z.coerce.number().optional(),
  roadCession: z.coerce.number().optional(),
  greenSpaceCession: z.coerce.number().optional(),
});

type LandPlotReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLandPlotSubmit: (data: Partial<PointOfInterest> & { polygon: google.maps.LatLngLiteral[] } & { photoDataUri?: string }) => void;
  onLandPlotEdit: (id: string, data: Partial<PointOfInterest> & { polygon: google.maps.LatLngLiteral[] } & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
  poiToEdit: PointOfInterest | null;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function LandPlotReport({ 
    open, 
    onOpenChange, 
    onLandPlotSubmit,
    onLandPlotEdit,
    initialCenter,
    poiToEdit
}: LandPlotReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "available",
    },
  });
  
  const clearForm = () => {
    form.reset({
      status: "available",
      plotNumber: "",
      registrationCode: "",
      zoningInfo: "",
      usageType: undefined,
      maxHeight: undefined,
      buildingRatio: undefined,
      minLotArea: undefined,
      roadCession: undefined,
      greenSpaceCession: undefined,
    });
    if (drawnPolygon) {
        drawnPolygon.setMap(null);
    }
    setDrawnPolygon(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  useEffect(() => {
    if (open) {
        const isEditing = !!poiToEdit;
        setIsEditMode(isEditing);

        if (isEditing) {
            form.reset({
                status: poiToEdit.status,
                plotNumber: poiToEdit.plotNumber,
                registrationCode: poiToEdit.registrationCode,
                zoningInfo: poiToEdit.zoningInfo,
                usageType: poiToEdit.usageType,
                maxHeight: poiToEdit.maxHeight ?? undefined,
                buildingRatio: poiToEdit.buildingRatio ?? undefined,
                minLotArea: poiToEdit.minLotArea ?? undefined,
                roadCession: poiToEdit.roadCession ?? undefined,
                greenSpaceCession: poiToEdit.greenSpaceCession ?? undefined,
            });
            setMapCenter(poiToEdit.position);
            setMapZoom(16);

            const originalUpdate = poiToEdit.updates?.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
            if (originalUpdate?.photoDataUri) {
                setPhotoPreview(originalUpdate.photoDataUri);
            } else {
                setPhotoPreview(null);
            }
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
  }, [poiToEdit, open, form, initialCenter]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    const handleSubmission = (photoDataUri?: string) => {
        const submissionData = {
            ...values,
            status: values.status as PointOfInterestStatus,
            usageType: values.usageType as PointOfInterestUsageType,
            polygon: polygonPath,
            photoDataUri,
        };

        if (isEditMode && poiToEdit) {
            onLandPlotEdit(poiToEdit.id, submissionData);
        } else {
            onLandPlotSubmit(submissionData);
        }
    }

    if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            handleSubmission(reader.result as string);
        };
        reader.readAsDataURL(photoFile);
    } else {
        // For edit mode, if there was a photo and it wasn't changed, pass it along.
        handleSubmission(photoPreview && isEditMode ? photoPreview : undefined);
    }
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
          <SheetTitle>{isEditMode ? 'Editar Lote de Terreno' : 'Mapear Lote de Terreno'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Altere as informações cadastrais e, se necessário, redesenhe os limites do lote.' : 'Desenhe os limites do seu lote no mapa e preencha as informações que tiver.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    mapId="land-plot-report-map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                >
                     <DrawingManager 
                        onPolygonComplete={setDrawnPolygon} 
                        initialPolygonPath={isEditMode ? poiToEdit?.polygon : null}
                    />
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
                        <FormLabel>Nº do Lote ou Morada</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Lote 24-A, Rua das Flores" {...field} value={field.value ?? ''}/>
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
                        <FormLabel>Nº do Registo Predial</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 12345/IGCA/2024" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <Separator />
                <h4 className="text-sm font-semibold text-foreground">Informação de Zoneamento</h4>

                 <FormField
                    control={form.control}
                    name="usageType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Uso Permitido</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o uso" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="residential">Residencial</SelectItem>
                                <SelectItem value="commercial">Comercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="mixed">Misto</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="maxHeight"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Altura Máx. (Pisos)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 4" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="buildingRatio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Índice Construção (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 60" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />
                <h4 className="text-sm font-semibold text-foreground">Regras de Loteamento (Opcional)</h4>
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="minLotArea"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Área Mín. Lote (m²)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 300" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="roadCession"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cedência Vias (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 20" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="greenSpaceCession"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cedência Verdes (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 10" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <FormField
                    control={form.control}
                    name="zoningInfo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Outras Notas</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Descreva outras restrições ou observações relevantes..."
                                {...field}
                                value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />
                
                <div>
                    <Label htmlFor="land-plot-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Anexar Documento ou Foto (Opcional)
                        </div>
                    </Label>
                    <Input id="land-plot-photo" type="file" accept="image/*,.pdf" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização do documento" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">{isEditMode ? 'Guardar Alterações' : 'Mapear Lote'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
