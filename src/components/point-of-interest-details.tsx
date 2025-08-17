

"use client";

import React from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PointOfInterest, PointOfInterestUpdate, statusLabelMap, announcementCategoryMap } from "@/lib/data";
import { Landmark, Construction, Siren, ThumbsUp, ThumbsDown, Trash, ShieldCheck, ShieldAlert, ShieldX, MessageSquarePlus, Wand2, Truck, Camera, CheckCircle, ArrowUp, ArrowRight, ArrowDown, Pencil, Calendar, Droplet, Square, Megaphone, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from 'date-fns';
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
  onEdit: (poi: PointOfInterest) => void;
};

const layerConfig = {
    atm: { label: "Caixa Eletrônico", Icon: Landmark, variant: "default" as const},
    construction: { label: "Obras e Projetos", Icon: Construction, variant: "secondary" as const },
    incident: { label: "Incidente", Icon: Siren, variant: "destructive" as const},
    sanitation: { label: "Ponto de Saneamento", Icon: Trash, variant: "outline" as const},
    water: { label: "Rede de Água", Icon: Droplet, variant: "default" as const },
    land_plot: { label: "Lote de Terreno", Icon: Square, variant: "secondary" as const },
    announcement: { label: "Anúncio", Icon: Megaphone, variant: "default" as const },
};

const priorityConfig = {
    high: { icon: ArrowUp, color: "text-red-500 bg-red-100/50", label: "Alta Prioridade" },
    medium: { icon: ArrowRight, color: "text-yellow-500 bg-yellow-100/50", label: "Média Prioridade" },
    low: { icon: ArrowDown, color: "text-green-500 bg-green-100/50", label: "Baixa Prioridade" },
}

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

const ATMStatus = ({poi, onPoiStatusChange, canUpdate}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange'], canUpdate: boolean}) => {
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
            {canUpdate && (
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'available')}>
                        <ThumbsUp className="mr-2"/> TEM DINHEiro
                    </Button>
                    <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'unavailable')}>
                        <ThumbsDown className="mr-2"/> NÃO TEM DINHEIRO
                    </Button>
                </div>
            )}
        </div>
    )
}

const SanitationTicket = ({poi, onPoiStatusChange, canUpdate}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange'], canUpdate: boolean}) => {
    
    if (poi.type !== 'sanitation') return null;

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
                 {canUpdate && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200" onClick={() => onPoiStatusChange(poi.id, 'in_progress')}>
                            <Truck className="mr-2"/> Em Resolução
                        </Button>
                        <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'collected')}>
                            <CheckCircle className="mr-2"/> Recolhido
                        </Button>
                        <Button variant="outline" className="bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-200" onClick={() => onPoiStatusChange(poi.id, 'full')}>
                            <ShieldAlert className="mr-2"/> CHEIO
                        </Button>
                        <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={() => onPoiStatusChange(poi.id, 'damaged')}>
                            <ShieldX className="mr-2"/> DANIFICADO
                        </Button>
                    </div>
                 )}
             </div>
        </div>
    )
}

