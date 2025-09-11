
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, TreePine, Fence, Trees } from "lucide-react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { columns } from "./columns";
import { DataTable } from "@/components/admin/areas-verdes/data-table"; 
import GreenAreaReport from "@/components/green-area-report";
import MapComponent from "@/components/map-component";
import PointOfInterestDetails from "@/components/point-of-interest-details";

function GreenAreasPage() {
    const { allData, loading, addPoint, updatePointDetails, updatePointStatus, addUpdateToPoint, deletePoint } = usePoints();
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [poiToEdit, setPoiToEdit] = React.useState<PointOfInterest | null>(null);
    const [selectedAsset, setSelectedAsset] = React.useState<PointOfInterest | null>(null);
    const [mapCenter, setMapCenter] = React.useState({ lat: -12.5, lng: 18.5 });
    const [zoom, setZoom] = React.useState(6);

    const greenAreas = React.useMemo(() => {
        return allData.filter(p => p.type === 'green_area');
    }, [allData]);

    const stats = React.useMemo(() => {
        const parks = greenAreas.filter(p => p.greenAreaType === 'park').length;
        const squares = greenAreas.filter(p => p.greenAreaType === 'square').length;
        const trees = greenAreas.filter(p => p.greenAreaType === 'tree').length;
        return { parks, squares, trees, total: greenAreas.length };
    }, [greenAreas]);

    const handleEdit = (poi: PointOfInterest) => {
        setPoiToEdit(poi);
        setSheetOpen(true);
    };

    const handleViewOnMap = (poiId: string) => {
        const poi = allData.find(p => p.id === poiId);
        if (poi) {
            setMapCenter(poi.position);
            setZoom(17);
            setSelectedAsset(poi);
        }
    };
    
    const handleSheetOpen = (isOpen: boolean) => {
        if (!isOpen) {
            setPoiToEdit(null);
        }
        setSheetOpen(isOpen);
    }
    
     const handleGreenAreaSubmit = (data: any) => {
        addPoint(data);
        setSheetOpen(false);
    }

    const handleGreenAreaEdit = (id: string, data: any) => {
        updatePointDetails(id, data);
        setSheetOpen(false);
    }

    if (loading) {
        return <div>A carregar dados das áreas verdes...</div>;
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Áreas Verdes
                    </h1>
                     <div className="ml-auto">
                        <Button onClick={() => setSheetOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Mapear Nova Área
                        </Button>
                    </div>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6">
                     <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Total de Ativos Verdes</CardTitle><Trees className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Parques Mapeados</CardTitle><Fence className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.parks}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Praças Mapeadas</CardTitle><Fence className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.squares}</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Árvores Mapeadas</CardTitle><TreePine className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.trees}</div></CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Cadastro de Áreas Verdes</CardTitle>
                                <CardDescription>Pesquise, filtre e gira todos os ativos verdes do município.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable 
                                    columns={columns} 
                                    data={greenAreas} 
                                    meta={{ onViewOnMap: handleViewOnMap, onEdit: handleEdit }}
                                />
                            </CardContent>
                        </Card>
                         <Card className="lg:col-span-4">
                            <CardContent className="h-[calc(100vh-22rem)] p-0">
                                 <MapComponent
                                    activeLayers={{ green_area: true }}
                                    data={greenAreas}
                                    center={mapCenter}
                                    zoom={zoom}
                                    onCenterChanged={setMapCenter}
                                    onZoomChanged={setZoom}
                                    onMarkerClick={(id) => setSelectedAsset(allData.find(p => p.id === id) || null)}
                                    userPosition={null}
                                    searchedPlace={null}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
             <GreenAreaReport
                open={sheetOpen}
                onOpenChange={handleSheetOpen}
                onGreenAreaSubmit={poiToEdit ? handleGreenAreaEdit : handleGreenAreaSubmit}
                poiToEdit={poiToEdit}
                initialCenter={{ lat: -8.83, lng: 13.23 }}
            />
             {selectedAsset && (
                 <PointOfInterestDetails
                    poi={selectedAsset}
                    open={!!selectedAsset}
                    onOpenChange={(isOpen) => !isOpen && setSelectedAsset(null)}
                    onPoiStatusChange={updatePointStatus}
                    onAddUpdate={addUpdateToPoint}
                    onEdit={handleEdit}
                />
             )}
        </APIProvider>
    );
}

export default withAuth(GreenAreasPage, ['Agente Municipal', 'Administrador']);

    

    