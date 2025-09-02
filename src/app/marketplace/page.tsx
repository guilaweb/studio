

"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import PropertySearch, { SearchFilters } from "@/components/marketplace/property-search";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from "@/components/marketplace/property-card";
import { GenericPolygonsRenderer } from "@/components/generic-polygons-renderer";


function MarketplacePage() {
    const { allData } = usePoints();
    const [selectedPlot, setSelectedPlot] = React.useState<PointOfInterest | null>(null);
    const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({
        location: '',
        area: null,
        usageType: null,
        minPrice: null,
        maxPrice: null,
        bedrooms: null,
        bathrooms: null,
        verification: [],
        taxStatus: false,
    });
    const router = useRouter();

    const landPlots = React.useMemo(() => allData.filter(p => p.type === 'land_plot' && p.polygon), [allData]);
    
    const filteredLandPlots = React.useMemo(() => {
        return landPlots.filter(plot => {
            const { location, area, usageType, minPrice, maxPrice, bedrooms, bathrooms, verification, taxStatus } = searchFilters;
            const locationMatch = !location || 
                                  (plot.title && plot.title.toLowerCase().includes(location.toLowerCase())) ||
                                  (plot.description && plot.description.toLowerCase().includes(location.toLowerCase()));
            const areaMatch = !area || (plot.area && plot.area >= area);
            const usageMatch = !usageType || plot.usageType === usageType;
            const minPriceMatch = !minPrice || (plot.price && plot.price >= minPrice);
            const maxPriceMatch = !maxPrice || (plot.price && plot.price <= maxPrice);
            const bedroomMatch = !bedrooms || (plot.bedrooms && plot.bedrooms >= bedrooms);
            const bathroomMatch = !bathrooms || (plot.bathrooms && plot.bathrooms >= bathrooms);
            const verificationMatch = verification.length === 0 || (plot.status && verification.includes(plot.status));
            const taxStatusMatch = !taxStatus || plot.propertyTaxStatus === 'paid';

            return locationMatch && areaMatch && usageMatch && minPriceMatch && maxPriceMatch && bedroomMatch && bathroomMatch && verificationMatch && taxStatusMatch;
        });
    }, [landPlots, searchFilters]);


    const handlePlotSelect = (plotId: string) => {
        const plot = landPlots.find(p => p.id === plotId) || null;
        setSelectedPlot(plot);
        if (plot) {
             router.push(`/marketplace/${plot.id}`)
        }
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
                                            mapId="marketplace-map"
                                            defaultCenter={{ lat: -12.5, lng: 18.5 }}
                                            defaultZoom={6}
                                            gestureHandling={'greedy'}
                                            disableDefaultUI={true}
                                        >
                                            <GenericPolygonsRenderer 
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
