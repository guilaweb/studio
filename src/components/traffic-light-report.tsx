
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
import { MapPin } from "lucide-react";


const formSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
});

type TrafficLightReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrafficLightSubmit: (data: Pick<PointOfInterest, 'description' | 'position'>) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -12.5, lng: 18.5 };
const defaultZoom = 5;

export default function TrafficLightReport({ 
    open, 
    onOpenChange, 
    onTrafficLightSubmit,
    initialCenter, 
}: TrafficLightReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });
  
  const clearForm = () => {
    form.reset({
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
    }
  }, [open, initialCenter]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalPosition = mapCenter;
    onTrafficLightSubmit({ ...values, position: finalPosition });
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
          <SheetTitle>Reportar Semáforo com Defeito</SheetTitle>
          <SheetDescription>
            Ajuste o pino no mapa para a localização exata do semáforo e descreva a avaria.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[50vh] bg-muted">
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
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição da Avaria</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: A luz vermelha não acende, está sempre a piscar amarelo, etc."
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
                <Button type="submit">Reportar Semáforo</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
