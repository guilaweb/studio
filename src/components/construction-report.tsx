

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
import { Camera, MapPin, Calendar as CalendarIcon, Locate } from "lucide-react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "./ui/switch";


const formSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  dates: z.object({
      from: z.date(),
      to: z.date(),
  }, { required_error: "As datas de início e fim são obrigatórias."}),
  isPublic: z.boolean().default(true),
});

type ConstructionReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConstructionSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'startDate' | 'endDate' | 'isPublic'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function ConstructionReport({ 
    open, 
    onOpenChange, 
    onConstructionSubmit,
    initialCenter, 
}: ConstructionReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dates: {
          from: new Date(),
          to: addDays(new Date(), 7),
      },
      isPublic: true,
    },
  });
  
  const clearForm = () => {
    form.reset({
        title: "",
        description: "",
        dates: {
            from: new Date(),
            to: addDays(new Date(), 7),
        },
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
        form.reset();
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

    const handleSubmission = (photoDataUri?: string) => {
        onConstructionSubmit({ 
            title: values.title,
            description: values.description,
            startDate: values.dates.from.toISOString(),
            endDate: values.dates.to.toISOString(),
            isPublic: values.isPublic,
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
          <SheetTitle>Mapear Obra ou Projeto</SheetTitle>
          <SheetDescription>
            Forneça os detalhes da obra, defina a sua duração e ajuste o pino no mapa para a localização exata.
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
                        <FormLabel>Título da Obra/Projeto</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Requalificação da Rua Central" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="dates"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Período de Execução</FormLabel>
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
                                {field.value?.from ? (
                                    field.value.to ? (
                                    <>
                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                        {format(field.value.to, "LLL dd, y")}
                                    </>
                                    ) : (
                                    format(field.value.from, "LLL dd, y")
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
                                numberOfMonths={2}
                                locale={pt}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição da Obra</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Descreva os trabalhos a serem realizados, constrangimentos de trânsito, etc."
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
                    <Label htmlFor="construction-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Anexar Planta ou Fotografia (Opcional)
                        </div>
                    </Label>
                    <Input id="construction-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Mapear Obra</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

    
