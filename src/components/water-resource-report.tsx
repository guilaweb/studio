
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
import { Camera, MapPin, Plus, Trash2, GitMerge, AppWindow } from "lucide-react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const DrawingManager: React.FC<{
    onPolylineComplete: (polyline: google.maps.Polyline) => void,
    onPolygonComplete: (polygon: google.maps.Polygon) => void,
    drawingMode: 'polyline' | 'polygon' | null,
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
            if(drawingMode === 'polyline') {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            } else if(drawingMode === 'polygon') {
                 drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
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
  onWaterResourceSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'customData' | 'polyline' | 'polygon'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

const aquiferDefaultFields = [
    { key: 'Profundidade Média (m)', value: '' },
    { key: 'Vulnerabilidade', value: '' },
    { key: 'Potencial de Exploração', value: '' },
];

const damDefaultFields = [
    { key: 'Altura do Paredão (m)', value: '' },
    { key: 'Comprimento da Crista (m)', value: '' },
    { key: 'Tipo de Barragem', value: '' },
];

const reservoirDefaultFields = [
    { key: 'Capacidade Máxima (m³)', value: '' },
    { key: 'Área Inundada (km²)', value: '' },
    { key: 'Uso Principal', value: '' },
];

const treatmentStationDefaultFields = [
    { key: 'Capacidade de Tratamento (m³/dia)', value: '' },
    { key: 'Tipo de Tratamento', value: '' },
    { key: 'População Servida', value: '' },
];

const concessionDefaultFields = [
    { key: 'Titular da Licença', value: '' },
    { key: 'Finalidade de Uso', value: '' },
    { key: 'Caudal Licenciado (m³/h)', value: '' },
    { key: 'Data de Validade', value: '' },
];

const monitoringPointDefaultFields = [
    { key: 'ID da Estação', value: '' },
    { key: 'Parâmetros Monitorados', value: '' },
    { key: 'Frequência de Coleta', value: '' },
    { key: 'Entidade Responsável', value: '' },
];

const pollutionSourceDefaultFields = [
    { key: 'Tipo de Fonte', value: '' },
    { key: 'Nível de Risco', value: '' },
    { key: 'Poluentes Principais', value: '' },
    { key: 'Estado da Licença Ambiental', value: '' },
];

const watershedDefaultFields = [
    { key: 'Disponibilidade Anual (hm³)', value: '' },
    { key: 'Procura Total (hm³)', value: '' },
];


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
  const [drawingMode, setDrawingMode] = useState<'polyline' | 'polygon' | null>(null);
  const [drawnPolyline, setDrawnPolyline] = useState<google.maps.Polyline | null>(null);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  
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
    if(drawnPolygon) drawnPolygon.setMap(null);
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
  
  const handleResourceTypeChange = (value: string) => {
    form.setValue('title', value);
    if (value === 'Aquífero') {
        setCustomFields(aquiferDefaultFields);
    } else if (value === 'Barragem') {
        setCustomFields(damDefaultFields);
    } else if (value === 'Albufeira') {
        setCustomFields(reservoirDefaultFields);
    } else if (value.startsWith('Estação de Tratamento')) {
        setCustomFields(treatmentStationDefaultFields);
    } else if (value === 'Concessão / Licença de Uso') {
        setCustomFields(concessionDefaultFields);
    } else if (value === 'Ponto de Monitoramento de Qualidade') {
        setCustomFields(monitoringPointDefaultFields);
    } else if (value === 'Fonte de Poluição Potencial') {
        setCustomFields(pollutionSourceDefaultFields);
    } else if (value === 'Bacia Hidrográfica') {
        setCustomFields(watershedDefaultFields);
    } else if (customFields.length === 1 && customFields[0].key === '' && customFields[0].value === '') {
        // do nothing if it's the default empty field
    } else if ([
        JSON.stringify(aquiferDefaultFields), 
        JSON.stringify(damDefaultFields), 
        JSON.stringify(reservoirDefaultFields), 
        JSON.stringify(treatmentStationDefaultFields),
        JSON.stringify(concessionDefaultFields),
        JSON.stringify(monitoringPointDefaultFields),
        JSON.stringify(pollutionSourceDefaultFields),
        JSON.stringify(watershedDefaultFields)
        ].includes(JSON.stringify(customFields))) {
        setCustomFields([{key: '', value: ''}]);
    }
  }


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
    const polygonPath = drawnPolygon?.getPath().getArray().map(p => p.toJSON());

    const handleSubmission = (photoDataUri?: string) => {
        onWaterResourceSubmit({ 
            title: values.title,
            description: values.description || '',
            position: finalPosition,
            customData: customDataObject,
            polyline: polylinePath,
            polygon: polygonPath,
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
            Ajuste o pino no mapa, desenhe o curso do rio ou a área do lago (opcional) e adicione detalhes.
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
                        onPolygonComplete={setDrawnPolygon}
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
                        <Select onValueChange={(value) => { field.onChange(value); handleResourceTypeChange(value); }} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Fonte de Poluição Potencial">Fonte de Poluição Potencial</SelectItem>
                                <SelectItem value="Ponto de Monitoramento de Qualidade">Ponto de Monitoramento de Qualidade</SelectItem>
                                <SelectItem value="Concessão / Licença de Uso">Concessão / Licença de Uso</SelectItem>
                                <SelectItem value="Barragem">Barragem</SelectItem>
                                <SelectItem value="Albufeira">Albufeira (Corpo de Água)</SelectItem>
                                <SelectItem value="Estação de Tratamento de Água (ETA)">Estação de Tratamento de Água (ETA)</SelectItem>
                                <SelectItem value="Estação de Tratamento de Águas Residuais (ETAR)">Estação de Tratamento de Águas Residuais (ETAR)</SelectItem>
                                <SelectItem value="Aquífero">Aquífero</SelectItem>
                                <SelectItem value="Bacia Hidrográfica">Bacia Hidrográfica</SelectItem>
                                <SelectItem value="Sub-bacia Hidrográfica">Sub-bacia Hidrográfica</SelectItem>
                                <SelectItem value="Rio Principal">Rio Principal</SelectItem>
                                <SelectItem value="Afluente / Riacho">Afluente / Riacho</SelectItem>
                                <SelectItem value="Lago / Lagoa">Lago / Lagoa</SelectItem>
                                <SelectItem value="Chana / Pântano">Chana / Pântano</SelectItem>
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
                    <Label>Ferramentas de Desenho (Opcional)</Label>
                    <div className="flex gap-2 mt-2">
                        <Button 
                            type="button" 
                            variant={drawingMode === 'polyline' ? 'secondary' : 'outline'} 
                            className="flex-1" 
                            onClick={() => {
                                if(drawnPolygon) drawnPolygon.setMap(null);
                                setDrawnPolygon(null);
                                setDrawingMode(prev => prev === 'polyline' ? null : 'polyline');
                            }}
                        >
                            <GitMerge className="mr-2 h-4 w-4" />
                            {drawnPolyline ? 'Redesenhar Linha' : 'Desenhar Linha'}
                        </Button>
                        <Button 
                            type="button" 
                            variant={drawingMode === 'polygon' ? 'secondary' : 'outline'} 
                            className="flex-1" 
                            onClick={() => {
                                if(drawnPolyline) drawnPolyline.setMap(null);
                                setDrawnPolyline(null);
                                setDrawingMode(prev => prev === 'polygon' ? null : 'polygon');
                            }}
                        >
                            <AppWindow className="mr-2 h-4 w-4" />
                            {drawnPolygon ? 'Redesenhar Área' : 'Desenhar Área'}
                        </Button>
                    </div>
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
