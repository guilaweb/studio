

"use client";

import * as React from "react";
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
import { PointOfInterest, PointOfInterestUpdate, announcementCategoryMap, AnnouncementCategoryEnum } from "@/lib/data";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Trash2, Calendar as CalendarIcon, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

// Component to handle the drawing functionality on the map
const DrawingManager: React.FC<{onPolygonComplete: (polygon: google.maps.Polygon) => void, initialPolygonPath?: google.maps.LatLngLiteral[] | null, clearTrigger: boolean }> = ({onPolygonComplete, initialPolygonPath, clearTrigger}) => {
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
                editable: true,
            });
            poly.setMap(map);
            setCurrentPolygon(poly);
            onPolygonComplete(poly);
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

     React.useEffect(() => {
        if(clearTrigger && !initialPolygonPath) {
            handleClearPolygon();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearTrigger, initialPolygonPath])


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
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  category: AnnouncementCategoryEnum,
  dates: z.object({
      from: z.date({required_error: "A data de início é obrigatória."}),
      to: z.date({required_error: "A data de fim é obrigatória."}),
  }, { required_error: "As datas de início e fim são obrigatórias."}),
});

type AnnouncementReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnnouncementSubmit: (data: any) => void;
  onAnnouncementEdit: (id: string, data: any) => void;
  initialCenter: google.maps.LatLngLiteral;
  poiToEdit: PointOfInterest | null;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function AnnouncementReport({ 
    open, 
    onOpenChange, 
    onAnnouncementSubmit,
    onAnnouncementEdit,
    initialCenter,
    poiToEdit
}: AnnouncementReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clearPolygonTrigger, setClearPolygonTrigger] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      category: undefined,
      dates: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
    },
  });
  
  const clearForm = React.useCallback(() => {
    form.reset({
      message: "",
      category: undefined,
      dates: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
    });
    setDrawnPolygon(null);
    setClearPolygonTrigger(val => !val);
  }, [form]);

  useEffect(() => {
    if (open) {
        const isEditing = !!poiToEdit && poiToEdit.type === 'announcement';
        setIsEditMode(isEditing);

        if (isEditing && poiToEdit.startDate && poiToEdit.endDate) {
            form.reset({
                message: poiToEdit.description,
                category: poiToEdit.announcementCategory,
                dates: {
                    from: new Date(poiToEdit.startDate),
                    to: new Date(poiToEdit.endDate),
                },
            });
            setMapCenter(poiToEdit.position);
            setMapZoom(16);
        } else {
            const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
            const center = isDefaultLocation ? defaultCenter : initialCenter;
            const zoom = isDefaultLocation ? defaultZoom : 15;
            setMapCenter(center);
            setMapZoom(zoom);
            clearForm();
        }
    }
  }, [poiToEdit, open, form, initialCenter, clearForm]);
  

  function onSubmit(values: z.infer<typeof formSchema>) {
     if (!drawnPolygon) {
         toast({
            variant: "destructive",
            title: "Área em falta",
            description: "Por favor, desenhe uma área no mapa para enviar a comunicação.",
        });
        return;
    }
    
    if (!user || !profile) {
        toast({ variant: "destructive", title: "Erro", description: "Precisa de estar autenticado para enviar um anúncio."});
        return;
    }
    
    const polygonPath = drawnPolygon.getPath().getArray().map(p => p.toJSON());
    const centerLat = polygonPath.reduce((sum, p) => sum + p.lat, 0) / polygonPath.length;
    const centerLng = polygonPath.reduce((sum, p) => sum + p.lng, 0) / polygonPath.length;

    const title = announcementCategoryMap[values.category];

    if (isEditMode && poiToEdit) {
         const editedData = {
            title: title,
            description: values.message,
            announcementCategory: values.category,
            startDate: values.dates.from.toISOString(),
            endDate: values.dates.to.toISOString(),
            polygon: polygonPath,
        };
        onAnnouncementEdit(poiToEdit.id, editedData);

    } else {
        const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
            id: `announcement-${Date.now()}`,
            type: 'announcement',
            title: title,
            description: values.message,
            announcementCategory: values.category,
            startDate: values.dates.from.toISOString(),
            endDate: values.dates.to.toISOString(),
            polygon: polygonPath,
            position: { lat: centerLat, lng: centerLng },
            authorId: user.uid,
            authorDisplayName: profile.displayName,
            lastReported: new Date().toISOString(),
            status: 'active',
            updates: [{
                text: values.message,
                authorId: user.uid,
                authorDisplayName: profile.displayName,
                timestamp: new Date().toISOString(),
            }]
        };
        onAnnouncementSubmit(pointToAdd);
    }
  }


  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen) clearForm();
        onOpenChange(isOpen);
    }}>
      <SheetContent 
        className="w-full flex flex-col p-0 sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{isEditMode ? 'Editar Anúncio' : 'Criar Anúncio'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Altere as informações e a área do anúncio.' : 'Escreva a sua mensagem e desenhe a área no mapa para notificar os cidadãos.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[40vh] bg-muted">
                <Map
                    mapId="announcement-map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                >
                     <DrawingManager 
                        onPolygonComplete={setDrawnPolygon} 
                        initialPolygonPath={isEditMode ? poiToEdit?.polygon : null}
                        clearTrigger={clearPolygonTrigger}
                    />
                </Map>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(announcementCategoryMap).map(([key, label]) => (
                                             <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="dates"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Período de Validade</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value?.from && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                <>
                                                    {format(field.value.from, "LLL dd, y", { locale: pt })} -{" "}
                                                    {format(field.value.to, "LLL dd, y", { locale: pt })}
                                                </>
                                                ) : (
                                                    format(field.value.from, "LLL dd, y", { locale: pt })
                                                )
                                            ) : (
                                                <span>Selecione as datas</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={field.value?.from}
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        numberOfMonths={1}
                                        locale={pt}
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mensagem</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Descreva o anúncio em detalhe..."
                                        rows={5}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Guardar Alterações' : 'Enviar Anúncio'}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
