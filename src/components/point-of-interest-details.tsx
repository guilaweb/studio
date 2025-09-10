
"use client";

import React from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PointOfInterest, PointOfInterestUpdate, statusLabelMap, announcementCategoryMap, QueueTime, PointOfInterestStatus } from "@/lib/data";
import { Landmark, Construction, Siren, ThumbsUp, ThumbsDown, Trash, ShieldCheck, ShieldAlert, ShieldX, MessageSquarePlus, Wand2, Truck, Camera, CheckCircle, ArrowUp, ArrowRight, ArrowDown, Pencil, Calendar, Droplet, Square, Megaphone, Tags, Compass, Clock, BellRing, Fence, Waypoints, Trees, ExternalLink, FileText, Trash2, Droplets, Share2, Package, ScanLine, ClipboardCheck, MapPin, Loader2, GitBranch, Gauge, Thermometer, FlaskConical, Waves, Hospital, BedDouble, Stethoscope, HeartPulse, Fuel, HardHat, Lightbulb, Zap, Wrench } from "lucide-react";
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
import Link from "next/link";
import { usePoints } from "@/hooks/use-points";
import DeleteConfirmationDialog from "./delete-confirmation-dialog";
import AtmNoteReport from "./atm-note-report";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import Timeline from "./timeline";
import StreetViewPanorama from "./street-view-panorama";
import FuelAvailabilityReport from "./fuel-availability-report";

type PointOfInterestDetailsProps = {
  poi: PointOfInterest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPoiStatusChange: (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime, availableFuels?: string[]) => void;
  onAddUpdate: (pointId: string, updateText: string, photoDataUri?: string) => void;
  onEdit: (poi: PointOfInterest, mode?: 'edit' | 'divide') => void;
};

