

"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Camera, MapPin, PlusCircle, Trash2, Locate } from "lucide-react";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  title: z.string({ required_error: "O tipo de unidade é obrigatório." }),
  name: z.string().min(5, "O nome da unidade é obrigatório."),
  description: z.string().optional(),
  services: z.array(z.object({ value: z.string().min(1, "O serviço não pode estar vazio.") })),
  capacityBeds: z.coerce.number().optional(),
  capacityIcuBeds: z.coerce.number().optional(),
  capacityDaily: z.coerce.number().optional(),
  isPublic: z.boolean().default(true),
});

type HealthUnitReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHealthUnitSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'healthServices' | 'capacity' | 'isPublic'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function HealthUnitReport({ 
    open, 
    onOpenChange, 
    onHealthUnitSubmit,
    initialCenter, 
}: HealthUnitReportProps) {
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
      name: "",
      description: "",
      services: [{ value: "" }],
      isPublic: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services"
  });
  
  const clearForm = () => {
    form.reset({
      title: "",
      name: "",
      description: "",
      services: [{ value: "" }],
      capacityBeds: undefined,
      capacityIcuBeds: undefined,
      capacityDaily: undefined,
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

    const handleSubmission = (photoDataUri?: string) => {
        onHealthUnitSubmit({
            title: values.name,
            description: values.description || '',
            position: finalPosition,
            photoDataUri,
            healthServices: values.services.map(s => s.value).filter(Boolean),
            capacity: {
                beds: values.capacityBeds,
                icu_beds: values.capacityIcuBeds,
                daily_capacity: values.capacityDaily
            },
            isPublic: values.isPublic,
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
          <SheetTitle>Mapear Unidade Sanitária</SheetTitle>
          <SheetDescription>
            Ajuste o pino no mapa para a localização exata e preencha os detalhes da unidade.
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
             <div className="relative h-[30vh] bg-muted">
                <Map
                    mapId="health-unit-report-map"
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
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Unidade</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de unidade" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Hospital Geral">Hospital Geral</SelectItem>
                                <SelectItem value="Hospital Municipal/Provincial">Hospital Municipal/Provincial</SelectItem>
                                <SelectItem value="Centro de Saúde">Centro de Saúde</SelectItem>
                                <SelectItem value="Posto Médico">Posto Médico</SelectItem>
                                <SelectItem value="Clínica Privada">Clínica Privada</SelectItem>
                                <SelectItem value="Laboratório">Laboratório</SelectItem>
                                <SelectItem value="Farmácia">Farmácia</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Oficial da Unidade</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Hospital Pediátrico David Bernardino" {...field} />
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
                        placeholder="Ex: Horário de funcionamento, contactos, etc."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Separator />
                <div>
                    <Label>Capacidade da Unidade</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <FormField control={form.control} name="capacityBeds" render={({ field }) => (<FormItem><FormLabel className="text-xs">Nº Camas</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="capacityIcuBeds" render={({ field }) => (<FormItem><FormLabel className="text-xs">Nº Camas UCI</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="capacityDaily" render={({ field }) => (<FormItem><FormLabel className="text-xs">Atend./Dia</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    </div>
                </div>
                 <div>
                    <Label>Serviços e Especialidades</Label>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                            control={form.control}
                            name={`services.${index}.value`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder="Ex: Pediatria, Maternidade..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Serviço
                    </Button>
                </div>
                 <div>
                    <Label htmlFor="health-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Fotografia da Fachada (Opcional)
                        </div>
                    </Label>
                    <Input id="health-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Mapear Unidade</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
