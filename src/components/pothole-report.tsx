

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
import { Camera, MapPin, Locate } from "lucide-react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "./ui/switch";

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  day: z.coerce.number().min(1, "Dia inválido").max(31, "Dia inválido"),
  month: z.coerce.number().min(1, "Mês inválido").max(12, "Mês inválido"),
  year: z.coerce.number().min(1900, "Ano inválido").max(currentYear, `O ano não pode ser superior a ${currentYear}`),
  isPublic: z.boolean().default(true),
}).refine(data => {
    try {
        const date = new Date(data.year, data.month - 1, data.day);
        return date.getFullYear() === data.year && date.getMonth() === data.month - 1 && date.getDate() === data.day;
    } catch {
        return false;
    }
}, {
    message: "A data introduzida é inválida.",
    path: ["day"],
});

type PotholeReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPotholeSubmit: (data: Pick<PointOfInterest, 'description' | 'position' | 'incidentDate' | 'isPublic'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function PotholeReport({ 
    open, 
    onOpenChange, 
    onPotholeSubmit,
    initialCenter, 
}: PotholeReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const now = new Date();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      isPublic: true,
    },
  });
  
  const clearForm = () => {
    const now = new Date();
    form.reset({
        description: "",
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        isPublic: true,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setCoords('');
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

    const dmsToDd = (d: number, m: number, s: number, direction: string) => {
        let dd = d + m/60 + s/3600;
        if (direction === 'S' || direction === 'W') {
            dd = dd * -1;
        }
        return dd;
    };
    
    const dmsParts = trimmedCoords.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/g);
    if (dmsParts?.length === 2) {
        try {
            const [latStr, lonStr] = dmsParts;
            const latParts = latStr.match(/(\d+)°(\d+)'([\d.]+)"([NS])/);
            const lonParts = lonStr.match(/(\d+)°(\d+)'([\d.]+)"([EW])/);
            if (!latParts || !lonParts) throw new Error("Formato DMS inválido.");

            const lat = dmsToDd(parseFloat(latParts[1]), parseFloat(latParts[2]), parseFloat(latParts[3]), latParts[4]);
            const lng = dmsToDd(parseFloat(lonParts[1]), parseFloat(lonParts[2]), parseFloat(lonParts[3]), lonParts[4]);
            
            setMapCenter({ lat, lng });
            setMapZoom(18);
            toast({ title: 'Localização Encontrada', description: 'O mapa foi centrado nas coordenadas DMS.' });
            return;
        } catch (e) {}
    }

    toast({ variant: 'destructive', title: 'Formato de Coordenadas Inválido', description: 'Use o formato "-14.13, 14.67" ou \'14°07..."S 14°40..."E\'' });
  };

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
    const incidentDate = new Date(Date.UTC(values.year, values.month - 1, values.day)).toISOString();

    const handleSubmission = (photoDataUri?: string) => {
        onPotholeSubmit({ 
            description: values.description,
            incidentDate: incidentDate,
            position: finalPosition,
            isPublic: values.isPublic,
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
          <SheetTitle>Reportar Buraco na Via</SheetTitle>
          <SheetDescription>
            Ajuste o pino no mapa para a localização exata do buraco e descreva o problema.
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 py-2">
            <Label htmlFor="coords">Localizar por Coordenadas</Label>
            <div className="flex gap-2 mt-1">
                <Input id="coords" placeholder='-14.12, 14.67 ou 14°07..."S...' value={coords} onChange={e => setCoords(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleLocateFromCoords}><Locate className="h-4 w-4"/></Button>
            </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    mapId="pothole-report-map"
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
                 <div className="space-y-2">
                    <FormLabel>Data de Observação</FormLabel>
                     <div className="flex items-start gap-2">
                        <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="DD" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="month"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="MM" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <FormItem className="w-24">
                                    <FormControl>
                                        <Input placeholder="AAAA" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormMessage>{form.formState.errors.day?.message}</FormMessage>
                 </div>
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: Buraco fundo na faixa da direita, perto do cruzamento."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 {profile?.role !== 'Cidadao' && (
                    <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Visibilidade Pública</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
                 <div>
                    <Label htmlFor="pothole-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Fotografia (Opcional)
                        </div>
                    </Label>
                    <Input id="pothole-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Reportar Buraco</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
