
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
import { Map } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


const formSchema = z.object({
  plotNumber: z.string().optional(),
  registrationCode: z.string().optional(),
  zoningInfo: z.string().optional(),
  status: z.enum(['available', 'occupied', 'protected', 'in_dispute', 'reserved']),
});

type LandPlotReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLandPlotSubmit: (data: Pick<PointOfInterest, 'position' | 'status' | 'plotNumber' | 'registrationCode' | 'zoningInfo'>) => void;
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
    const finalPosition = mapCenter;
    onLandPlotSubmit({ 
        ...values,
        status: values.status as PointOfInterestStatus,
        position: finalPosition,
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
            Ajuste o pino no mapa para a localização do lote e preencha as informações cadastrais.
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
                </Map>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin className="text-primary h-10 w-10" />
                 </div>
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
