
"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PointOfInterest } from "@/lib/data";
import { Landmark, Construction, Siren, ThumbsUp, ThumbsDown, Trash, ShieldCheck, ShieldAlert, ShieldX, MessageSquarePlus, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { generateOfficialResponse } from "@/ai/flows/generate-official-response-flow";
import { useToast } from "@/hooks/use-toast";

type PointOfInterestDetailsProps = {
  poi: PointOfInterest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPoiStatusChange: (poiId: string, status: PointOfInterest['status']) => void;
  onAddUpdate: (poiId: string, updateText: string) => void;
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

const SanitationStatus = ({poi, onPoiStatusChange}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange']}) => {
    if (poi.type !== 'sanitation') return null;

    const getStatusBadge = () => {
        if (poi.status === 'full') return <Badge className="bg-orange-500 hover:bg-orange-600">Cheio</Badge>
        if (poi.status === 'damaged') return <Badge variant="destructive">Danificado</Badge>
        if (poi.status === 'collected') return <Badge className="bg-green-500 hover:bg-green-600">Recolhido</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Estado do Contentor</h3>
            <div className="flex items-center justify-between mb-4">
                {getStatusBadge()}
                {getLastReportedTime(poi.lastReported)}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'collected')}>
                    <ShieldCheck className="mr-2"/> RECOLHIDO
                </Button>
                <Button variant="outline" className="bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-200" onClick={() => onPoiStatusChange(poi.id, 'full')}>
                    <ShieldAlert className="mr-2"/> CHEIO
                </Button>
                <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'damaged')}>
                    <ShieldX className="mr-2"/> DANIFICADO
                </Button>
            </div>
        </div>
    )
}

const ConstructionTimeline = ({poi, onAddUpdate}: {poi: PointOfInterest, onAddUpdate: PointOfInterestDetailsProps['onAddUpdate']}) => {
    const [updateText, setUpdateText] = React.useState("");
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { toast } = useToast();
    
    if (poi.type !== 'construction') return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (updateText.trim()) {
            onAddUpdate(poi.id, updateText);
            setUpdateText("");
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
                <h3 className="font-semibold mb-4">Linha do Tempo da Fiscalização Cidadã</h3>
                
                <form onSubmit={handleSubmit} className="mb-6 space-y-2">
                    <Textarea 
                        placeholder="Viu algum progresso ou problema? Descreva o que viu... (Ex: A obra está parada, a calçada foi concluída, etc.)"
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" size="sm" disabled={!updateText.trim()}>
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            Adicionar Fiscalização
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleGenerateResponse} disabled={isGenerating}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isGenerating ? "A gerar..." : "Gerar Resposta com IA"}
                        </Button>
                    </div>
                </form>

                <div className="space-y-4">
                    {poi.updates && poi.updates.length > 0 ? (
                        poi.updates.map(update => (
                            <div key={update.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                               <p className="whitespace-pre-wrap">{update.text}</p>
                               <p className="text-xs text-muted-foreground mt-2">
                                    Fiscalizado {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })} por um cidadão.
                               </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Ainda não há fiscalizações para esta obra. Seja o primeiro a adicionar uma!
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
            {poi.type === 'sanitation' && <SanitationStatus poi={poi} onPoiStatusChange={onPoiStatusChange} />}
            {poi.type === 'construction' && <ConstructionTimeline poi={poi} onAddUpdate={onAddUpdate} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
