
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
import { Map } from "@vis.gl/react-google-maps";
import { MapPin, Share2 } from "lucide-react";
import { Input } from "./ui/input";

const formSchema = z.object({
  title: z.string().min(5, "O nome do croqui é obrigatório."),
  description: z.string().optional(),
});

type CroquiReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCroquiSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position'>) => void;
  initialCenter: google.maps.LatLngLiteral;
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
    onCroquiSubmit({ ...values, position: finalPosition });
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
          <SheetTitle>Criar Croqui de Localização</SheetTitle>
          <SheetDescription>
            Arraste o mapa para posicionar o pino no local exato e preencha os detalhes.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[45vh] bg-muted">
                <Map
                    mapId="croqui-report-map"
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
                        placeholder="Ex: Procurar pelo portão verde, tocar a campainha 3 vezes."
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
                <Button type="submit">
                    <Share2 className="mr-2 h-4 w-4" />
                    Criar e Partilhar
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
