
"use client";

import React from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Landmark, Construction, Siren, ThumbsUp, ThumbsDown, Trash, ShieldCheck, ShieldAlert, ShieldX, MessageSquarePlus, Wand2, Truck, Camera, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { generateOfficialResponse } from "@/ai/flows/generate-official-response-flow";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PointOfInterestDetailsProps = {
  poi: PointOfInterest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPoiStatusChange: (poiId: string, status: PointOfInterest['status']) => void;
  onAddUpdate: (poiId: string, updateText: string, photoDataUri?: string) => void;
};

const layerConfig = {
    atm: { label: "Caixa Eletrônico", Icon: Landmark, variant: "default" as const},
    construction: { label: "Obras e Projetos", Icon: Construction, variant: "secondary" as const },
    incident: { label: "Incidente", Icon: Siren, variant: "destructive" as const},
    sanitation: { label: "Ponto de Saneamento", Icon: Trash, variant: "outline" as const},
};

const getLastReportedTime = (lastReported?: string) => {
    if (!lastReported) return null;
    const time = formatDistanceToNow(new Date(lastReported), { addSuffix: true, locale: pt });
    return <p className="text-xs text-muted-foreground mt-1">Último reporte: {time}</p>
}

const IncidentTags = ({ description }: { description: string }) => {
    const tags = description.match(/#\w+/g);
    if (!tags || tags.length === 0) return null;

    return (
        <div className="mt-4">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                ))}
            </div>
        </div>
    )
}

const ATMStatus = ({poi, onPoiStatusChange}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange']}) => {
    if (poi.type !== 'atm') return null;

    const getStatusBadge = () => {
        if (poi.status === 'available') return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Com Dinheiro</Badge>
        if (poi.status === 'unavailable') return <Badge variant="destructive">Sem Dinheiro</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Estado do ATM</h3>
            <div className="flex items-center justify-between mb-4">
                {getStatusBadge()}
                {getLastReportedTime(poi.lastReported)}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'available')}>
                    <ThumbsUp className="mr-2"/> TEM DINHEIRO
                </Button>
                <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'unavailable')}>
                    <ThumbsDown className="mr-2"/> NÃO TEM DINHEIRO
                </Button>
            </div>
        </div>
    )
}

const SanitationTicket = ({poi, onPoiStatusChange, onAddUpdate}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange'], onAddUpdate: PointOfInterestDetailsProps['onAddUpdate']}) => {
    const { user } = useAuth();
    
    const getStatusBadge = () => {
        if (poi.status === 'full') return <Badge className="bg-orange-500 hover:bg-orange-600">Cheio</Badge>
        if (poi.status === 'damaged') return <Badge variant="destructive">Danificado</Badge>
        if (poi.status === 'collected') return <Badge className="bg-green-500 hover:bg-green-600">Recolhido</Badge>
        if (poi.status === 'in_progress') return <Badge className="bg-blue-500 hover:bg-blue-600">Em Resolução</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    return (
        <div className="mt-4 space-y-4">
             <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Estado do Contentor</h3>
                <div className="flex items-center justify-between mb-4">
                    {getStatusBadge()}
                    {getLastReportedTime(poi.lastReported)}
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200" onClick={() => onPoiStatusChange(poi.id, 'in_progress')}>
                        <Truck className="mr-2"/> Em Resolução
                    </Button>
                    <Button variant="outline" className="bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-200" onClick={() => onPoiStatusChange(poi.id, 'full')}>
                        <ShieldAlert className="mr-2"/> CHEIO
                    </Button>
                    <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'damaged')}>
                        <ShieldX className="mr-2"/> DANIFICADO
                    </Button>
                </div>
             </div>
             
             <Timeline poi={poi} onAddUpdate={onAddUpdate} showAiButton={false}/>
        </div>
    )
}

