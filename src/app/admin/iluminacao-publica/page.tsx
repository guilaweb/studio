
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lightbulb, LightbulbOff, Zap, CheckCircle, MapPin } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { DataTable } from "@/components/admin/iluminacao-publica/data-table";
import { columns } from "@/components/admin/iluminacao-publica/columns";
import { useRouter } from "next/navigation";
import LightingPoleReport from "@/components/lighting-pole-report";
import PTReport from "@/components/pt-report";
import { PointOfInterestMarker } from "@/components/map-component";
import { GenericPolygonsRenderer } from "@/components/generic-polygons-renderer";
import PointOfInterestDetails from "@/components/point-of-interest-details";

const getDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
    const R = 6371e3; // metres
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

function PublicLightingPage() {
    const { allData, loading, addPoint, updatePointDetails, updatePointStatus, deletePoint } = usePoints();
    const router = useRouter();
    const [sheetOpen, setSheetOpen] = React.useState<null | 'pole' | 'pt'>(null);
    const [poiToEdit, setPoiToEdit] = React.useState<PointOfInterest | null>(null);
    const [selectedAsset, setSelectedAsset] = React.useState<PointOfInterest | null>(null);
    const [nearbyFaults, setNearbyFaults] = React.useState<PointOfInterest[]>([]);

    const lightingAssets = React.useMemo(() => {
        return allData.filter(p => 
            p.type === 'lighting_pole' || 
            p.type === 'pt' ||
            p.type === 'electrical_cabin' ||
            p.type === 'electrical_network_segment'
        );
    }, [allData]);

    const lightingFaultReports = React.useMemo(() => {
        return allData.filter(p => p.title === 'Iluminação pública com defeito');
    }, [allData]);

    const stats = React.useMemo(() => {
        const poles = lightingAssets.filter(p => p.type === 'lighting_pole');
        const working = poles.filter(p => p.status === 'funcional').length;
        const faulty = poles.length - working;
        return {
            totalPoles: poles.length,
            workingPoles: working,
            faultyPoles: faulty,
            totalPTs: lightingAssets.filter(p => p.type === 'pt').length,
        }
    }, [lightingAssets]);
    
    const handleSelectAsset = (asset: PointOfInterest) => {
        setSelectedAsset(asset);
        // Find nearby faults that haven't been assigned yet
        const faults = lightingFaultReports.filter(fault => 
            !fault.maintenanceId &&
            getDistance(asset.position, fault.position) < 50 // 50 meter radius
        );
        setNearbyFaults(faults);
    }
    
    const handleViewOnMap = (poiId: string) => {
        const asset = lightingAssets.find(p => p.id === poiId);
        if (asset) {
            handleSelectAsset(asset);
        }
    };
    
    const handleEdit = (poi: PointOfInterest) => {
        setPoiToEdit(poi);
        if(poi.type === 'lighting_pole') {
            setSheetOpen('pole');
        } else if (poi.type === 'pt') {
            setSheetOpen('pt');
        }
    }

    const handleSheetClose = () => {
        setSheetOpen(null);
        setPoiToEdit(null);
    };

    if (loading) {
        return <div>A carregar dados de iluminação...</div>;
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
                        Gestão de Iluminação Pública
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6">
                     <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Postes Totais</CardTitle><Lightbulb className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.totalPoles}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Postos de Transformação</CardTitle><Zap className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.totalPTs}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Postes Funcionais</CardTitle><CheckCircle className="h-4 w-4 text-green-500"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.workingPoles}</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Postes Avariados</CardTitle><LightbulbOff className="h-4 w-4 text-red-500"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{stats.faultyPoles}</div></CardContent>
                        </Card>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Cadastro de Ativos de Iluminação</CardTitle>
                            <CardDescription>Pesquise, filtre e gira todos os postes e PTs da rede.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable 
                                columns={columns} 
                                data={lightingAssets} 
                                onViewOnMap={handleViewOnMap}
                                onEdit={handleEdit}
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
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
             <LightingPoleReport
                open={sheetOpen === 'pole'}
                onOpenChange={handleSheetClose}
                onLightingPoleSubmit={poiToEdit ? updatePointDetails : addPoint}
                initialCenter={{ lat: -8.83, lng: 13.23 }}
                poiToEdit={poiToEdit}
            />
            <PTReport
                open={sheetOpen === 'pt'}
                onOpenChange={handleSheetClose}
                onPTSubmit={poiToEdit ? updatePointDetails : addPoint}
                initialCenter={{ lat: -8.83, lng: 13.23 }}
                poiToEdit={poiToEdit}
            />
        </APIProvider>
    );
}

export default withAuth(PublicLightingPage, ['Agente Municipal', 'Administrador']);

