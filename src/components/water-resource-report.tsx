
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
import { PointOfInterest } from "@/lib/data";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Camera, MapPin, Plus, Trash2, GitMerge } from "lucide-react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const DrawingManager: React.FC<{
    onPolylineComplete: (polyline: google.maps.Polyline) => void,
    drawingMode: 'polyline' | null,
}> = ({ onPolylineComplete, drawingMode }) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingControl: false, // We use our own UI
            polylineOptions: {
                strokeColor: "hsl(var(--primary))",
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
            if(drawingMode === 'polyline') {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            } else {
                 drawingManager.setDrawingMode(null);
            }
        }
    }, [drawingManager, drawingMode]);
    
    return null;
};


const formSchema = z.object({
  title: z.string().min(1, "O tipo de recurso é obrigatório."),
  description: z.string().optional(),
  customData: z.array(z.object({
      key: z.string(),
      value: z.string(),
  })).optional(),
});

type WaterResourceReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWaterResourceSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'customData' | 'polyline'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function WaterResourceReport({ 
    open, 
    onOpenChange, 
    onWaterResourceSubmit,
    initialCenter, 
}: WaterResourceReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState([{key: '', value: ''}]);
  const [drawingMode, setDrawingMode] = useState<'polyline' | null>(null);
  const [drawnPolyline, setDrawnPolyline] = useState<google.maps.Polyline | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      customData: [],
    },
  });
  
  const clearForm = () => {
    form.reset();
    setCustomFields([{key: '', value: ''}]);
    setPhotoFile(null);
    setPhotoPreview(null);
    setDrawingMode(null);
    if(drawnPolyline) drawnPolyline.setMap(null);
    setDrawnPolyline(null);
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
  
  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };
  
  const addCustomField = () => {
    setCustomFields([...customFields, {key: '', value: ''}]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };


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
    const finalPosition = mapCenter;
    const customDataObject = customFields.reduce((acc, field) => {
        if (field.key && field.value) {
            acc[field.key] = field.value;
        }
        return acc;
    }, {} as Record<string, any>);
    
    const polylinePath = drawnPolyline?.getPath().getArray().map(p => p.toJSON());

    const handleSubmission = (photoDataUri?: string) => {
        onWaterResourceSubmit({ 
            title: values.title,
            description: values.description || '',
            position: finalPosition,
            customData: customDataObject,
            polyline: polylinePath,
            photoDataUri 
        });
    };

    if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            handleSubmission(reader.result as string);
        };
        reader.readAsDataURL(photoFile);
    } else {
        handleSubmission();
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
          <SheetTitle>Mapear Recurso Hídrico</SheetTitle>
          <SheetDescription>
            Ajuste o pino no mapa, desenhe o curso do rio (opcional) e adicione detalhes.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    mapId="water-resource-map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                >
                    <DrawingManager 
                        onPolylineComplete={setDrawnPolyline}
                        drawingMode={drawingMode}
                    />
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
                        <FormLabel>Tipo de Recurso</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Rio Principal">Rio Principal</SelectItem>
                                <SelectItem value="Afluente / Riacho">Afluente / Riacho</SelectItem>
                                <SelectItem value="Canal de Irrigação">Canal de Irrigação</SelectItem>
                                <SelectItem value="Canal de Drenagem">Canal de Drenagem</SelectItem>
                                <SelectItem value="Furo de Água">Furo de Água (Ponto)</SelectItem>
                                <SelectItem value="Poço">Poço (Ponto)</SelectItem>
                                <SelectItem value="Nascente">Nascente (Ponto)</SelectItem>
                                <SelectItem value="Represa Pequena">Represa Pequena (Ponto)</SelectItem>
                                <SelectItem value="Ponto de Captação (Rio)">Ponto de Captação (Ponto)</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div>
                    <Label>Desenhar Rio/Canal (Opcional)</Label>
                    <Button 
                        type="button" 
                        variant={drawingMode === 'polyline' ? 'secondary' : 'outline'} 
                        className="w-full mt-2" 
                        onClick={() => setDrawingMode(prev => prev ? null : 'polyline')}
                    >
                        <GitMerge className="mr-2 h-4 w-4" />
                        {drawnPolyline ? 'Redesenhar Curso do Rio' : 'Desenhar Curso do Rio'}
                    </Button>
                </div>
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição e Notas</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: Furo comunitário, gerido pela comissão de moradores."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <div>
                    <Label className="text-sm font-medium">Dados Técnicos (Opcional)</Label>
                    <div className="space-y-2 mt-2">
                        {customFields.map((field, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    placeholder="Ex: Profundidade" 
                                    value={field.key} 
                                    onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                />
                                <Input 
                                    placeholder="Ex: 80m" 
                                    value={field.value} 
                                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={addCustomField} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Campo
                    </Button>
                </div>
                 <div>
                    <Label htmlFor="resource-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Fotografia (Opcional)
                        </div>
                    </Label>
                    <Input id="resource-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Mapear Recurso</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
