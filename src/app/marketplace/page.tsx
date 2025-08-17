

"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Building, FileText } from "lucide-react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, statusLabelMap } from "@/lib/data";
import PropertySearch, { SearchFilters } from "@/components/marketplace/property-search";
import { useRouter } from "next/navigation";


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
                        Marketplace de Imóveis
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
                            <CardHeader>
                                <CardTitle>Mapa de Imóveis</CardTitle>
                                <CardDescription>
                                    Os resultados da sua pesquisa são destacados no mapa.
                                </CardDescription>
                            </CardHeader>
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
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(MarketplacePage);
