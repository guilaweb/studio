

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
import { PointOfInterest, PointOfInterestUpdate, UserProfile, statusLabelMap } from "@/lib/data";
import { Logo } from "@/components/icons";
import AppHeader from "@/components/app-header";
import MapComponent from "@/components/map-component";
import LayerControls from "@/components/layer-controls";
import IncidentReport from "@/components/incident-report";
import SanitationReport from "@/components/sanitation-report";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Megaphone, Plus, Trash, Siren, LightbulbOff, CircleDashed, Construction, Landmark, Droplet, Square } from "lucide-react";
import PointOfInterestDetails from "@/components/point-of-interest-details";
import { usePoints } from "@/hooks/use-points";
import { useSearchParams } from "next/navigation";
import MapSearchBox from "@/components/map-search-box";
import { detectDuplicate } from "@/ai/flows/detect-duplicate-flow";
import { calculateIncidentPriority } from "@/services/incident-priority-service";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import TrafficLightReport from "./traffic-light-report";
import PotholeReport from "./pothole-report";
import PublicLightingReport from "./public-lighting-report";
import ConstructionReport from "./construction-report";
import AtmReport from "./atm-report";
import WaterLeakReport from "./water-leak-report";
import LandPlotReport from "./land-plot-report";


type ActiveSheet = null | 'incident' | 'sanitation' | 'traffic_light' | 'pothole' | 'public_lighting' | 'construction' | 'atm' | 'water_leak' | 'land_plot';

type SpecializedIncidentData = Pick<PointOfInterest, 'description' | 'position' | 'incidentDate'> & { photoDataUri?: string };

