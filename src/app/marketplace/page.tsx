

"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Building, FileText, Home, Shield, ShieldAlert, ShieldCheck, HelpCircle } from "lucide-react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestStatus, propertyTypeLabelMap, statusLabelMap } from "@/lib/data";
import PropertySearch, { SearchFilters } from "@/components/marketplace/property-search";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];


const getPlotColors = (status: PointOfInterest['status']) => {
    switch (status) {
        case 'available':
            return { stroke: '#16a34a', fill: '#22c55e' }; // green
        case 'occupied':
        case 'reserved':
            return { stroke: '#ea580c', fill: '#f97316' }; // orange
        case 'in_dispute':
            return { stroke: '#dc2626', fill: '#ef4444' }; // red
        case 'protected':
            return { stroke: '#155e75', fill: '#0e7490' }; // cyan
        default:
            return { stroke: '#a1a1aa', fill: '#71717a' }; // gray
    }
}


const LandPlotPolygons: React.FC<{
    plots: PointOfInterest[];
    selectedPlotId: string | null;
    onPlotClick: (plotId: string) => void;
}> = ({ plots, selectedPlotId, onPlotClick }) => {
    const map = useMap();
    const [polygons, setPolygons] = React.useState<google.maps.Polygon[]>([]);

    React.useEffect(() => {
        if (!map) return;
        
        polygons.forEach(p => p.setMap(null));

        const newPolygons = plots.map(plot => {
            const isSelected = plot.id === selectedPlotId;
            const colors = getPlotColors(plot.status);

            const poly = new google.maps.Polygon({
                paths: plot.polygon,
                strokeColor: isSelected ? 'hsl(var(--ring))' : colors.stroke,
                strokeOpacity: 0.9,
                strokeWeight: isSelected ? 3 : 2,
                fillColor: isSelected ? colors.fill : colors.fill,
                fillOpacity: isSelected ? 0.6 : 0.35,
                map: map,
            });

            poly.addListener('click', () => {
                onPlotClick(plot.id);
            });
            return poly;
        });

        setPolygons(newPolygons);

        return () => {
            newPolygons.forEach(p => p.setMap(null));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, plots, selectedPlotId]);


    return null;
}

const VerificationSeal = ({ status }: { status: PointOfInterestStatus }) => {
    const sealConfig = {
        verificado_ouro: {
            Icon: ShieldCheck,
            label: "Verificado (Ouro)",
            description: "Propriedade validada com documentos oficiais e sem conflitos geo-espaciais.",
            className: "bg-yellow-400 text-yellow-900 border-yellow-500",
        },
        verificado_prata: {
            Icon: Shield,
            label: "Verificado (Prata)",
            description: "Posse confirmada com base em documentos históricos e/ou validação comunitária.",
             className: "bg-slate-400 text-slate-900 border-slate-500",
        },
        em_verificacao: {
            Icon: ShieldAlert,
            label: "Em Verificação",
            description: "Este imóvel está a ser analisado pelos nossos técnicos.",
            className: "bg-blue-400 text-blue-900 border-blue-500",
        },
        informacao_insuficiente: {
            Icon: HelpCircle,
            label: "Informação Insuficiente",
            description: "A verificação falhou. Por favor, verifique as comunicações e forneça os dados pedidos.",
             className: "bg-red-400 text-red-900 border-red-500",
        },
        default: {
            Icon: HelpCircle,
            label: statusLabelMap[status] || "Privado",
            description: "O estado atual deste imóvel é privado ou não verificado.",
            className: "bg-gray-400 text-gray-900 border-gray-500",
        }
    };

    const config = sealConfig[status as keyof typeof sealConfig] || sealConfig.default;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <div className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2 py-1 rounded-full ${config.className}`}>
                        <config.Icon className="h-3.5 w-3.5" />
                        {config.label}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const PropertyCard = ({ property }: { property: PointOfInterest }) => {
    const mainPhoto = property.updates?.find(u => u.photoDataUri)?.photoDataUri;
    const placeholderImage = "https://placehold.co/600x400.png";

    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <div className="relative h-40 w-full">
                <Image
                    src={mainPhoto || placeholderImage}
                    alt={`Imagem de ${property.title}`}
                    fill={true}
                    style={{objectFit: 'cover'}}
                    data-ai-hint="house exterior"
                />
            </div>
            <CardHeader>
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <CardDescription>
                    {property.propertyType ? propertyTypeLabelMap[property.propertyType] : 'Imóvel'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-primary">
                        {/* Placeholder for price */}
                        A Negociar
                    </div>
                    <VerificationSeal status={property.status || 'Privado'} />
                </div>
            </CardContent>
        </Card>
    );
}

function MarketplacePage() {
    const { allData } = usePoints();
    const [selectedPlot, setSelectedPlot] = React.useState<PointOfInterest | null>(null);
    const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({ area: null, usageType: null, location: '' });
    const router = useRouter();

    const landPlots = React.useMemo(() => allData.filter(p => p.type === 'land_plot' && p.polygon), [allData]);
    
    const filteredLandPlots = React.useMemo(() => {
        return landPlots.filter(plot => {
            const areaMatch = !searchFilters.area || (plot.area && plot.area >= searchFilters.area);
            const usageMatch = !searchFilters.usageType || plot.usageType === searchFilters.usageType;
            const locationMatch = !searchFilters.location || 
                                  (plot.title && plot.title.toLowerCase().includes(searchFilters.location.toLowerCase())) ||
                                  (plot.description && plot.description.toLowerCase().includes(searchFilters.location.toLowerCase()));
            return areaMatch && usageMatch && locationMatch;
        });
    }, [landPlots, searchFilters]);


    const handlePlotSelect = (plotId: string) => {
        const plot = landPlots.find(p => p.id === plotId) || null;
        setSelectedPlot(plot);
        // Maybe in the future this will open a details panel
    };
    
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar ao Mapa</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Marketplace Imobiliário
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                        <PropertySearch onSearch={setSearchFilters} initialFilters={searchFilters} />
                         <Card>
                            <CardContent className="pt-6">
                               <p className="text-xs text-muted-foreground">
                                  Necessita de trabalhar com o Sistema Geodésico Nacional? <Link href="/docs" className="underline font-semibold">Consulte a nossa documentação técnica.</Link>
                               </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                        <Card>
                            <Tabs defaultValue="map">
                                 <CardHeader className="flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Resultados da Pesquisa</CardTitle>
                                        <CardDescription>
                                            {filteredLandPlots.length} imóveis encontrados.
                                        </CardDescription>
                                    </div>
                                    <TabsList>
                                        <TabsTrigger value="map">Mapa</TabsTrigger>
                                        <TabsTrigger value="list">Lista</TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <TabsContent value="map">
                                    <CardContent className="h-[70vh] p-0 relative">
                                        <Map
                                            defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                                            defaultZoom={13}
                                            gestureHandling={'greedy'}
                                            disableDefaultUI={true}
                                            styles={mapStyles}
                                        >
                                            <LandPlotPolygons 
                                                plots={filteredLandPlots}
                                                selectedPlotId={selectedPlot?.id || null}
                                                onPlotClick={handlePlotSelect}
                                            />
                                        </Map>
                                    </CardContent>
                                </TabsContent>
                                <TabsContent value="list">
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredLandPlots.map(plot => (
                                            <PropertyCard key={plot.id} property={plot} />
                                        ))}
                                        </div>
                                         {filteredLandPlots.length === 0 && (
                                            <div className="text-center text-muted-foreground py-16">
                                                <p>Nenhum imóvel encontrado com os filtros atuais.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(MarketplacePage);
