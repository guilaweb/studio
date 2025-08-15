
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { PointOfInterest } from "@/lib/data";
import { Map } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";


const formSchema = z.object({
  title: z.string().min(1, "O tipo de incidente é obrigatório."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  position: z.object({
    lat: z.number(),
    lng: z.number(),
  })
});

type IncidentReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncidentSubmit: (incident: Omit<PointOfInterest, 'id' | 'authorId'>, type?: PointOfInterest['type']) => void;
  initialCenter: google.maps.LatLngLiteral;
};

export default function IncidentReport({ open, onOpenChange, onIncidentSubmit, initialCenter }: IncidentReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      position: initialCenter,
    },
  });

  useEffect(() => {
    if (open) {
        form.reset({
            title: "",
            description: "",
            position: initialCenter
        });
        setMapCenter(initialCenter);
    }
  }, [open, initialCenter, form]);
  
  useEffect(() => {
    form.setValue("position", mapCenter);
  }, [mapCenter, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isSanitation = values.title === 'Contentor de lixo';
    const type = isSanitation ? 'sanitation' : 'incident';
    
    // The position is already in the values object from the form state
    onIncidentSubmit(values, type);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col p-0">
        <SheetHeader className="p-6">
          <SheetTitle>Reportar Incidência</SheetTitle>
          <SheetDescription>
            Forneça os detalhes do que presenciou e ajuste o pino no mapa para a localização exata.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 relative">
                <Map
                    defaultCenter={initialCenter}
                    defaultZoom={15}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                >
                </Map>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin className="text-primary h-10 w-10" />
                 </div>
            </div>
            <div className="p-6 space-y-4 bg-background">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de Reporte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de reporte" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Colisão Ligeira">Colisão Ligeira</SelectItem>
                        <SelectItem value="Colisão Grave">Colisão Grave</SelectItem>
                        <SelectItem value="Atropelamento">Atropelamento</SelectItem>
                        <SelectItem value="Acidente de Moto">Acidente de Moto</SelectItem>
                        <SelectItem value="Buraco na via">Buraco na via</SelectItem>
                        <SelectItem value="Semáforo com defeito">Semáforo com defeito</SelectItem>
                        <SelectItem value="Iluminação pública com defeito">Iluminação pública com defeito</SelectItem>
                        <SelectItem value="Contentor de lixo">Mapear Contentor de Lixo</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição (Opcional: adicione tags como #falta-de-sinalização)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Descreva a incidência com detalhes. Ex: Colisão no cruzamento, um dos carros capotou. #trânsitocortado"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <SheetFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Submeter Reporte</Button>
                </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
