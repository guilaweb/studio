
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
import { useEffect, useState, useRef } from "react";
import { PointOfInterest } from "@/lib/data";
import { Map } from "@vis.gl/react-google-maps";
import { Camera, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "./ui/input";
import Image from "next/image";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "./ui/calendar";


const formSchema = z.object({
  title: z.string().min(1, "O tipo de incidente é obrigatório."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  position: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  incidentDate: z.date({
      required_error: "A data do incidente é obrigatória.",
  }),
});

type IncidentReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncidentSubmit: (incident: Omit<PointOfInterest, 'id' | 'authorId'> & { photoDataUri?: string }, type?: PointOfInterest['type']) => void;
  onIncidentEdit: (incidentId: string, updates: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'incidentDate'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
  incidentToEdit: PointOfInterest | null;
};

const defaultCenter = { lat: -12.5, lng: 18.5 };
const defaultZoom = 5;

export default function IncidentReport({ 
    open, 
    onOpenChange, 
    onIncidentSubmit, 
    onIncidentEdit,
    initialCenter, 
    incidentToEdit 
}: IncidentReportProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      position: initialCenter,
      incidentDate: new Date(),
    },
  });
  
  const clearForm = () => {
    form.reset({
        title: "",
        description: "",
        position: initialCenter,
        incidentDate: new Date(),
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  useEffect(() => {
    if (open) {
        const isEditing = !!incidentToEdit;
        setIsEditMode(isEditing);

        if (isEditing) {
            form.setValue("title", incidentToEdit.title);
            form.setValue("description", incidentToEdit.description);
            form.setValue("position", incidentToEdit.position);
            form.setValue("incidentDate", incidentToEdit.incidentDate ? new Date(incidentToEdit.incidentDate) : new Date(incidentToEdit.lastReported || Date.now()));
            setMapCenter(incidentToEdit.position);
            setMapZoom(16);
            if (incidentToEdit.updates && incidentToEdit.updates.length > 0) {
               const sortedUpdates = [...incidentToEdit.updates].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
               const originalReportUpdate = sortedUpdates[sortedUpdates.length - 1];
                if (originalReportUpdate.photoDataUri) {
                    setPhotoPreview(originalReportUpdate.photoDataUri);
                } else {
                    setPhotoPreview(null);
                }
            } else {
                setPhotoPreview(null);
            }
        } else {
            const isDefaultLocation = initialCenter.lat === 0 && initialCenter.lng === 0;
            const center = isDefaultLocation ? defaultCenter : initialCenter;
            const zoom = isDefaultLocation ? defaultZoom : 15;
            setMapCenter(center);
            setMapZoom(zoom);
            form.setValue("position", center);
            form.setValue("incidentDate", new Date());
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

    const handleSubmission = (photoDataUri?: string) => {
        const submissionData = {
            ...values,
            position: finalPosition,
            incidentDate: values.incidentDate.toISOString(),
            photoDataUri
        };

        if (isEditMode && incidentToEdit) {
            onIncidentEdit(incidentToEdit.id, submissionData);
        } else {
            const isSanitation = values.title === 'Contentor de lixo';
            const type = isSanitation ? 'sanitation' : 'incident';
            onIncidentSubmit({ ...submissionData }, type);
        }
    };
    
    if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            handleSubmission(reader.result as string);
        };
        reader.readAsDataURL(photoFile);
    } else {
        // If there's a preview but no new file, it means we keep the old photo in edit mode
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
                    <FormLabel>Tipo de Reporte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    name="incidentDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data do Incidente</FormLabel>
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
