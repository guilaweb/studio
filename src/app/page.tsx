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
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { atms, constructionSites, incidents, PointOfInterest, Layer, ActiveLayers } from "@/lib/data";
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
import { LogOut } from "lucide-react";


export default function Home() {
  const [activeLayers, setActiveLayers] = React.useState<ActiveLayers>({
    atm: true,
    construction: true,
    incident: true,
  });
  const [userPosition, setUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: -8.8368,
    lng: 13.2343,
  });

  const { toast } = useToast();
  const { user, loading, logout } = useAuth();

  const allData: PointOfInterest[] = React.useMemo(() => {
    return [...atms, ...constructionSites, ...incidents];
  }, []);

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

  const handleAddNewIncident = (newIncident: Omit<PointOfInterest, 'id' | 'type'>) => {
    const incidentToAdd: PointOfInterest = {
      ...newIncident,
      id: `incident-${Date.now()}`,
      type: 'incident',
    };
    incidents.push(incidentToAdd);
    toast({
      title: "Incidência reportada!",
      description: "Obrigado pela sua contribuição para uma cidade melhor.",
    });
  };

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
              <div className="group/logo flex items-center gap-2" aria-label="Cidadão Online">
                <Logo className="size-8 shrink-0 text-primary group-data-[collapsible=icon]:size-6" />
                <Link href="/" className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                  Cidadão Online
                </Link>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <LayerControls activeLayers={activeLayers} onLayerChange={setActiveLayers} />
            </SidebarContent>
            <SidebarFooter>
              {user && <IncidentReport onIncidentSubmit={handleAddNewIncident} />}
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-col">
            <AppHeader onLocateClick={handleLocateUser}>
              <UserMenu />
            </AppHeader>
            <div className="flex-1 overflow-hidden">
               <MapComponent
                activeLayers={activeLayers}
                data={allData}
                userPosition={userPosition}
                center={mapCenter}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Toaster />
    </APIProvider>
  );
}