export default function MainPageHandler({ userMenu }: { userMenu: React.ReactNode }) {
  const [activeLayers, setActiveLayers] = React.useState({
    atm: true,
    construction: true,
    incident: true,
    sanitation: true,
    water: true,
    land_plot: true,
    announcement: true,
  });
  const [selectedPoi, setSelectedPoi] = React.useState<PointOfInterest | null>(null);
  const [searchedPlace, setSearchedPlace] = React.useState<google.maps.places.PlaceResult | null>(null);
  const [userPosition, setUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: -8.8368,
    lng: 13.2343,
  });
  const [zoom, setZoom] = React.useState(12);
  const { allData, addPoint, updatePointStatus, addUpdateToPoint, updatePointDetails } = usePoints();
  const searchParams = useSearchParams();
  const prevDataRef = React.useRef<PointOfInterest[]>([]);

  const [activeSheet, setActiveSheet] = React.useState<ActiveSheet>(null);
  const [poiToEdit, setPoiToEdit] = React.useState<PointOfInterest | null>(null);


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
                const statusLabel = statusLabelMap[newPoi.status] || newPoi.status;
                toast({
                    title: 'Atualização do seu Reporte',
                    description: `O estado de "${newPoi.title}" foi atualizado para: ${statusLabel}`,
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

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
        setPoiToEdit(null);
        setActiveSheet(null);
    }
  }

  const handleAddNewIncident = async (
    newIncidentData: Omit<PointOfInterest, 'id' | 'authorId' | 'updates' | 'type' | 'status'> & { photoDataUri?: string }
  ) => {
    if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para reportar uma incidência.",
        });
        return;
    }

    handleSheetOpenChange(false);

     const { photoDataUri, ...incidentDetails } = newIncidentData;
    
    // Duplicate detection
    const timeThreshold = 48 * 60 * 60 * 1000; // 48 hours
    const now = new Date().getTime();
    const recentIncidents = allData.filter(p => 
        p.type === 'incident' && 
        p.lastReported && 
        (now - new Date(p.lastReported).getTime() < timeThreshold)
    );

    try {
        const duplicateResult = await detectDuplicate({
            newIncident: {
                title: incidentDetails.title,
                description: incidentDetails.description,
                position: incidentDetails.position,
                authorDisplayName: profile.displayName
            },
            existingIncidents: recentIncidents,
        });

        if (duplicateResult.isDuplicate && duplicateResult.duplicateOfId) {
            const originalIncidentId = duplicateResult.duplicateOfId;
            const newUpdate: Omit<PointOfInterestUpdate, 'id'> = {
                text: `(Reporte duplicado) ${incidentDetails.description}`,
                authorId: user.uid,
                authorDisplayName: profile.displayName,
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

    const initialUpdate: Omit<PointOfInterestUpdate, 'id'> = {
        text: incidentDetails.description,
        authorId: user.uid,
        authorDisplayName: profile.displayName,
        timestamp: timestamp,
        photoDataUri: photoDataUri,
    };
    
    let priority: PointOfInterest['priority'] | undefined = undefined;
    
    try {
        const result = await calculateIncidentPriority({
            title: incidentDetails.title,
            description: incidentDetails.description,
        });
        priority = result.priority;
    } catch (error) {
        console.error("Error calculating priority, defaulting to low:", error);
        priority = 'low';
    }


    const incidentToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      ...incidentDetails,
      id: `incident-${Date.now()}`,
      type: 'incident',
      authorId: user.uid,
      lastReported: timestamp,
      incidentDate: incidentDetails.incidentDate,
      status: 'unknown',
      updates: [initialUpdate],
      ...(priority && { priority }),
    };
    
    addPoint(incidentToAdd);

    toast({
      title: "Incidência reportada!",
      description: "Obrigado pela sua contribuição para uma cidade melhor.",
    });
  };
  
  const handleEditIncident = async (
    incidentId: string,
    updatedData: Omit<PointOfInterest, 'id' | 'authorId' | 'updates' | 'type' | 'status'> & { photoDataUri?: string }
    ) => {
    handleSheetOpenChange(false);
    
    await updatePointDetails(incidentId, updatedData);
    
    toast({
        title: "Incidência atualizada!",
        description: "As suas alterações foram guardadas com sucesso.",
    });
  };

  const handleAddNewSanitationPoint = async (
    newPointData: Pick<PointOfInterest, 'description' | 'position'> & { photoDataUri?: string }
  ) => {
    if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para mapear um contentor.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

    const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `sanitation-${Date.now()}`,
      type: 'sanitation',
      title: 'Contentor de Lixo',
      authorId: user.uid,
      lastReported: timestamp,
      status: 'unknown',
      description: newPointData.description,
      position: newPointData.position,
      updates: [{
          text: 'Ponto de saneamento mapeado.',
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: newPointData.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Contentor mapeado!",
      description: "Obrigado por ajudar a manter o mapa de saneamento da cidade atualizado.",
    });
  }

  const handleAddNewSpecializedIncident = async (
    incidentTitle: string,
    newPointData: SpecializedIncidentData
  ) => {
     if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para reportar.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

    let priority: PointOfInterest['priority'] | undefined;
    try {
        const result = await calculateIncidentPriority({
            title: incidentTitle,
            description: newPointData.description,
        });
        priority = result.priority;
    } catch (error) {
        console.error("Error calculating priority, defaulting to low:", error);
        priority = 'low';
    }

    const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `incident-${Date.now()}`,
      type: 'incident',
      title: incidentTitle,
      authorId: user.uid,
      lastReported: timestamp,
      incidentDate: newPointData.incidentDate,
      description: newPointData.description,
      position: newPointData.position,
      priority: priority,
      status: 'unknown',
      updates: [{
          text: newPointData.description,
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: newPointData.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Reporte recebido!",
      description: `O seu reporte sobre "${incidentTitle}" foi registado. Obrigado!`,
    });
  }
  
  const handleAddNewWaterLeakReport = async (
    data: Pick<PointOfInterest, 'description' | 'position' | 'incidentDate' | 'priority'> & { photoDataUri?: string }
  ) => {
     if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para reportar.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

    const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `water-${Date.now()}`,
      type: 'water',
      title: 'Fuga de Água',
      authorId: user.uid,
      lastReported: timestamp,
      status: 'unknown',
      description: data.description,
      position: data.position,
      priority: data.priority,
      incidentDate: data.incidentDate,
      updates: [{
          text: data.description,
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: data.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Reporte de Fuga de Água Recebido!",
      description: "Obrigado pela sua contribuição para a gestão da nossa rede de águas.",
    });
  }

  const handleAddNewTrafficLightReport = (data: SpecializedIncidentData) => {
    handleAddNewSpecializedIncident("Semáforo com defeito", data);
  }

  const handleAddNewPotholeReport = (data: SpecializedIncidentData) => {
     handleAddNewSpecializedIncident("Buraco na via", data);
  }

  const handleAddNewPublicLightingReport = (data: SpecializedIncidentData) => {
      handleAddNewSpecializedIncident("Iluminação pública com defeito", data);
  }

  const handleAddNewConstructionProject = async (
    newPointData: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'startDate' | 'endDate'> & { photoDataUri?: string }
  ) => {
    if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para mapear uma obra.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

    const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `construction-${Date.now()}`,
      type: 'construction',
      title: newPointData.title,
      authorId: user.uid,
      lastReported: timestamp,
      status: 'in_progress',
      description: newPointData.description,
      position: newPointData.position,
      startDate: newPointData.startDate,
      endDate: newPointData.endDate,
      updates: [{
          text: `Obra iniciada: ${newPointData.description}`,
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: newPointData.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Obra mapeada!",
      description: "Obrigado por ajudar a manter o mapa de obras da cidade atualizado.",
    });
  }

  const handleAddNewAtmPoint = async (
    newPointData: Pick<PointOfInterest, 'title' | 'description' | 'position'> & { photoDataUri?: string }
  ) => {
     if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para mapear um ATM.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

     const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `atm-${Date.now()}`,
      type: 'atm',
      title: newPointData.title,
      authorId: user.uid,
      lastReported: timestamp,
      status: 'unknown',
      description: newPointData.description,
      position: newPointData.position,
      updates: [{
          text: `ATM Mapeado: ${newPointData.description}`,
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: newPointData.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Caixa Eletrónico mapeado!",
      description: "Obrigado por ajudar a manter o mapa de ATMs da cidade atualizado.",
    });
  }
  
  const handleEditAtmPoint = async (
    poiId: string,
    updatedData: Pick<PointOfInterest, 'title' | 'description' | 'position'> & { photoDataUri?: string }
  ) => {
    handleSheetOpenChange(false);
    await updatePointDetails(poiId, updatedData);
    toast({
      title: "Caixa Eletrónico atualizado!",
      description: "As suas alterações foram guardadas com sucesso.",
    });
  };

  const handleAddNewLandPlot = async (
    data: Pick<PointOfInterest, 'status' | 'plotNumber' | 'registrationCode' | 'zoningInfo' | 'polygon' | 'usageType' | 'maxHeight' | 'buildingRatio'> & { photoDataUri?: string }
  ) => {
    if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para mapear um lote.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

    const centerLat = data.polygon!.reduce((sum, p) => sum + p.lat, 0) / data.polygon!.length;
    const centerLng = data.polygon!.reduce((sum, p) => sum + p.lng, 0) / data.polygon!.length;

    const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `land_plot-${Date.now()}`,
      type: 'land_plot',
      title: `Lote ${data.plotNumber || 'S/N'}`,
      authorId: user.uid,
      lastReported: timestamp,
      description: data.zoningInfo || "Sem informação de zoneamento.",
      position: { lat: centerLat, lng: centerLng },
      polygon: data.polygon,
      status: data.status,
      plotNumber: data.plotNumber,
      registrationCode: data.registrationCode,
      zoningInfo: data.zoningInfo,
      usageType: data.usageType,
      maxHeight: data.maxHeight,
      buildingRatio: data.buildingRatio,
      updates: [{
          text: "Registo inicial do lote realizado.",
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: data.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Lote de Terreno Mapeado!",
      description: "O novo lote foi adicionado ao mapa de cadastro.",
    });
  }

  const handleEditLandPlot = async (
    poiId: string,
    data: Pick<PointOfInterest, 'status' | 'plotNumber' | 'registrationCode' | 'zoningInfo' | 'polygon' | 'usageType' | 'maxHeight' | 'buildingRatio'> & { photoDataUri?: string }
  ) => {
    handleSheetOpenChange(false);

    const centerLat = data.polygon!.reduce((sum, p) => sum + p.lat, 0) / data.polygon!.length;
    const centerLng = data.polygon!.reduce((sum, p) => sum + p.lng, 0) / data.polygon!.length;

    const updatedData = {
        ...data,
        title: `Lote ${data.plotNumber || 'S/N'}`,
        position: { lat: centerLat, lng: centerLng },
    };
    
    await updatePointDetails(poiId, updatedData);

    toast({
        title: "Lote de Terreno Atualizado!",
        description: "As informações do lote foram guardadas com sucesso.",
    });
  }


  const handleStartReporting = (type: ActiveSheet) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para reportar.",
        });
        return;
    }
    setPoiToEdit(null);
    setActiveSheet(type);
  };


  const handleStartEditing = (poi: PointOfInterest) => {
    const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';
    
    if (poi.type === 'incident' || poi.type === 'atm') {
        if (user?.uid !== poi.authorId) {
            toast({
                variant: "destructive",
                title: "Acesso Negado",
                description: "Apenas o autor original pode editar este item.",
            });
            return;
        }
    } else if (poi.type === 'land_plot') {
        if (!isManager) {
            toast({
                variant: "destructive",
                title: "Acesso Negado",
                description: "Apenas um agente municipal ou administrador pode editar um lote.",
            });
            return;
        }
    } else {
        return; // Other types might not be editable
    }
    
    setPoiToEdit(poi);
    setSelectedPoi(null); // Close details sheet
    setActiveSheet(poi.type as ActiveSheet);
  }

  const handleMarkerClick = (poiId: string) => {
    const poi = allData.find(p => p.id === poiId) || null;
    setSelectedPoi(poi);
    setSearchedPlace(null);
  };

  const handleDetailsClose = () => {
    setSelectedPoi(null);
  };

  const handlePoiStatusChange = (poiId: string, status: PointOfInterest['status']) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para atualizar o estado.",
        });
        return;
    }
    updatePointStatus(poiId, status);
    setSelectedPoi(prevPoi => prevPoi ? { ...prevPoi, status, lastReported: new Date().toISOString() } : null);
    toast({
        title: "Estado atualizado!",
        description: "Obrigado pela sua contribuição.",
    })
  };

  const handleAddUpdate = (poiId: string, updateText: string, photoDataUri?: string) => {
    if (!user || !profile) {
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
        authorDisplayName: profile.displayName || user.displayName || "Utilizador Anónimo",
        timestamp: new Date().toISOString(),
        photoDataUri: photoDataUri,
    };
    
    addUpdateToPoint(poiId, newUpdate);
    
    // Optimistic update of the selected PoI
    setSelectedPoi(prevPoi => {
      if (!prevPoi) return null;
      const updatedUpdates = [
          {...newUpdate, id: `temp-${Date.now()}`}, 
          ...(prevPoi.updates || [])
      ];
      return { ...prevPoi, updates: updatedUpdates, lastReported: new Date().toISOString() };
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
              <Link href="/" className="group/logo flex items-center gap-2" aria-label="MUNITU">
                <Logo className="size-8 shrink-0 text-primary group-data-[collapsible=icon]:size-6" />
                <div className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                  MUNITU
                </div>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <LayerControls activeLayers={activeLayers} onLayerChange={setActiveLayers} />
            </SidebarContent>
            <SidebarFooter className="space-y-2">
              {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="hidden md:flex">
                             <Plus className="mr-2 h-4 w-4" />
                             Nova Contribuição
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem onClick={() => handleStartReporting('incident')}>
                            <Siren className="mr-2 h-4 w-4" />
                            Reportar Incidente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('water_leak')}>
                            <Droplet className="mr-2 h-4 w-4" />
                            Reportar Fuga de Água
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStartReporting('sanitation')}>
                            <Trash className="mr-2 h-4 w-4" />
                            Mapear Contentor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('traffic_light')}>
                            <LightbulbOff className="mr-2 h-4 w-4" />
                            Reportar Semáforo
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStartReporting('public_lighting')}>
                            <LightbulbOff className="mr-2 h-4 w-4" />
                            Reportar Iluminação
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('pothole')}>
                            <CircleDashed className="mr-2 h-4 w-4" />
                            Reportar Buraco na Via
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStartReporting('construction')}>
                            <Construction className="mr-2 h-4 w-4" />
                            Mapear Obra/Projeto
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('atm')}>
                            <Landmark className="mr-2 h-4 w-4" />
                            Mapear Caixa Eletrónico
                        </DropdownMenuItem>
                        {isManager && (
                          <DropdownMenuItem onClick={() => handleStartReporting('land_plot')}>
                              <Square className="mr-2 h-4 w-4" />
                              Mapear Lote de Terreno
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
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
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="md:hidden absolute bottom-6 left-6 z-10 h-14 w-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
                            aria-label="Nova Contribuição"
                        >
                            <Plus className="h-7 w-7" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start">
                        <DropdownMenuItem onClick={() => handleStartReporting('incident')}>
                            <Siren className="mr-2 h-4 w-4" />
                            Reportar Incidente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('water_leak')}>
                            <Droplet className="mr-2 h-4 w-4" />
                            Reportar Fuga de Água
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStartReporting('sanitation')}>
                            <Trash className="mr-2 h-4 w-4" />
                            Mapear Contentor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('traffic_light')}>
                            <LightbulbOff className="mr-2 h-4 w-4" />
                            Reportar Semáforo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('public_lighting')}>
                            <LightbulbOff className="mr-2 h-4 w-4" />
                            Reportar Iluminação
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('pothole')}>
                            <CircleDashed className="mr-2 h-4 w-4" />
                            Reportar Buraco na Via
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('construction')}>
                            <Construction className="mr-2 h-4 w-4" />
                            Mapear Obra/Projeto
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStartReporting('atm')}>
                            <Landmark className="mr-2 h-4 w-4" />
                            Mapear Caixa Eletrónico
                        </DropdownMenuItem>
                         {isManager && (
                          <DropdownMenuItem onClick={() => handleStartReporting('land_plot')}>
                              <Square className="mr-2 h-4 w-4" />
                              Mapear Lote de Terreno
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
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
            onEdit={handleStartEditing}
        />
        <IncidentReport 
            open={activeSheet === 'incident'}
            onOpenChange={handleSheetOpenChange}
            onIncidentSubmit={handleAddNewIncident}
            onIncidentEdit={handleEditIncident}
            initialCenter={mapCenter}
            incidentToEdit={poiToEdit}
        />
        <SanitationReport 
            open={activeSheet === 'sanitation'}
            onOpenChange={handleSheetOpenChange}
            onSanitationSubmit={handleAddNewSanitationPoint}
            initialCenter={mapCenter}
        />
        <TrafficLightReport
            open={activeSheet === 'traffic_light'}
            onOpenChange={handleSheetOpenChange}
            onTrafficLightSubmit={handleAddNewTrafficLightReport}
            initialCenter={mapCenter}
        />
        <PotholeReport
            open={activeSheet === 'pothole'}
            onOpenChange={handleSheetOpenChange}
            onPotholeSubmit={handleAddNewPotholeReport}
            initialCenter={mapCenter}
        />
        <PublicLightingReport
            open={activeSheet === 'public_lighting'}
            onOpenChange={handleSheetOpenChange}
            onPublicLightingSubmit={handleAddNewPublicLightingReport}
            initialCenter={mapCenter}
        />
        <ConstructionReport
            open={activeSheet === 'construction'}
            onOpenChange={handleSheetOpenChange}
            onConstructionSubmit={handleAddNewConstructionProject}
            initialCenter={mapCenter}
        />
        <AtmReport
            open={activeSheet === 'atm'}
            onOpenChange={handleSheetOpenChange}
            onAtmSubmit={handleAddNewAtmPoint}
            onAtmEdit={handleEditAtmPoint}
            initialCenter={mapCenter}
            poiToEdit={poiToEdit}
        />
        <WaterLeakReport
            open={activeSheet === 'water_leak'}
            onOpenChange={handleSheetOpenChange}
            onWaterLeakSubmit={handleAddNewWaterLeakReport}
            initialCenter={mapCenter}
        />
        <LandPlotReport
            open={activeSheet === 'land_plot'}
            onOpenChange={handleSheetOpenChange}
            onLandPlotSubmit={handleAddNewLandPlot}
            onLandPlotEdit={handleEditLandPlot}
            initialCenter={mapCenter}
            poiToEdit={poiToEdit}
        />
      </SidebarProvider>
  );
}

    
