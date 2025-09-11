
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
import { useEffect, useState } from "react";
import { PointOfInterest, PointOfInterestStatus } from "@/lib/data";
import { Map } from "@vis.gl/react-google-maps";
import { MapPin, Locate, CalendarIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

const formSchema = z.object({
  title: z.string().min(3, "O nome ou código é obrigatório."),
  greenAreaType: z.enum(['park', 'square', 'tree', 'other']),
  pestStatus: z.enum(['healthy', 'infested', 'under_treatment']),
  lastPruning: z.date().optional(),
  lastIrrigation: z.date().optional(),
});

type GreenAreaReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGreenAreaSubmit: (idOrData: any, data?: any) => void;
  poiToEdit: PointOfInterest | null;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function GreenAreaReport({ 
    open, 
    onOpenChange, 
    onGreenAreaSubmit,
    initialCenter,
    poiToEdit
}: GreenAreaReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [coords, setCoords] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: "",
        pestStatus: "healthy",
    }
  });
  
  const clearForm = () => {
    form.reset({
      title: "",
      greenAreaType: undefined,
      pestStatus: "healthy",
      lastPruning: undefined,
      lastIrrigation: undefined,
    });
    setCoords('');
  }

  useEffect(() => {
    if (open) {
        const isEditing = !!poiToEdit && poiToEdit.type === 'green_area';
        setIsEditMode(isEditing);

        if (isEditing) {
            form.reset({
                title: poiToEdit.title,
                greenAreaType: poiToEdit.greenAreaType,
                pestStatus: poiToEdit.pestStatus,
                lastPruning: poiToEdit.lastPruning ? new Date(poiToEdit.lastPruning) : undefined,
                lastIrrigation: poiToEdit.lastIrrigation ? new Date(poiToEdit.lastIrrigation) : undefined,
            });
            setMapCenter(poiToEdit.position);
            setMapZoom(18);
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
  }, [open, initialCenter, form, poiToEdit]);
  
  const handleLocateFromCoords = () => {
    const trimmedCoords = coords.trim();

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
    toast({ variant: 'destructive', title: 'Formato de Coordenadas Inválido', description: 'Use o formato "-14.13, 14.67".' });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalPosition = mapCenter;
    const submissionData = { 
        ...values,
        type: 'green_area',
        status: 'active' as PointOfInterestStatus,
        lastPruning: values.lastPruning?.toISOString(),
        lastIrrigation: values.lastIrrigation?.toISOString(),
        position: finalPosition 
    };

    if (isEditMode && poiToEdit) {
        onGreenAreaSubmit(poiToEdit.id, submissionData);
        toast({ title: "Área Verde Atualizada!", description: `Os dados de "${values.title}" foram guardados.` });
    } else {
        onGreenAreaSubmit(submissionData);
        toast({ title: "Área Verde Registada!", description: `O ativo "${values.title}" foi adicionado ao mapa.` });
    }
    onOpenChange(false);
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
          <SheetTitle>{isEditMode ? 'Editar Área Verde' : 'Mapear Área Verde'}</SheetTitle>
          <SheetDescription>
             Ajuste o pino no mapa para a localização exata e preencha os dados do ativo verde.
          </SheetDescription>
        </SheetHeader>
         <div className="px-6 py-2">
            <Label htmlFor="coords">Localizar por Coordenadas</Label>
            <div className="flex gap-2 mt-1">
                <Input id="coords" placeholder='-14.12, 14.67' value={coords} onChange={e => setCoords(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleLocateFromCoords}><Locate className="h-4 w-4"/></Button>
            </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    mapId="green-area-report-map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                >
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
                        <FormLabel>Nome / ID do Ativo</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Parque da Independência, Árvore-012" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />

                <Separator />
                <h4 className="text-sm font-semibold">Detalhes do Ativo</h4>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="greenAreaType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tipo de Área</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="park">Parque</SelectItem>
                                    <SelectItem value="square">Praça</SelectItem>
                                    <SelectItem value="tree">Árvore Individual</SelectItem>
                                    <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pestStatus"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Estado Fitossanitário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="healthy">Saudável</SelectItem>
                                    <SelectItem value="infested">Infestado com Praga</SelectItem>
                                    <SelectItem value="under_treatment">Sob Tratamento</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="lastPruning"
                        render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Última Poda</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild><FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Selecione a data</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastIrrigation"
                        render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Última Rega</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild><FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Selecione a data</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">{isEditMode ? 'Guardar Alterações' : 'Registar Ativo'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
    