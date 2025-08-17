

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
import { Camera, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import Image from "next/image";
import { Label } from "./ui/label";


const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  description: z.string(),
});

type AtmReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAtmSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position'> & { photoDataUri?: string }) => void;
  onAtmEdit: (poiId: string, data: Pick<PointOfInterest, 'title' | 'description' | 'position'> & { photoDataUri?: string }) => void;
  initialCenter: google.maps.LatLngLiteral;
  poiToEdit: PointOfInterest | null;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function AtmReport({ 
    open, 
    onOpenChange, 
    onAtmSubmit,
    onAtmEdit,
    initialCenter,
    poiToEdit,
}: AtmReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  useEffect(() => {
    if (open) {
        const isEditing = !!poiToEdit && poiToEdit.type === 'atm';
        setIsEditMode(isEditing);

        if (isEditing) {
            form.setValue("title", poiToEdit.title);
            form.setValue("description", poiToEdit.description);
            setMapCenter(poiToEdit.position);
            setMapZoom(16);

            const originalUpdate = poiToEdit.updates?.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
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
  }, [poiToEdit, open, form, initialCenter]);

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
        const submissionData = { ...values, position: finalPosition, photoDataUri };

        if (isEditMode && poiToEdit) {
            onAtmEdit(poiToEdit.id, submissionData);
        } else {
            onAtmSubmit(submissionData);
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
          <SheetTitle>{isEditMode ? 'Editar Caixa Eletrónico' : 'Mapear Caixa Eletrónico (ATM)'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Altere os detalhes deste ATM e guarde as alterações.' : 'Ajuste o pino no mapa para a localização exata do ATM e adicione uma identificação.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[40vh] bg-muted">
                <Map
                    mapId="atm-report-map"
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
                        <FormLabel>Identificação do ATM</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: ATM do Banco X, Multibanco Praça Central" {...field} />
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
                        placeholder="Ex: Localizado dentro da loja de conveniência, etc."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <div>
                    <Label htmlFor="atm-photo" className="text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Fotografia (Opcional)
                        </div>
                    </Label>
                    <Input id="atm-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                </div>
                {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}
            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">{isEditMode ? 'Guardar Alterações' : 'Mapear ATM'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

    