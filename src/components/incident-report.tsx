

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
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Map } from "@vis.gl/react-google-maps";
import { Camera, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "./ui/input";
import Image from "next/image";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useAuth } from "@/hooks/use-auth";

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  title: z.string().min(1, "O tipo de incidente é obrigatório."),
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
    path: ["day"], // Show error on the day field
});


type IncidentReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncidentSubmit: (incident: Omit<PointOfInterest, 'id' | 'authorId' | 'updates' | 'type' | 'status'> & { photoDataUri?: string }) => void;
  onIncidentEdit: (incidentId: string, incident: Omit<PointOfInterest, 'id' | 'authorId' | 'updates' | 'type' | 'status'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
  incidentToEdit: PointOfInterest | null;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function IncidentReport({ 
    open, 
    onOpenChange, 
    onIncidentSubmit, 
    onIncidentEdit,
    initialCenter, 
    incidentToEdit 
}: IncidentReportProps) {
  const { profile } = useAuth();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  
  const now = new Date();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
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
        title: "",
        description: "",
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        isPublic: true,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  useEffect(() => {
    if (open) {
        const isEditing = !!incidentToEdit;
        setIsEditMode(isEditing);

        if (isEditing) {
            const incidentDate = incidentToEdit.incidentDate ? new Date(incidentToEdit.incidentDate) : new Date(incidentToEdit.lastReported || Date.now());
            form.reset({
                title: incidentToEdit.title,
                description: incidentToEdit.description,
                day: incidentDate.getUTCDate(),
                month: incidentDate.getUTCMonth() + 1,
                year: incidentDate.getUTCFullYear(),
                isPublic: incidentToEdit.isPublic,
            });
            
            setMapCenter(incidentToEdit.position);
            setMapZoom(16);

            const originalUpdate = incidentToEdit.updates?.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
            if (originalUpdate?.photoDataUri) {
                setPhotoPreview(originalUpdate.photoDataUri);
            } else {
                setPhotoPreview(null);
            }

        } else {
            const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
            const center = isDefaultLocation ? defaultCenter : initialCenter;
            const zoom = isDefaultLocation ? defaultZoom : 15;
            setMapCenter(center);
            setMapZoom(zoom);
            clearForm();
        }
    }
  }, [incidentToEdit, open, form, initialCenter]);


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
        const submissionData = {
            title: values.title,
            description: values.description,
            position: finalPosition,
            incidentDate: incidentDate,
            isPublic: values.isPublic,
            photoDataUri
        };

        if (isEditMode && incidentToEdit) {
            onIncidentEdit(incidentToEdit.id, submissionData);
        } else {
            onIncidentSubmit(submissionData);
        }
    };
    
    if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            handleSubmission(reader.result as string);
        };
        reader.readAsDataURL(photoFile);
    } else {
        handleSubmission(photoPreview && isEditMode ? photoPreview : undefined);
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
          <SheetTitle>{isEditMode ? 'Editar Incidência' : 'Reportar Incidência'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Altere os detalhes da sua incidência e guarde as alterações.' : 'Forneça os detalhes do que presenciou e ajuste o pino no mapa para a localização exata.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[35vh] bg-muted">
                <Map
                    mapId="incident-report-map"
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
                    <FormLabel>Tipo de Incidente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de incidente" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Colisão Ligeira">Colisão Ligeira</SelectItem>
                        <SelectItem value="Colisão Grave">Colisão Grave</SelectItem>
                        <SelectItem value="Atropelamento">Atropelamento</SelectItem>
                        <SelectItem value="Acidente de Moto">Acidente de Moto</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <div className="space-y-2">
                    <FormLabel>Data do Incidente</FormLabel>
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
                {profile?.role !== 'Cidadao' && (
                    <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Visibilidade Pública</FormLabel>
                                    <FormMessage />
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
                    <Label htmlFor="incident-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Fotografia (Opcional)
                        </div>
                    </Label>
                    <Input id="incident-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}

            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">{isEditMode ? 'Guardar Alterações' : 'Submeter Reporte'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
