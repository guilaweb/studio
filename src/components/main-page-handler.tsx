

"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { PointOfInterest, PointOfInterestUpdate, UserProfile } from "@/lib/data";
import { Logo } from "@/components/icons";
import AppHeader from "@/components/app-header";
import MapComponent from "@/components/map-component";
import LayerControls from "@/components/layer-controls";
import IncidentReport from "@/components/incident-report";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Megaphone, Plus } from "lucide-react";
import PointOfInterestDetails from "@/components/point-of-interest-details";
import { usePoints } from "@/hooks/use-points";
import { useSearchParams } from "next/navigation";
import MapSearchBox from "@/components/map-search-box";
import { calculateIncidentPriority } from "@/services/alert-service";
import { detectDuplicate } from "@/ai/flows/detect-duplicate-flow";


export default function MainPageHandler({ userMenu }: { userMenu: React.ReactNode }) {
  const [activeLayers, setActiveLayers] = React.useState({
    atm: true,
    construction: true,
    incident: true,
    sanitation: true,
  });
  const [selectedPoi, setSelectedPoi] = React.useState<PointOfInterest | null>(null);
  const [searchedPlace, setSearchedPlace] = React.useState<google.maps.places.PlaceResult | null>(null);
  const [userPosition, setUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: -12.5,
    lng: 18.5,
  });
  const [zoom, setZoom] = React.useState(5);
  const { allData, addPoint, updatePointStatus, addUpdateToPoint } = usePoints();
  const searchParams = useSearchParams();
  const prevDataRef = React.useRef<PointOfInterest[]>([]);

  const [isIncidentSheetOpen, setIsIncidentSheetOpen] = React.useState(false);


  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  // Real-time notifications effect
  React.useEffect(() => {
    const prevData = prevDataRef.current;
    if (prevData.length === 0) {
        prevDataRef.current = allData;
        return;
    }
    
    const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';

    // Agent/Admin Notifications for high-priority incidents
    if (isManager) {
        const prevIds = new Set(prevData.map(p => p.id));
        const newHighPriorityIncidents = allData.filter(
            p => !prevIds.has(p.id) && p.type === 'incident' && p.priority === 'high'
        );
        newHighPriorityIncidents.forEach(p => {
            toast({
                variant: 'destructive',
                title: 'Alerta de Alta Prioridade!',
                description: `Novo incidente reportado: "${p.title}"`,
            });
        });
    }

    // Citizen notifications for their own reports
    if (user) {
        allData.forEach(newPoi => {
            if (newPoi.authorId !== user.uid) return;

            const oldPoi = prevData.find(p => p.id === newPoi.id);
            if (oldPoi && oldPoi.status !== newPoi.status && newPoi.status) {
                toast({
                    title: 'Atualização do seu Reporte',
                    description: `O estado de "${newPoi.title}" foi atualizado para: ${newPoi.status}`,
                });
            }
        });
    }


    prevDataRef.current = allData;

  }, [allData, user, profile, toast]);


  React.useEffect(() => {
    const poiId = searchParams.get('poi');
    if (poiId) {
      const poi = allData.find(p => p.id === poiId);
      if (poi) {
        setSelectedPoi(poi);
        setMapCenter(poi.position);
        setZoom(16);
      }
    }
  }, [searchParams, allData]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.location) {
      setSearchedPlace(place);
      const newCenter = place.geometry.location.toJSON();
      setMapCenter(newCenter);
      setZoom(16);
      setSelectedPoi(null);
    }
  };


  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(pos);
          setMapCenter(pos);
          setZoom(15);
          toast({
            title: "Localização encontrada",
            description: "O mapa foi centralizado na sua localização atual.",
          });
        },
        () => {
          toast({
            variant: "destructive",
            title: "Erro de localização",
            description: "Não foi possível aceder à sua localização. Verifique as permissões do seu navegador.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Erro de localização",
        description: "A geolocalização não é suportada por este navegador.",
      });
    }
  };

  const handleAddNewIncident = async (
    newIncidentData: Omit<PointOfInterest, 'id' | 'authorId'> & { photoDataUri?: string }, 
    type: PointOfInterest['type'] = 'incident'
  ) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para reportar uma incidência.",
        });
        return;
    }

    setIsIncidentSheetOpen(false);

     const { photoDataUri, ...incidentDetails } = newIncidentData;
    
    // Duplicate detection
    const timeThreshold = 48 * 60 * 60 * 1000; // 48 hours
    const now = new Date().getTime();
    const recentIncidents = allData.filter(p => 
        p.type === type && 
        p.lastReported && 
        (now - new Date(p.lastReported).getTime() < timeThreshold)
    );

    try {
        const duplicateResult = await detectDuplicate({
            newIncident: {
                title: incidentDetails.title,
                description: incidentDetails.description,
                position: incidentDetails.position,
            },
            existingIncidents: recentIncidents,
        });

        if (duplicateResult.isDuplicate && duplicateResult.duplicateOfId) {
            const originalIncidentId = duplicateResult.duplicateOfId;
            const newUpdate: Omit<PointOfInterestUpdate, 'id'> = {
                text: `(Reporte duplicado) ${incidentDetails.description}`,
                authorId: user.uid,
                timestamp: new Date().toISOString(),
                photoDataUri: photoDataUri,
            };
            await addUpdateToPoint(originalIncidentId, newUpdate);
            toast({
                title: "Reporte Agregado!",
                description: "Detectámos que este incidente já tinha sido reportado. A sua contribuição foi adicionada ao reporte original. Obrigado!",
            });
            return;
        }

    } catch(error) {
        console.error("Error detecting duplicate, proceeding to create new incident:", error);
    }
    // End of duplicate detection


    const timestamp = new Date().toISOString();

    const initialUpdate: PointOfInterestUpdate = {
        id: `upd-initial-${Date.now()}`,
        text: incidentDetails.description,
        authorId: user.uid,
        timestamp: timestamp,
    };
    
    if (photoDataUri) {
        initialUpdate.photoDataUri = photoDataUri;
    }

    const incidentToAdd: PointOfInterest = {
      ...incidentDetails,
      id: `${type}-${Date.now()}`,
      type: type,
      priority: type === 'incident' ? calculateIncidentPriority(incidentDetails.title, incidentDetails.description) : undefined,
      authorId: user.uid,
      lastReported: timestamp,
      updates: [initialUpdate]
    };
    
    addPoint(incidentToAdd);

    toast({
      title: "Incidência reportada!",
      description: "Obrigado pela sua contribuição para uma cidade melhor.",
    });

  };

  const handleStartReporting = () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para reportar uma incidência.",
        });
        return;
    }
    setIsIncidentSheetOpen(true);
  };

  const handleMarkerClick = (poiId: string) => {
    const poi = allData.find(p => p.id === poiId) || null;
    setSelectedPoi(poi);
    setSearchedPlace(null);
  };

  const handleDetailsClose = () => {
    setSelectedPoi(null);
  };

  const handlePoiStatusChange = (poiId: string, status: PointOfInterest['status']) => {
    updatePointStatus(poiId, status);
    setSelectedPoi(prevPoi => prevPoi ? { ...prevPoi, status, lastReported: new Date().toISOString() } : null);
    toast({
        title: "Estado atualizado!",
        description: "Obrigado pela sua contribuição.",
    })
  };

  const handleAddUpdate = (poiId: string, updateText: string, photoDataUri?: string) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para adicionar uma atualização.",
        });
        return;
    }

    const newUpdate: Omit<PointOfInterestUpdate, 'id'> = {
        text: updateText,
        authorId: user.uid,
        timestamp: new Date().toISOString(),
    };
    
    if (photoDataUri) {
        newUpdate.photoDataUri = photoDataUri;
    }
    
    addUpdateToPoint(poiId, newUpdate);
    setSelectedPoi(prevPoi => {
      if (!prevPoi) return null;
      const updatedUpdates = [
          {...newUpdate, id: `temp-${Date.now()}`}, 
          ...(prevPoi.updates || [])
      ];
      return { ...prevPoi, updates: updatedUpdates };
    });

    toast({
        title: "Atualização adicionada!",
        description: "A sua fiscalização foi registada. Obrigado!",
    });
  }

  const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';

  return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="h-16 items-center">
              <Link href="/" className="group/logo flex items-center gap-2" aria-label="Cidadão Online">
                <Logo className="size-8 shrink-0 text-primary group-data-[collapsible=icon]:size-6" />
                <div className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                  Cidadão Online
                </div>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <LayerControls activeLayers={activeLayers} onLayerChange={setActiveLayers} />
            </SidebarContent>
            <SidebarFooter className="space-y-2">
              {user && (
                <Button onClick={handleStartReporting} className="hidden md:flex">
                    <Plus className="mr-2 h-4 w-4" />
                    Reportar Incidente
                </Button>
              )}
               {isManager && (
                    <>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Painel Municipal
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/comunicacoes">
                                <Megaphone className="mr-2 h-4 w-4" />
                                Comunicações
                            </Link>
                        </Button>
                    </>
                )}
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-col">
            <AppHeader 
              onLocateClick={handleLocateUser}
              searchBox={<MapSearchBox onPlaceSelect={handlePlaceSelect} />}
            >
              {userMenu}
            </AppHeader>
            <div className="flex-1 overflow-hidden relative">
               <MapComponent
                activeLayers={activeLayers}
                data={allData}
                userPosition={userPosition}
                searchedPlace={searchedPlace?.geometry?.location?.toJSON()}
                center={mapCenter}
                zoom={zoom}
                onCenterChanged={setMapCenter}
                onZoomChanged={setZoom}
                onMarkerClick={handleMarkerClick}
              />
              {user && (
                <Button
                    onClick={handleStartReporting}
                    className="md:hidden absolute bottom-6 left-6 z-10 h-14 w-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
                    aria-label="Reportar Incidente"
                >
                    <Plus className="h-7 w-7" />
                </Button>
              )}
            </div>
          </SidebarInset>
        </div>
        <PointOfInterestDetails
            poi={selectedPoi}
            open={!!selectedPoi}
            onOpenChange={(isOpen) => {
            if (!isOpen) {
                handleDetailsClose();
            }
            }}
            onPoiStatusChange={handlePoiStatusChange}
            onAddUpdate={handleAddUpdate}
        />
        <IncidentReport 
            open={isIncidentSheetOpen}
            onOpenChange={setIsIncidentSheetOpen}
            onIncidentSubmit={handleAddNewIncident}
            initialCenter={mapCenter}
        />
      </SidebarProvider>
  );
}