const layerConfig = {
    atm: { label: "Caixa Eletrônico", Icon: Landmark, variant: "default" as const},
    construction: { label: "Obras e Projetos", Icon: Construction, variant: "secondary" as const },
    incident: { label: "Incidente", Icon: Siren, variant: "destructive" as const},
    sanitation: { label: "Ponto de Saneamento", Icon: Trash, variant: "outline" as const},
    water: { label: "Rede de Água", Icon: Droplet, variant: "default" as const },
    land_plot: { label: "Lote de Terreno", Icon: Square, variant: "secondary" as const },
    announcement: { label: "Anúncio", Icon: Megaphone, variant: "default" as const },
    water_resource: { label: "Recurso Hídrico", Icon: Droplets, variant: "default" as const },
    croqui: { label: "Croqui de Localização", Icon: Share2, variant: "default" as const },
    fuel_station: { label: "Posto de Combustível", Icon: Fuel, variant: "default" as const },
    health_unit: { label: "Unidade Sanitária", Icon: Hospital, variant: "default" as const },
    lighting_pole: { label: "Poste de Iluminação", Icon: Lightbulb, variant: "default" as const },
    pt: { label: "Posto de Transformação", Icon: Zap, variant: "default" as const },
    electrical_cabin: { label: "Cabine Elétrica", Icon: HardHat, variant: "default" as const },
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
    const { toast } = useToast();
    const [noteReportOpen, setNoteReportOpen] = React.useState(false);

    if (poi.type !== 'atm') return null;

    const getStatusBadge = () => {
        if (poi.status === 'available') return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Com Dinheiro</Badge>
        if (poi.status === 'unavailable') return <Badge variant="destructive">Sem Dinheiro</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    const handleNotifyClick = () => {
        toast({
            title: "Notificação Ativada!",
            description: "Iremos notificá-lo assim que a comunidade reportar que este ATM tem dinheiro.",
        });
    };

    const handleConfirmAvailable = (notes: number[], queueTime?: QueueTime) => {
        const updateText = `Reportou como "Com Dinheiro".`;
        onPoiStatusChange(poi.id, 'available', updateText, notes, queueTime);
    }
    
    const handleConfirmUnavailable = () => {
        const updateText = `Reportou como "Sem Dinheiro".`;
        onPoiStatusChange(poi.id, 'unavailable', updateText);
    }

    return (
        <>
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Estado do ATM</h3>
                <div className="flex items-center justify-between mb-4">
                    {getStatusBadge()}
                    {getLastReportedTime(poi.lastReported)}
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {poi.status === 'unavailable' ? (
                        <Button variant="outline" className="w-full" onClick={handleNotifyClick}>
                            <BellRing className="mr-2 h-4 w-4" /> Avise-me Quando Tiver Dinheiro
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/atm/${poi.id}`}>
                                <Clock className="mr-2 h-4 w-4" /> Ver Histórico de Atividade
                            </Link>
                        </Button>
                    )}
                    {canUpdate && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => setNoteReportOpen(true)}>
                                <ThumbsUp className="mr-2"/> TEM
                            </Button>
                            <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={handleConfirmUnavailable}>
                                <ThumbsDown className="mr-2"/> NÃO TEM
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <AtmNoteReport
                open={noteReportOpen}
                onOpenChange={setNoteReportOpen}
                onConfirm={handleConfirmAvailable}
            />
        </>
    )
}

const FuelStationStatus = ({poi, onPoiStatusChange, canUpdate}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange'], canUpdate: boolean}) => {
    const { toast } = useToast();
    const [reportOpen, setReportOpen] = React.useState(false);

    if (poi.type !== 'fuel_station') return null;

    const getStatusBadge = () => {
        if (poi.status === 'available') return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Com Combustível</Badge>
        if (poi.status === 'unavailable') return <Badge variant="destructive">Sem Combustível</Badge>
        return <Badge variant="secondary">Não Reportado</Badge>
    }

    const handleNotifyClick = () => {
        toast({
            title: "Notificação Ativada!",
            description: "Iremos notificá-lo assim que a comunidade reportar que este posto tem combustível.",
        });
    };

    const handleConfirmAvailable = (fuels: string[], queueTime?: QueueTime) => {
        onPoiStatusChange(poi.id, 'available', 'Reportou como "Com Combustível"', undefined, queueTime, fuels);
    }
    
    const handleConfirmUnavailable = () => {
        onPoiStatusChange(poi.id, 'unavailable', 'Reportou como "Sem Combustível"');
    }

    return (
        <>
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Estado do Posto</h3>
                <div className="flex items-center justify-between mb-4">
                    {getStatusBadge()}
                    {getLastReportedTime(poi.lastReported)}
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {poi.status === 'unavailable' ? (
                        <Button variant="outline" className="w-full" onClick={handleNotifyClick}>
                            <BellRing className="mr-2 h-4 w-4" /> Avise-me Quando Tiver
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/posto/${poi.id}`}>
                                <Clock className="mr-2 h-4 w-4" /> Ver Histórico de Atividade
                            </Link>
                        </Button>
                    )}
                    {canUpdate && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => setReportOpen(true)}>
                                <ThumbsUp className="mr-2"/> TEM
                            </Button>
                            <Button variant="outline" className="bg-red-100 border-red-500 text-red-700 hover:bg-red-200" onClick={handleConfirmUnavailable}>
                                <ThumbsDown className="mr-2"/> NÃO TEM
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <FuelAvailabilityReport
                open={reportOpen}
                onOpenChange={setReportOpen}
                onConfirm={handleConfirmAvailable}
            />
        </>
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
    };

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

const IncidentTicket = ({poi, onPoiStatusChange, canUpdate}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange'], canUpdate: boolean}) => {
    
    if (poi.type !== 'incident' && poi.type !== 'water') return null;

    const getStatusBadge = () => {
        if (poi.status === 'resolved') return <Badge className="bg-green-500 hover:bg-green-600">Resolvido</Badge>
        if (poi.status === 'in_progress') return <Badge className="bg-blue-500 hover:bg-blue-600">Em Resolução</Badge>
        return <Badge variant="secondary">Pendente</Badge>
    }

    return (
        <div className="mt-4 space-y-4">
             <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Estado do Reporte</h3>
                <div className="flex items-center justify-between mb-4">
                    {getStatusBadge()}
                    {getLastReportedTime(poi.lastReported)}
                </div>
                 {canUpdate && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200" onClick={() => onPoiStatusChange(poi.id, 'in_progress')}>
                            <Truck className="mr-2"/> Em Resolução
                        </Button>
                        <Button variant="outline" className="bg-green-100 border-green-500 text-green-700 hover:bg-green-200" onClick={() => onPoiStatusChange(poi.id, 'resolved')}>
                            <CheckCircle className="mr-2"/> Marcar como Resolvido
                        </Button>
                    </div>
                 )}
             </div>
        </div>
    )
}


