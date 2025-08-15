
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
import { Camera, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import Image from "next/image";


const formSchema = z.object({
  title: z.string().min(1, "O tipo de incidente é obrigatório."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  position: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  photoDataUri: z.string().optional(),
});

type IncidentReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncidentSubmit: (incident: Omit<PointOfInterest, 'id' | 'authorId'> & { photoDataUri?: string }, type?: PointOfInterest['type']) => void;
  initialCenter: google.maps.LatLngLiteral;
};

export default function IncidentReport({ open, onOpenChange, onIncidentSubmit, initialCenter }: IncidentReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      position: initialCenter,
    },
  });
  
  const clearForm = () => {
    form.reset({
        title: "",
        description: "",
        position: initialCenter
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setMapCenter(initialCenter);
  }

  useEffect(() => {
    if (open) {
      clearForm();
    }
  }, [open, initialCenter, form]);
  
  useEffect(() => {
    form.setValue("position", mapCenter);
  }, [mapCenter, form]);

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
    const isSanitation = values.title === 'Contentor de lixo';
    const type = isSanitation ? 'sanitation' : 'incident';
    
    if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const photoDataUri = reader.result as string;
            onIncidentSubmit({ ...values, photoDataUri }, type);
        };
        reader.readAsDataURL(photoFile);
    } else {
        onIncidentSubmit(values, type);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Reportar Incidência</SheetTitle>
          <SheetDescription>
            Forneça os detalhes do que presenciou e ajuste o pino no mapa para a localização exata.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[40vh] bg-muted">
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
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-pointer">
                        <Camera className="h-4 w-4" />
                        Fotografia (Opcional)
                    </Label>
                    <Input id="incident-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}

                <SheetFooter className="pt-4">
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
