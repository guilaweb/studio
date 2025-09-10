

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
import { Camera, MapPin, Locate } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  title: z.string().min(1, "O código do poste é obrigatório."),
  lampType: z.enum(['led', 'sodio', 'mercurio', 'outra']),
  poleType: z.enum(['betao', 'metalico', 'madeira']),
  poleHeight: z.coerce.number().min(1, "A altura é obrigatória."),
  status: z.enum(['funcional', 'danificado', 'desligado']),
});

type LightingPoleReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLightingPoleSubmit: (data: Pick<PointOfInterest, 'title' | 'position' | 'lampType' | 'poleType' | 'poleHeight' | 'status'>) => void;
  poiToEdit: PointOfInterest | null;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function LightingPoleReport({ 
    open, 
    onOpenChange, 
    onLightingPoleSubmit,
    initialCenter,
    poiToEdit
}: LightingPoleReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [coords, setCoords] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const clearForm = () => {
    form.reset({
      title: "",
      lampType: undefined,
      poleType: undefined,
      poleHeight: undefined,
      status: "funcional",
    });
    setCoords('');
  }

  useEffect(() => {
    if (open) {
        const isEditing = !!poiToEdit && poiToEdit.type === 'lighting_pole';
        setIsEditMode(isEditing);

        if (isEditing) {
            form.reset({
                title: poiToEdit.title,
                lampType: poiToEdit.lampType,
                poleType: poiToEdit.poleType,
                poleHeight: poiToEdit.poleHeight,
                status: poiToEdit.status as any,
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
    onLightingPoleSubmit({ 
        ...values,
        status: values.status as PointOfInterestStatus,
        position: finalPosition 
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
          <SheetTitle>{isEditMode ? 'Editar Poste de Iluminação' : 'Mapear Poste de Iluminação'}</SheetTitle>
          <SheetDescription>
             Ajuste o pino no mapa para a localização exata do poste e preencha os seus dados técnicos.
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
                    mapId="lighting-pole-report-map"
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
                        <FormLabel>ID / Código do Poste</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: IP-C-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />

                <Separator />
                <h4 className="text-sm font-semibold">Detalhes Técnicos</h4>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="lampType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tipo de Lâmpada</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="led">LED</SelectItem>
                                    <SelectItem value="sodio">Vapor de Sódio</SelectItem>
                                    <SelectItem value="mercurio">Vapor de Mercúrio</SelectItem>
                                    <SelectItem value="outra">Outra</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="poleType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tipo de Poste</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="betao">Betão</SelectItem>
                                    <SelectItem value="metalico">Metálico</SelectItem>
                                    <SelectItem value="madeira">Madeira</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="poleHeight"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Altura do Poste (metros)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ex: 9" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado Operacional</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="funcional">Funcional</SelectItem>
                                <SelectItem value="danificado">Danificado</SelectItem>
                                <SelectItem value="desligado">Desligado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">{isEditMode ? 'Guardar Alterações' : 'Registar Poste'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
