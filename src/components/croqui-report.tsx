
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
import { CroquiPoint, PointOfInterest } from "@/lib/data";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { MapPin, Share2, PlusCircle, X } from "lucide-react";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "./ui/label";


const formSchema = z.object({
  title: z.string().min(5, "O nome do croqui é obrigatório."),
  description: z.string().optional(),
});

type CroquiReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCroquiSubmit: (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'croquiPoints'>) => void;
  initialCenter: google.maps.LatLngLiteral;
  mapRef?: React.RefObject<google.maps.Map>;
};

const defaultCenter = { lat: -8.8368, lng: 13.2343 };
const defaultZoom = 12;

export default function CroquiReport({ 
    open, 
    onOpenChange, 
    onCroquiSubmit,
    initialCenter, 
    mapRef,
}: CroquiReportProps) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(15);
  const [referencePoints, setReferencePoints] = useState<CroquiPoint[]>([]);
  const [newReferenceLabel, setNewReferenceLabel] = useState("");
  const [newReferencePosition, setNewReferencePosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [isAddingReference, setIsAddingReference] = useState(false);
  
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
    setReferencePoints([]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCenter]);
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
      if(isAddingReference && event.latLng) {
          setNewReferencePosition(event.latLng.toJSON());
      }
  }

  const handleAddReference = () => {
    if (newReferencePosition && newReferenceLabel) {
        setReferencePoints(prev => [...prev, {
            position: newReferencePosition,
            label: newReferenceLabel,
            type: 'custom'
        }]);
        setNewReferenceLabel("");
        setNewReferencePosition(null);
        setIsAddingReference(false);
    }
  }
  
  const removeReferencePoint = (index: number) => {
    setReferencePoints(prev => prev.filter((_, i) => i !== index));
  }


  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalPosition = mapCenter;
    onCroquiSubmit({ ...values, position: finalPosition, croquiPoints: referencePoints });
  }

  return (
    <>
    <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen) clearForm();
        onOpenChange(isOpen);
    }}>
      <SheetContent 
        className="sm:max-w-lg w-full flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Criar Croqui de Localização</SheetTitle>
          <SheetDescription>
            Arraste o mapa para posicionar o pino principal, adicione pontos de referência e preencha os detalhes.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
             <div className="relative h-[40vh] bg-muted">
                <Map
                    mapId="croqui-report-map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                    gestureHandling={'greedy'}
                    onClick={handleMapClick}
                >
                    {referencePoints.map((point, index) => (
                         <AdvancedMarker key={index} position={point.position} title={point.label}>
                            <Pin background={'#FB923C'} borderColor={'#F97316'} glyphColor={'#ffffff'} />
                         </AdvancedMarker>
                    ))}
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
                        <FormLabel>Nome do Croqui</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Casa da Família Santos, Festa do Kito" {...field} />
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
                        placeholder="Ex: Procurar pelo portão verde, tocar a campainha 3 vezes."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div className="space-y-2">
                    <Label>Pontos de Referência</Label>
                    <p className="text-xs text-muted-foreground">Clique no botão abaixo e de seguida clique no mapa para adicionar uma referência personalizada.</p>
                    {referencePoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                            <span>{point.label}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeReferencePoint(index)}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingReference(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Referência
                    </Button>
                </div>

            </div>
            <SheetFooter className="p-6 pt-4 border-t bg-background">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">
                    <Share2 className="mr-2 h-4 w-4" />
                    Criar e Partilhar
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
    
    <AlertDialog open={isAddingReference && !!newReferencePosition} onOpenChange={(open) => !open && setIsAddingReference(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar Ponto de Referência</AlertDialogTitle>
          <AlertDialogDescription>
            Dê um nome a este ponto de referência para ajudar os outros a localizá-lo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
            <Label htmlFor="reference-label">Nome da Referência</Label>
            <Input 
                id="reference-label"
                value={newReferenceLabel}
                onChange={(e) => setNewReferenceLabel(e.target.value)}
                placeholder="Ex: Mangueira grande, Paragem de táxi"
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setNewReferencePosition(null); setNewReferenceLabel(""); setIsAddingReference(false) }}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddReference} disabled={!newReferenceLabel}>Adicionar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
}