const Timeline = ({poi, onAddUpdate, showAiButton}: {poi: PointOfInterest, onAddUpdate: PointOfInterestDetailsProps['onAddUpdate'], showAiButton: boolean}) => {
    const [updateText, setUpdateText] = React.useState("");
    const [updatePhoto, setUpdatePhoto] = React.useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUpdatePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearForm = () => {
        setUpdateText("");
        setUpdatePhoto(null);
        setPhotoPreview(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateText.trim()) return;

        if (updatePhoto) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const photoDataUri = reader.result as string;
                onAddUpdate(poi.id, updateText, photoDataUri);
                clearForm();
            };
            reader.readAsDataURL(updatePhoto);
        } else {
            onAddUpdate(poi.id, updateText);
            clearForm();
        }
    }

    const handleGenerateResponse = async () => {
        const lastCitizenUpdate = poi.updates?.find(u => u.authorId !== 'municipality'); // Simple check for non-official updates
        if (!lastCitizenUpdate) {
            toast({
                variant: "destructive",
                title: "Não há contribuições para responder",
                description: "A IA só pode gerar respostas para contribuições de cidadãos.",
            });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateOfficialResponse({
                citizenContribution: lastCitizenUpdate.text,
                projectName: poi.title,
            });
            setUpdateText(result.response);
        } catch (error) {
            console.error("Error generating AI response:", error);
            toast({
                variant: "destructive",
                title: "Erro ao gerar resposta",
                description: "Não foi possível gerar uma resposta com IA. Tente novamente.",
            });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="mt-4">
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-4">Linha do Tempo e Respostas</h3>
                
                 { user && (
                    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                        <Textarea 
                            placeholder="Viu algum progresso ou problema? Descreva o que viu... (Ex: A obra está parada, a calçada foi concluída, etc.)"
                            value={updateText}
                            onChange={(e) => setUpdateText(e.target.value)}
                        />
                         <div>
                            <Label htmlFor="update-photo" className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-pointer">
                                <Camera className="h-4 w-4" />
                                Anexar Fotografia (Opcional)
                            </Label>
                            <Input id="update-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 h-auto p-1"/>
                        </div>
                        {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}

                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm" disabled={!updateText.trim()}>
                                <MessageSquarePlus className="mr-2 h-4 w-4" />
                                Adicionar Atualização
                            </Button>
                             {showAiButton && (
                                <Button type="button" size="sm" variant="outline" onClick={handleGenerateResponse} disabled={isGenerating}>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    {isGenerating ? "A gerar..." : "Gerar Resposta com IA"}
                                </Button>
                             )}
                        </div>
                    </form>
                 )}

                <div className="space-y-4">
                    {poi.updates && poi.updates.length > 0 ? (
                        poi.updates.map(update => (
                            <div key={update.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                               <p className="whitespace-pre-wrap">{update.text}</p>
                               {update.photoDataUri && (
                                    <div className="mt-2">
                                        <Image src={update.photoDataUri} alt="Prova de execução" width={200} height={150} className="rounded-md object-cover" />
                                    </div>
                               )}
                               <p className="text-xs text-muted-foreground mt-2">
                                    {`Atualizado ${formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })} por um ${update.authorId === user?.uid ? 'gestor' : 'cidadão'}.`}
                               </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                           Ainda não há fiscalizações ou atualizações.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}


export default function PointOfInterestDetails({ poi, open, onOpenChange, onPoiStatusChange, onAddUpdate }: PointOfInterestDetailsProps) {
  if (!poi) return null;

  const config = layerConfig[poi.type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
                <Badge variant={config.variant} className="mb-2">{config.label}</Badge>
                <SheetTitle className="text-2xl">{poi.title}</SheetTitle>
            </div>
            <config.Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        </SheetHeader>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{poi.description}</p>
            </div>
             <div>
                <h3 className="font-semibold mb-2">Localização</h3>
                <p className="text-muted-foreground">{`Lat: ${poi.position.lat.toFixed(6)}, Lng: ${poi.position.lng.toFixed(6)}`}</p>
            </div>
            {poi.type === 'incident' && <IncidentTags description={poi.description} />}
            {poi.type === 'atm' && <ATMStatus poi={poi} onPoiStatusChange={onPoiStatusChange} />}
            {poi.type === 'sanitation' && <SanitationTicket poi={poi} onPoiStatusChange={onPoiStatusChange} onAddUpdate={onAddUpdate}/>}
            {poi.type === 'construction' && <Timeline poi={poi} onAddUpdate={onAddUpdate} showAiButton={true} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

    