const CommunityWaterMonitor = ({poi, onPoiStatusChange, canUpdate}: {poi: PointOfInterest, onPoiStatusChange: PointOfInterestDetailsProps['onPoiStatusChange'], canUpdate: boolean}) => {
    
    if (poi.type !== 'water_resource') return null;
    
    const [level, setLevel] = React.useState<PointOfInterestStatus | null>(null);

    const getStatusBadge = () => {
        if (!poi.status || !['level_low', 'level_normal', 'level_flood'].includes(poi.status)) {
            return <Badge variant="secondary">Sem dados comunitários</Badge>
        }
        return <Badge variant={poi.status === 'level_flood' ? 'destructive' : 'default'}>{statusLabelMap[poi.status]}</Badge>;
    }
    
    if (!canUpdate) return null;

    return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
             <h3 className="font-semibold mb-2">Monitor Comunitário de Nível</h3>
             <div className="flex items-center justify-between mb-4">
                {getStatusBadge()}
                {getLastReportedTime(poi.lastReported)}
            </div>
             <p className="text-xs text-muted-foreground mb-2">Se está perto deste local, ajude a comunidade reportando o nível atual da água.</p>
             <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => onPoiStatusChange(poi.id, 'level_low')}>Baixo</Button>
                <Button variant="outline" onClick={() => onPoiStatusChange(poi.id, 'level_normal')}>Normal</Button>
                <Button variant="destructive" onClick={() => onPoiStatusChange(poi.id, 'level_flood')}>Cheia</Button>
            </div>
        </div>
    )
}

const LandPlotDetails = ({ plot }: { plot: PointOfInterest | null }) => {
    if (!plot) return null;

    const usageTypeMap: Record<string, string> = {
        residential: "Residencial",
        commercial: "Comercial",
        industrial: "Industrial",
        mixed: "Misto",
        other: "Outro",
    }
    
    const hasZoningInfo = plot.usageType || plot.maxHeight !== undefined || plot.buildingRatio !== undefined;
    const hasLoteamentoInfo = plot.minLotArea !== undefined || plot.roadCession !== undefined || plot.greenSpaceCession !== undefined;

    return (
        <div className="space-y-4">
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Detalhes do Lote</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Estado</p>
                        <p className="font-medium">{plot.status ? statusLabelMap[plot.status] : "N/A"}</p>
                    </div>
                     {plot.plotNumber && (
                        <div>
                            <p className="text-muted-foreground">Nº do Lote</p>
                            <p className="font-medium">{plot.plotNumber}</p>
                        </div>
                    )}
                    {plot.registrationCode && (
                        <div>
                            <p className="text-muted-foreground">Registo Predial</p>
                            <p className="font-medium">{plot.registrationCode}</p>
                        </div>
                    )}
                </div>
                {plot.zoningInfo && (
                    <div className="mt-4">
                        <p className="text-muted-foreground text-sm">Notas Gerais</p>
                        <p className="text-sm font-medium whitespace-pre-wrap">{plot.zoningInfo}</p>
                    </div>
                )}
            </div>

            {hasZoningInfo && (
                 <>
                    <Separator />
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Informação de Zoneamento</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             {plot.usageType && (
                                <div>
                                    <p className="text-muted-foreground">Uso Permitido</p>
                                    <p className="font-medium">{usageTypeMap[plot.usageType]}</p>
                                </div>
                            )}
                            {plot.maxHeight !== undefined && (
                                <div>
                                    <p className="text-muted-foreground">Altura Máx. (Pisos)</p>
                                    <p className="font-medium">{plot.maxHeight}</p>
                                </div>
                            )}
                            {plot.buildingRatio !== undefined && (
                                 <div>
                                    <p className="text-muted-foreground">Índice Construção</p>
                                    <p className="font-medium">{plot.buildingRatio}%</p>
                                </div>
                            )}
                        </div>
                    </div>
                 </>
            )}
             {hasLoteamentoInfo && (
                 <>
                    <Separator />
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Regras de Loteamento</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             {plot.minLotArea !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Fence className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="text-muted-foreground">Área Mín. Lote</p>
                                        <p className="font-medium">{plot.minLotArea} m²</p>
                                    </div>
                                </div>
                            )}
                            {plot.roadCession !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Waypoints className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="text-muted-foreground">Cedência para Vias</p>
                                        <p className="font-medium">{plot.roadCession}%</p>
                                    </div>
                                </div>
                            )}
                            {plot.greenSpaceCession !== undefined && (
                                 <div className="flex items-center gap-2">
                                    <Trees className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="text-muted-foreground">Cedência p/ Esp. Verdes</p>
                                        <p className="font-medium">{plot.greenSpaceCession}%</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 </>
            )}
        </div>
    );
};


