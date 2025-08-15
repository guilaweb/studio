
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
import { APIProvider } from "@vis.gl/react-google-maps";
import { useToast } from "@/hooks/use-toast";
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Logo } from "@/components/icons";
import AppHeader from "@/components/app-header";
import MapComponent from "@/components/map-component";
import LayerControls from "@/components/layer-controls";
import IncidentReport from "@/components/incident-report";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, LayoutDashboard, Megaphone, Plus } from "lucide-react";
import PointOfInterestDetails from "@/components/point-of-interest-details";
import { usePoints } from "@/hooks/use-points";
import { useSearchParams } from "next/navigation";
import MapSearchBox from "@/components/map-search-box";


export default function Home() {
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
    lat: -8.8368,
    lng: 13.2343,
  });
  const [zoom, setZoom] = React.useState(13);
  const { allData, addPoint, updatePointStatus, addUpdateToPoint } = usePoints();
  const searchParams = useSearchParams();

  const [isIncidentSheetOpen, setIsIncidentSheetOpen] = React.useState(false);


  const { toast } = useToast();
  const { user, loading, logout } = useAuth();

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

  const handleAddNewIncident = (
    newIncident: Omit<PointOfInterest, 'id' | 'authorId'>, 
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

    const incidentToAdd: PointOfInterest = {
      ...newIncident,
      id: `${type}-${Date.now()}`,
      type: type,
      authorId: user.uid,
      lastReported: new Date().toISOString(),
    };
    
    addPoint(incidentToAdd);

    toast({
      title: "Incidência reportada!",
      description: "Obrigado pela sua contribuição para uma cidade melhor.",
    });

    setIsIncidentSheetOpen(false);
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
        photoDataUri: photoDataUri,
    };
    
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


  const UserMenu = () => {
    if (loading) {
      return null;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Registar</Link>
            </Button>
        </div>
      )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                        <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/perfil">
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
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
                <Button onClick={handleStartReporting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Reportar Incidente
                </Button>
              )}
               <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Painel Municipal
                  </Link>
              </Button>
              {user && (
                <Button variant="outline" asChild className="w-full">
                    <Link href="/comunicacoes">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Comunicações
                    </Link>
                </Button>
              )}
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-col">
            <AppHeader 
              onLocateClick={handleLocateUser}
              searchBox={<MapSearchBox onPlaceSelect={handlePlaceSelect} />}
            >
              <UserMenu />
            </AppHeader>
            <div className="flex-1 overflow-hidden">
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
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
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
    </APIProvider>
  );
}