const Timeline = ({poi, onAddUpdate}: {poi: PointOfInterest, onAddUpdate: PointOfInterestDetailsProps['onAddUpdate']}) => {
    const [updateText, setUpdateText] = React.useState("");
    const [updatePhoto, setUpdatePhoto] = React.useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { toast } = useToast();
    const { user, profile } = useAuth();
    
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

        const processSubmit = (photoDataUri?: string) => {
            onAddUpdate(poi.id, updateText, photoDataUri);
            clearForm();
        }

        if (updatePhoto) {
            const reader = new FileReader();
            reader.onloadend = () => {
                processSubmit(reader.result as string);
            };
            reader.readAsDataURL(updatePhoto);
        } else {
            processSubmit();
        }
    }

    const handleGenerateResponse = async () => {
        const lastCitizenUpdate = poi.updates?.find(u => u.authorId !== user?.uid);
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
    
    const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';
    const canAddUpdate = user; // Any logged in user can add an update now

    const canGenerateAiResponse = isManager && poi.type === 'construction' && poi.updates && poi.updates.length > 0 && poi.updates[0].authorId !== user?.uid;

    const sortedUpdates = React.useMemo(() => {
        if (!poi.updates) return [];
        return [...poi.updates].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [poi.updates]);

    return (
        <div className="mt-4">
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-4">Linha do Tempo e Comentários</h3>
                
                 { canAddUpdate && (
                    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                        <Textarea 
                            placeholder={isManager ? "Escreva uma resposta oficial ou adicione uma atualização sobre o progresso..." : "Tem alguma dúvida? Deixe aqui o seu comentário..."}
                            value={updateText}
                            onChange={(e) => setUpdateText(e.target.value)}
                        />
                         <div>
                            <Label htmlFor="update-photo" className="text-sm font-medium">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <Camera className="h-4 w-4" />
                                    Anexar Fotografia (Opcional)
                                </div>
                            </Label>
                            <Input id="update-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 h-auto p-1"/>
                        </div>
                        {photoPreview && <Image src={photoPreview} alt="Pré-visualização da fotografia" width={100} height={100} className="rounded-md object-cover" />}

                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm" disabled={!updateText.trim()}>
                                <MessageSquarePlus className="mr-2 h-4 w-4" />
                                Adicionar Comentário
                            </Button>
                             {canGenerateAiResponse && (
                                <Button type="button" size="sm" variant="outline" onClick={handleGenerateResponse} disabled={isGenerating}>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    {isGenerating ? "A gerar..." : "Gerar Resposta com IA"}
                                </Button>
                             )}
                        </div>
                    </form>
                 )}

                <div className="space-y-4">
                    {sortedUpdates.length > 0 ? (
                        sortedUpdates.map((update, index) => {
                            const isOriginalReport = index === 0;
                            return (
                                <div key={update.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                                   {isOriginalReport ? (
                                        <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                           {`Reportado por ${update.authorDisplayName || 'um cidadão'}`}
                                        </p>
                                   ) : (
                                        <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                            Comentário de {update.authorDisplayName || 'um utilizador'}
                                        </p>
                                   )}
                                   <p className="whitespace-pre-wrap">{update.text}</p>
                                   {update.photoDataUri && (
                                        <div className="mt-2">
                                            <a href={update.photoDataUri} target="_blank" rel="noopener noreferrer">
                                                <Image src={update.photoDataUri} alt="Prova de execução ou foto do incidente" width={200} height={150} className="rounded-md object-cover" />
                                            </a>
                                        </div>
                                   )}
                                   <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })}
                                   </p>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                           Ainda não há comentários ou atualizações.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

const LandPlotDetails = ({ poi }: { poi: PointOfInterest }) => {
    if (poi.type !== 'land_plot') return null;

    const usageTypeMap: Record<string, string> = {
        residential: "Residencial",
        commercial: "Comercial",
        industrial: "Industrial",
        mixed: "Misto",
        other: "Outro",
    }

    return (
        <div className="space-y-4">
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Detalhes do Lote</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Estado</p>
                        <p className="font-medium">{poi.status ? statusLabelMap[poi.status] : "N/A"}</p>
                    </div>
                     {poi.plotNumber && (
                        <div>
                            <p className="text-muted-foreground">Nº do Lote</p>
                            <p className="font-medium">{poi.plotNumber}</p>
                        </div>
                    )}
                    {poi.registrationCode && (
                        <div>
                            <p className="text-muted-foreground">Registo Predial</p>
                            <p className="font-medium">{poi.registrationCode}</p>
                        </div>
                    )}
                    {poi.usageType && (
                        <div>
                            <p className="text-muted-foreground">Uso Permitido</p>
                            <p className="font-medium">{usageTypeMap[poi.usageType]}</p>
                        </div>
                    )}
                    {poi.maxHeight !== undefined && (
                        <div>
                            <p className="text-muted-foreground">Altura Máx. (Pisos)</p>
                            <p className="font-medium">{poi.maxHeight}</p>
                        </div>
                    )}
                    {poi.buildingRatio !== undefined && (
                         <div>
                            <p className="text-muted-foreground">Índice Construção</p>
                            <p className="font-medium">{poi.buildingRatio}%</p>
                        </div>
                    )}
                </div>
                {poi.zoningInfo && (
                    <div className="mt-4">
                        <p className="text-muted-foreground text-sm">Notas de Zoneamento</p>
                        <p className="text-sm font-medium whitespace-pre-wrap">{poi.zoningInfo}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function PointOfInterestDetails({ poi, open, onOpenChange, onPoiStatusChange, onAddUpdate, onEdit }: PointOfInterestDetailsProps) {
  const { user, profile } = useAuth();
  
  if (!poi) return null;

  const config = layerConfig[poi.type];
  const priorityInfo = poi.priority ? priorityConfig[poi.priority] : null;
  const showTimeline = ['construction', 'incident', 'sanitation', 'atm', 'water', 'land_plot', 'announcement'].includes(poi.type);
  const isOwner = poi.authorId === user?.uid;
  const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';

  let canEdit = false;
  switch (poi.type) {
    case 'construction':
    case 'land_plot':
    case 'atm':
        canEdit = isOwner || isManager;
        break;
    case 'incident':
        canEdit = isOwner;
        break;
    case 'announcement':
        canEdit = isManager;
        break;
    default:
        canEdit = false;
  }


  const incidentDate = poi.incidentDate || poi.lastReported;


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
                <Badge variant={config.variant} className="mb-2">{config.label}</Badge>
                <SheetTitle className="text-2xl">{poi.title}</SheetTitle>
                 {priorityInfo && (
                    <div className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold p-2 rounded-md ${priorityInfo.color}`}>
                       <priorityInfo.icon className="h-4 w-4" />
                       <span>{priorityInfo.label}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-end gap-2">
                <config.Icon className="h-10 w-10 text-muted-foreground" />
                {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(poi)}>
                        <Pencil className="mr-2 h-3 w-3"/>
                        Editar
                    </Button>
                )}
            </div>
          </div>
        </SheetHeader>
        <div className="space-y-4">
            {(poi.type === 'construction' || poi.type === 'announcement') && poi.startDate && poi.endDate && (
                 <div className="flex items-center text-sm text-muted-foreground">
                   <Calendar className="mr-2 h-4 w-4" />
                   <span>{format(new Date(poi.startDate), "dd/MM/yy", { locale: pt })} - {format(new Date(poi.endDate), "dd/MM/yy", { locale: pt })}</span>
                </div>
            )}
             {poi.type === 'announcement' && poi.announcementCategory && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Tags className="mr-2 h-4 w-4" />
                    <span>Categoria: {announcementCategoryMap[poi.announcementCategory]}</span>
                </div>
            )}
            {poi.type !== 'construction' && poi.type !== 'land_plot' && poi.type !== 'announcement' && incidentDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                   <Calendar className="mr-2 h-4 w-4" />
                   <span>Ocorrido em: {format(new Date(incidentDate), "PPP", { locale: pt })}</span>
                </div>
            )}
            {poi.type !== 'land_plot' && (
                <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{poi.description}</p>
                </div>
            )}
             {poi.type !== 'land_plot' && poi.type !== 'announcement' && (
                <div>
                    <h3 className="font-semibold mb-2">Localização (Centroide)</h3>
                    <p className="text-muted-foreground">{`Lat: ${poi.position.lat.toFixed(6)}, Lng: ${poi.position.lng.toFixed(6)}`}</p>
                </div>
             )}
            {poi.type === 'incident' && <IncidentTags description={poi.description} />}
            
            {poi.type === 'atm' && <ATMStatus poi={poi} onPoiStatusChange={onPoiStatusChange} canUpdate={!!user} />}
            
            {poi.type === 'sanitation' && <SanitationTicket poi={poi} onPoiStatusChange={onPoiStatusChange} canUpdate={!!user} />}
            
            {poi.type === 'land_plot' && <LandPlotDetails poi={poi} />}

            {showTimeline && (
                <Timeline 
                    poi={poi} 
                    onAddUpdate={onAddUpdate}
                />
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