const DocumentList = ({poi} : {poi: PointOfInterest}) => {
    if (poi.type !== 'construction' || !poi.files || poi.files.length === 0) {
        return null;
    }
    
    return (
         <>
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Documentos do Projeto</h3>
                 <div className="space-y-2">
                    {poi.files.map((file, index) => (
                        <a 
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/50 hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                    ))}
                </div>
            </div>
        </>
    )
}

const SensorDataDetails = ({ poi }: { poi: PointOfInterest }) => {
    if (poi.type !== 'water_resource' || !poi.customData || Object.keys(poi.customData).length === 0) {
        return null;
    }

    const getStatus = (key: string, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return { text: 'N/A', color: 'text-muted-foreground' };

        if (key.toLowerCase() === 'ph') {
            if (numValue < 6 || numValue > 8.5) return { text: 'Crítico', color: 'text-red-500' };
            if (numValue < 6.5 || numValue > 8) return { text: 'Alerta', color: 'text-yellow-500' };
            return { text: 'Normal', color: 'text-green-500' };
        }
        // Add more rules for other parameters like Nível, Caudal, etc.
        return { text: 'Normal', color: 'text-green-500' };
    };

    const iconMap: { [key: string]: React.ElementType } = {
        'ph': FlaskConical,
        'nível': Gauge,
        'temperatura': Thermometer,
        'caudal': Droplets,
    };

    return (
        <>
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Dados do Sensor (Em Tempo Real)</h3>
                <div className="space-y-3">
                    {Object.entries(poi.customData).map(([key, value]) => {
                        const status = getStatus(key, value);
                        const Icon = iconMap[key.toLowerCase()] || CheckCircle;
                        return (
                            <div key={key} className="flex justify-between items-center text-sm p-3 rounded-md bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="capitalize">{key}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{value}</span>
                                    <Badge variant={status.color === 'text-red-500' ? 'destructive' : 'secondary'} className={status.color}>{status.text}</Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

const HealthUnitDetails = ({ poi }: { poi: PointOfInterest }) => {
    if (poi.type !== 'health_unit') return null;

    const hasServices = poi.healthServices && poi.healthServices.length > 0;
    const hasCapacity = poi.capacity && Object.values(poi.capacity).some(v => v !== undefined && v !== null);

    if (!hasServices && !hasCapacity) return null;

    return (
         <>
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Detalhes da Unidade</h3>
                {hasCapacity && (
                     <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        {poi.capacity?.beds && (
                            <div className="p-2 bg-muted/50 rounded-md">
                                <p className="font-bold text-lg">{poi.capacity.beds}</p>
                                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><BedDouble className="h-3 w-3"/> Camas</p>
                            </div>
                        )}
                         {poi.capacity?.icu_beds && (
                            <div className="p-2 bg-muted/50 rounded-md">
                                <p className="font-bold text-lg">{poi.capacity.icu_beds}</p>
                                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><HeartPulse className="h-3 w-3"/> UCI</p>
                            </div>
                        )}
                         {poi.capacity?.daily_capacity && (
                            <div className="p-2 bg-muted/50 rounded-md">
                                <p className="font-bold text-lg">{poi.capacity.daily_capacity}</p>
                                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Users className="h-3 w-3"/> Atend./Dia</p>
                            </div>
                        )}
                    </div>
                )}
                 {hasServices && (
                    <div>
                        <h4 className="font-medium text-sm mb-2">Serviços e Especialidades</h4>
                        <div className="flex flex-wrap gap-2">
                            {poi.healthServices?.map((service, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1.5">
                                    <Stethoscope className="h-3.5 w-3.5" />
                                    {service}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

const TechnicalDetails = ({ poi }: { poi: PointOfInterest }) => {
    if (!['lighting_pole', 'pt'].includes(poi.type)) {
        return null;
    }
    return (
        <>
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Detalhes Técnicos</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID do Ativo</span>
                        <span className="font-mono">{poi.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado Operacional</span>
                        <span className="font-medium">{statusLabelMap[poi.status!] || 'N/A'}</span>
                    </div>
                    {poi.lampType && <div className="flex justify-between"><span className="text-muted-foreground">Tipo de Lâmpada</span><span>{poi.lampType}</span></div>}
                    {poi.poleType && <div className="flex justify-between"><span className="text-muted-foreground">Tipo de Poste</span><span>{poi.poleType}</span></div>}
                    {poi.poleHeight && <div className="flex justify-between"><span className="text-muted-foreground">Altura</span><span>{poi.poleHeight}m</span></div>}
                    {poi.customData?.capacity && <div className="flex justify-between"><span className="text-muted-foreground">Capacidade</span><span>{poi.customData.capacity} kVA</span></div>}
                 </div>
            </div>
        </>
    );
};


const labelMap: Record<string, string> = {
    requesterName: "Requerente",
    province: "Província",
    municipality: "Município",
    technicianName: "Técnico Responsável",
    technicianId: "Nº Ordem do Técnico",
    surveyDate: "Data do Levantamento",
};

const CustomDataDetails = ({ poi }: { poi: PointOfInterest }) => {
    // Hide for water resources as they have a dedicated component now
    if (!poi.customData || Object.keys(poi.customData).length === 0 || poi.type === 'water_resource' || poi.type === 'pt') {
        return null;
    }

    return (
        <>
            <Separator />
            <div className="py-4">
                <h3 className="font-semibold mb-2">Dados do Ativo</h3>
                <div className="space-y-2">
                    {Object.entries(poi.customData).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{labelMap[key] || key}</span>
                            <span className="font-medium">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

const CroquiActions = ({ poi }: { poi: PointOfInterest }) => {
    if (poi.type !== 'croqui') return null;
    const { toast } = useToast();
    const shareUrl = `${window.location.origin}/croquis/${poi.id}`;

    const handleShare = (platform: 'whatsapp' | 'facebook' | 'copy') => {
        const text = `Veja como chegar a "${poi.title}" através deste croqui da MUNITU: ${shareUrl}`;
        switch (platform) {
            case 'whatsapp':
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
                break;
            case 'facebook':
                 window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                toast({title: 'Link do Croqui Copiado!'});
                break;
        }
    };

    return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Partilhar Croqui</h3>
            <div className="space-y-2">
                <Input value={shareUrl} readOnly />
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare('copy')}>Copiar Link</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare('whatsapp')}>WhatsApp</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare('facebook')}>Facebook</Button>
                </div>
            </div>
        </div>
    );
};


export default function PointOfInterestDetails({ poi, open, onOpenChange, onPoiStatusChange, onAddUpdate, onEdit }: PointOfInterestDetailsProps) {
  const { user, profile } = useAuth();
  const { allData, deletePoint } = usePoints();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const landPlotForCroqui = React.useMemo(() => {
    if (poi?.type === 'croqui' && poi.landPlotId) {
        return allData.find(p => p.id === poi.landPlotId) || null;
    }
    return null;
  }, [poi, allData]);


  if (!poi) return null;

  const config = layerConfig[poi.type as keyof typeof layerConfig];
  const priorityInfo = poi.priority ? priorityConfig[poi.priority] : null;
  const showTimeline = ['construction', 'incident', 'sanitation', 'atm', 'water', 'land_plot', 'announcement', 'water_resource', 'croqui', 'health_unit', 'lighting_pole', 'pt'].includes(poi.type);
  const isAdmin = profile?.role === 'Administrador';
  const isAgentOrAdmin = profile?.role === 'Agente Municipal' || isAdmin;
  const isOwner = poi.authorId === user?.uid;
  
  let canEdit = false;
  let canDivide = false;
  // Allow editing for owners or managers, with specific restrictions
  if (user && profile) {
      if (isAgentOrAdmin) {
        // Managers can edit anything except incidents they don't own.
        if (poi.type === 'incident') {
            canEdit = isOwner;
        } else {
            canEdit = true;
        }
      } else {
        // Regular users can only edit what they own, and only specific types.
        canEdit = isOwner && (poi.type === 'incident' || poi.type === 'atm' || poi.type === 'construction' || poi.type === 'land_plot' || poi.type === 'announcement' || poi.type === 'croqui');
      }
      canDivide = isOwner && (poi.type === 'croqui' || poi.type === 'land_plot');
  }
  
   const handlePoiStatusChange = (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime, availableFuels?: string[]) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para atualizar o estado.",
        });
        return;
    }
    
    const text = updateText || `Estado atualizado para: ${statusLabelMap[status!] || status}`;

    onPoiStatusChange(pointId, status, text, availableNotes, queueTime, availableFuels);
    
    toast({
        title: "Estado atualizado!",
        description: "Obrigado pela sua contribuição.",
    })
  };

  const handleDelete = () => {
    if (!isAdmin && !isOwner) {
        return; // Security check
    }
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    await deletePoint(poi.id);
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
  }


  const incidentDate = poi.incidentDate || poi.lastReported;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${poi.position.lat},${poi.position.lng}`;


  return (
    <>
        <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="text-left mb-6">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <Badge variant={config?.variant || 'default'} className="mb-2">{config?.label || 'Ponto de Interesse'}</Badge>
                    <SheetTitle className="text-2xl">{poi.title}</SheetTitle>
                    {priorityInfo && (
                        <div className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold p-2 rounded-md ${priorityInfo.color}`}>
                        <priorityInfo.icon className="h-4 w-4" />
                        <span>{priorityInfo.label}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {config?.Icon && <config.Icon className="h-10 w-10 text-muted-foreground" />}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={directionsUrl} target="_blank" rel="noopener noreferrer">
                                <Compass className="mr-2 h-3 w-3"/>
                                Obter Direções
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(poi)}>
                                <Pencil className="mr-2 h-3 w-3"/>
                                Editar
                            </Button>
                        )}
                        {canDivide && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(poi, 'divide')}>
                                <GitBranch className="mr-2 h-3 w-3"/>
                                Dividir
                            </Button>
                        )}
                         {poi.type === 'croqui' && (
                             <Button variant="outline" size="sm" onClick={() => {
                                 navigator.clipboard.writeText(`${window.location.origin}/croquis/${poi.id}`);
                                 toast({title: 'Link do Croqui Copiado!'});
                             }}>
                                <Share2 className="mr-2 h-3 w-3"/>
                                Partilhar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            </SheetHeader>
            <div className="space-y-4">
                <StreetViewPanorama location={poi.position} />

                 <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{poi.position.lat.toFixed(5)}, {poi.position.lng.toFixed(5)}</span>
                </div>
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
                
                {poi.type === 'incident' && <IncidentTags description={poi.description} />}
                
                <IncidentTicket poi={poi} onPoiStatusChange={handlePoiStatusChange} canUpdate={isAgentOrAdmin} />

                {poi.type === 'atm' && <ATMStatus poi={poi} onPoiStatusChange={handlePoiStatusChange} canUpdate={!!user} />}
                
                {poi.type === 'fuel_station' && <FuelStationStatus poi={poi} onPoiStatusChange={handlePoiStatusChange} canUpdate={!!user} />}

                {poi.type === 'sanitation' && <SanitationTicket poi={poi} onPoiStatusChange={handlePoiStatusChange} canUpdate={isAgentOrAdmin} />}
                
                <LandPlotDetails plot={poi.type === 'land_plot' ? poi : landPlotForCroqui} />
                
                <HealthUnitDetails poi={poi} />

                {poi.type === 'construction' && <DocumentList poi={poi} />}

                {poi.type === 'water_resource' && <SensorDataDetails poi={poi} />}

                <TechnicalDetails poi={poi} />
                
                <CommunityWaterMonitor poi={poi} onPoiStatusChange={handlePoiStatusChange} canUpdate={!!user} />

                <CustomDataDetails poi={poi} />
                
                {poi.type === 'croqui' && <CroquiActions poi={poi} />}

                {showTimeline && (
                    <Timeline 
                        poi={poi} 
                        onAddUpdate={onAddUpdate}
                    />
                )}
                {(isAdmin || isOwner) && (
                     <>
                        <Separator />
                        <div className="pt-4">
                           <Button variant="destructive" className="w-full" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Eliminar Reporte
                           </Button>
                           <p className="text-xs text-muted-foreground mt-2 text-center">Esta ação é irreversível e irá remover permanentemente o ponto de interesse do mapa.</p>
                        </div>
                    </>
                )}
            </div>
        </SheetContent>
        </Sheet>
        <DeleteConfirmationDialog 
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDelete}
        />
    </>
  );
}
