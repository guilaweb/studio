"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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

export default function Home() {
  const [activeLayers, setActiveLayers] = React.useState<ActiveLayers>({
    atm: true,
    construction: true,
    incident: true,
  });
  const [userPosition, setUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: -23.55052,
    lng: -46.633308,
  });

  const { toast } = useToast();

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

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="h-16 items-center">
              <div className="group/logo flex items-center gap-2" aria-label="Cidadão Online">
                <Logo className="size-8 shrink-0 text-primary group-data-[collapsible=icon]:size-6" />
                <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                  Cidadão Online
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <LayerControls activeLayers={activeLayers} onLayerChange={setActiveLayers} />
            </SidebarContent>
            <SidebarFooter>
              <IncidentReport onIncidentSubmit={handleAddNewIncident} />
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-col">
            <AppHeader onLocateClick={handleLocateUser} />
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
