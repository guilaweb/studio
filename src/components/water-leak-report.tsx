

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
import { PointOfInterest, PointOfInterestPriority } from "@/lib/data";
import { Map } from "@vis.gl/react-google-maps";
import { Camera, MapPin, Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


const formSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  incidentDate: z.date({
      required_error: "A data da observação é obrigatória.",
  }),
  priority: z.enum(['low', 'medium', 'high'], { required_error: "A gravidade é obrigatória."}),
});

type WaterLeakReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWaterLeakSubmit: (data: Pick<PointOfInterest, 'description' | 'position' | 'incidentDate' | 'priority'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function WaterLeakReport({ 
    open, 
    onOpenChange, 
    onWaterLeakSubmit,
    initialCenter, 
}: WaterLeakReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      incidentDate: new Date(),
      priority: "low",
    },
  });
  
  const clearForm = () => {
    form.reset({
        description: "",
        incidentDate: new Date(),
        priority: "low",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  useEffect(() => {
    if (open) {
        const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
        const center = isDefaultLocation ? defaultCenter : initialCenter;
        const zoom = isDefaultLocation ? defaultZoom : 15;
        setMapCenter(center);
        setMapZoom(zoom);
        form.setValue("incidentDate", new Date());
        clearForm();
    }
  }, [open, initialCenter, form]);

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

    const handleSubmission = (photoDataUri?: string) => {
        onWaterLeakSubmit({ 
            ...values,
            priority: values.priority as PointOfInterestPriority,
            incidentDate: values.incidentDate.toISOString(),
            position: finalPosition,
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
          <SheetTitle>Reportar Fuga de Água</SheetTitle>
          <SheetDescription>
            Ajuste o pino no mapa para a localização exata da fuga, descreva o problema e anexe uma foto se possível.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    mapId="water-leak-report-map"
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
                    name="incidentDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data de Observação</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: pt })
                                ) : (
                                    <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("2000-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gravidade da Fuga</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a gravidade da fuga" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="low">Pequena</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Grave</SelectItem>
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
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: Fuga na junta do passeio, a água corre pela rua abaixo."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <div>
                    <Label htmlFor="water-leak-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Fotografia (Opcional)
                        </div>
                    </Label>
                    <Input id="water-leak-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Reportar Fuga</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

    