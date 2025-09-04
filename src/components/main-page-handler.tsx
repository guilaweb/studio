

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
import { PointOfInterest, PointOfInterestUpdate, UserProfile, statusLabelMap, ActiveLayers, QueueTime, PointOfInterestStatus } from "@/lib/data";
import { Logo } from "@/components/icons";
import AppHeader from "@/components/app-header";
import MapComponent from "@/components/map-component";
import LayerControls from "@/components/layer-controls";
import IncidentReport from "@/components/incident-report";
import SanitationReport from "@/components/sanitation-report";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Megaphone, Plus, Trash, Siren, LightbulbOff, CircleDashed, Construction, Landmark, Droplet, Square, Settings, Droplets, GitBranch, ShieldCheck, Share2, Waves } from "lucide-react";
import PointOfInterestDetails from "@/components/point-of-interest-details";
import { usePoints } from "@/hooks/use-points";
import { useSearchParams } from "next/navigation";
import MapSearchBox from "@/components/map-search-box";
import { detectDuplicate } from "@/ai/flows/detect-duplicate-flow";
import { calculateIncidentPriorityFlow } from "@/ai/flows/calculate-incident-priority-flow";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import TrafficLightReport from "./traffic-light-report";
import PotholeReport from "./pothole-report";
import PublicLightingReport from "./public-lighting-report";
import ConstructionReport from "./construction-report";
import AtmReport from "./atm-report";
import WaterLeakReport from "./water-leak-report";
import LandPlotReport from "./land-plot-report";
import { usePublicLayerSettings } from "@/services/settings-service";
import AnnouncementReport from "./announcement-report";
import ConstructionEdit from "./construction-edit";
import CroquiReport from "./croqui-report";
import WaterResourceReport from "./water-resource-report";
import PollutionReport from "./pollution-report";
import DirectionsRenderer from "./directions-renderer";


type ActiveSheet = null | 'incident' | 'sanitation' | 'traffic_light' | 'pothole' | 'public_lighting' | 'construction' | 'atm' | 'water_leak' | 'land_plot' | 'announcement' | 'construction_edit' | 'croqui' | 'water_resource' | 'pollution';
type EditMode = 'edit' | 'divide' | null;

type SpecializedIncidentData = Pick<PointOfInterest, 'description' | 'position' | 'incidentDate'> & { photoDataUri?: string };

const defaultActiveLayers: ActiveLayers = {
    atm: true,
    construction: true,
    incident: true,
    sanitation: true,
    water: true,
    land_plot: true,
    announcement: true,
    water_resource: true,
    croqui: true,
};

export default function MainPageHandler({ userMenu }: { userMenu: React.ReactNode }) {
  const { allData, addPoint, updatePointStatus, addUpdateToPoint, updatePointDetails, deletePoint } = usePoints();
  const searchParams = useSearchParams();
  const prevDataRef = React.useRef<PointOfInterest[]>([]);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { publicLayers, loading: loadingLayers } = usePublicLayerSettings();


  const [activeLayers, setActiveLayers] = React.useState<ActiveLayers>(defaultActiveLayers);
  const [selectedPoi, setSelectedPoi] = React.useState<PointOfInterest | null>(null);
  const [searchedPlace, setSearchedPlace] = React.useState<google.maps.places.PlaceResult | null>(null);
  const [userPosition, setUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: -12.5,
    lng: 18.5,
  });
  const [zoom, setZoom] = React.useState(6);
  const [routeToOptimize, setRouteToOptimize] = React.useState<google.maps.LatLngLiteral[] | null>(null);
  

  const [activeSheet, setActiveSheet] = React.useState<ActiveSheet>(null);
  const [poiToEdit, setPoiToEdit] = React.useState<PointOfInterest | null>(null);
  const [editMode, setEditMode] = React.useState<EditMode>(null);
  
  const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';

  const finalActiveLayers = React.useMemo(() => {
    if (loadingLayers && !isManager) {
        // Return a default set of layers for citizens while public settings are loading
        return defaultActiveLayers;
    }
    if (isManager) {
        return activeLayers;
    }
    return publicLayers || defaultActiveLayers;
  }, [isManager, activeLayers, publicLayers, loadingLayers]);

  // Effect to synchronize active layers with public settings for citizens
  React.useEffect(() => {
      if (!isManager && !loadingLayers && publicLayers) {
          setActiveLayers(publicLayers);
      }
  }, [publicLayers, isManager, loadingLayers]);
  

  // Real-time notifications effect
  React.useEffect(() => {
    const prevData = prevDataRef.current;
    if (prevData.length === 0) {
        prevDataRef.current = allData;
        return;
    }
    
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

  }, [allData, user, profile, toast, isManager]);


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
    
    // Handle opening report sheets from URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#report-')) {
        const type = hash.substring(8);
        handleStartReporting(type as ActiveSheet);
        window.location.hash = ''; // Clear hash
    }

    // Handle optimized route requests from session storage
    const routeData = sessionStorage.getItem('routeToOptimize');
    if (routeData) {
        try {
            const waypoints = JSON.parse(routeData);
            setRouteToOptimize(waypoints);
            sessionStorage.removeItem('routeToOptimize');
        } catch (e) {
            console.error("Failed to parse route data from session storage", e);
            sessionStorage.removeItem('routeToOptimize');
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
        setEditMode(null);
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
    
    let potentialDuplicateOfId: string | null = null;

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
            potentialDuplicateOfId = duplicateResult.duplicateOfId;
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
        const result = await calculateIncidentPriorityFlow({
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
      authorDisplayName: profile.displayName,
      lastReported: timestamp,
      incidentDate: incidentDetails.incidentDate,
      status: 'unknown',
      updates: [initialUpdate],
      priority: priority,
      potentialDuplicateOfId: potentialDuplicateOfId || undefined,
    };
    
    addPoint(incidentToAdd);

    toast({
      title: potentialDuplicateOfId ? "Potencial Duplicado" : "Incidência reportada!",
      description: potentialDuplicateOfId ? "Este incidente parece ser um duplicado. Foi registado para revisão." : "Obrigado pela sua contribuição para uma cidade melhor.",
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
      authorDisplayName: profile.displayName,
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
        const result = await calculateIncidentPriorityFlow({
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
      authorDisplayName: profile.displayName,
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
      authorDisplayName: profile.displayName,
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
  
   const handleAddNewPollutionReport = async (
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
      title: 'Reporte de Poluição',
      authorId: user.uid,
      authorDisplayName: profile.displayName,
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
      title: "Reporte de Poluição Recebido!",
      description: "A sua denúncia foi registada e será analisada. Obrigado!",
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
      authorDisplayName: profile.displayName,
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
  
    const handleEditConstructionProject = async (
        poiId: string,
        data: Partial<Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'updates'>>
    ) => {
        handleSheetOpenChange(false);
        await updatePointDetails(poiId, data);
        toast({
            title: "Projeto Atualizado!",
            description: "As suas alterações foram guardadas com sucesso.",
        });
    };

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
      authorDisplayName: profile.displayName,
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
    data: Partial<PointOfInterest> & { polygon: google.maps.LatLngLiteral[] } & { photoDataUri?: string }
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
      authorDisplayName: profile.displayName,
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
      minLotArea: data.minLotArea,
      roadCession: data.roadCession,
      greenSpaceCession: data.greenSpaceCession,
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
    data: Partial<PointOfInterest> & { polygon: google.maps.LatLngLiteral[] } & { photoDataUri?: string }
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

  const handleAddNewCroqui = async (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'croquiPoints' | 'croquiRoute' | 'collectionName' | 'polygon' | 'customData'>, propertyIdToLink?: string) => {
      if (!user || !profile) {
        toast({ variant: "destructive", title: "Ação necessária", description: "Por favor, faça login para criar um croqui."});
        return;
      }
      handleSheetOpenChange(false);
      const timestamp = new Date().toISOString();
      let croquiId = `croqui-${Date.now()}`;
      
      const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
          id: croquiId,
          type: 'croqui',
          title: data.title,
          description: data.description,
          customData: data.customData,
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          position: data.position,
          lastReported: timestamp,
          croquiPoints: data.croquiPoints,
          croquiRoute: data.croquiRoute,
          polygon: data.polygon,
          collectionName: data.collectionName,
          status: 'active',
          updates: [{
              text: `Croqui criado: ${data.title}`,
              authorId: user.uid,
              authorDisplayName: profile.displayName,
              timestamp: timestamp,
          }]
      };
      
      await addPoint(pointToAdd, propertyIdToLink);
      
      toast({
          title: "Croqui Criado!",
          description: "O seu croqui de localização foi guardado com sucesso.",
      });
  }
  
  const handleEditCroqui = async (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'croquiPoints' | 'croquiRoute' | 'collectionName' | 'polygon' | 'customData'>) => {
      if (!poiToEdit) return;
      handleSheetOpenChange(false);

      if (editMode === 'divide') {
          // This is a "save as new" operation
          handleAddNewCroqui(data);
          toast({ title: 'Cópia Criada!', description: 'Uma nova versão do croqui foi criada com as suas alterações.'});
      } else {
           // This is a direct edit
          await updatePointDetails(poiToEdit.id, data);
          toast({ title: 'Croqui Atualizado!', description: 'As alterações foram guardadas.'});
      }
  };


  const handleEditAnnouncement = async (
    poiId: string,
    data: Partial<Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'updates'>>
  ) => {
    handleSheetOpenChange(false);
    
    const centerLat = data.polygon!.reduce((sum, p) => sum + p.lat, 0) / data.polygon!.length;
    const centerLng = data.polygon!.reduce((sum, p) => sum + p.lng, 0) / data.polygon!.length;

    const updatedData = {
        ...data,
        position: { lat: centerLat, lng: centerLng },
    };

    await updatePointDetails(poiId, updatedData);
    toast({
        title: "Anúncio Atualizado!",
        description: "O anúncio foi modificado com sucesso.",
    });
  }
  
  const handleAddNewWaterResource = async (data: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'customData' | 'polyline' | 'polygon'> & { photoDataUri?: string }) => {
     if (!user || !profile) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para mapear um recurso hídrico.",
        });
        return;
    }
    handleSheetOpenChange(false);
    const timestamp = new Date().toISOString();

    const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
      id: `water_resource-${Date.now()}`,
      type: 'water_resource',
      title: data.title,
      authorId: user.uid,
      authorDisplayName: profile.displayName,
      lastReported: timestamp,
      status: 'active',
      description: data.description,
      position: data.position,
      polyline: data.polyline,
      polygon: data.polygon,
      customData: data.customData,
      updates: [{
          text: `Recurso Hídrico mapeado: ${data.description}`,
          authorId: user.uid,
          authorDisplayName: profile.displayName,
          timestamp: timestamp,
          photoDataUri: data.photoDataUri,
      }]
    };
    
    addPoint(pointToAdd);

    toast({
      title: "Recurso Hídrico Mapeado!",
      description: "Obrigado por ajudar a construir o cadastro nacional de águas.",
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
    setEditMode(null);
    setActiveSheet(type);
  };


  const handleStartEditing = (poi: PointOfInterest, mode: EditMode = 'edit') => {
    if (!user || !profile) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Utilizador não autenticado." });
      return;
    }

    const isOwner = poi.authorId === user.uid;
    const isManager = profile.role === 'Agente Municipal' || profile.role === 'Administrador';
    
    let canEdit = false;
    if (isManager) {
        // Managers can edit anything except incidents they don't own to preserve citizen authorship
        if (poi.type === 'incident') {
            canEdit = isOwner;
        } else {
            canEdit = true;
        }
    } else {
        // Regular users can only edit what they own, and only specific types
        canEdit = isOwner && (poi.type === 'incident' || poi.type === 'atm' || poi.type === 'construction' || poi.type === 'land_plot' || poi.type === 'announcement' || poi.type === 'croqui');
    }

    if (!canEdit) {
        toast({
            variant: "destructive",
            title: "Acesso Negado",
            description: "Não tem permissão para editar este item.",
        });
        return;
    }
    
    setPoiToEdit(poi);
    setSelectedPoi(null); // Close details sheet
    setEditMode(mode);
    setActiveSheet(poi.type === 'construction' ? 'construction_edit' : (poi.type as ActiveSheet));
  }

  const handleMarkerClick = (poiId: string) => {
    const poi = allData.find(p => p.id === poiId) || null;
    setSelectedPoi(poi);
    setSearchedPlace(null);
  };

  const handleDetailsClose = () => {
    setSelectedPoi(null);
  };

  const handlePoiStatusChange = (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Ação necessária",
            description: "Por favor, faça login para atualizar o estado.",
        });
        return;
    }

    const statusLabel = status ? (statusLabelMap[status] || status) : 'desconhecido';
    const text = updateText || `Estado atualizado para: ${statusLabel}`;

    updatePointStatus(pointId, status, text, availableNotes, queueTime);
    setSelectedPoi(prevPoi => prevPoi ? { ...prevPoi, status, lastReported: new Date().toISOString() } : null);
    toast({
        title: "Estado atualizado!",
        description: "Obrigado pela sua contribuição.",
    })
  };

  const handleAddUpdate = (pointId: string, updateText: string, photoDataUri?: string) => {
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
    
    addUpdateToPoint(pointId, newUpdate);
    
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
              <LayerControls activeLayers={finalActiveLayers} onLayerChange={setActiveLayers} />
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
                        <DropdownMenuItem onClick={() => handleStartReporting('croqui')}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Criar Croqui de Localização
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('incident')}>
                            <Siren className="mr-2 h-4 w-4" />
                            Reportar Incidente
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStartReporting('atm')}>
                            <Landmark className="mr-2 h-4 w-4" />
                            Mapear Caixa Eletrónico
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('water_leak')}>
                            <Droplet className="mr-2 h-4 w-4" />
                            Reportar Fuga de Água
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('pollution')}>
                            <Waves className="mr-2 h-4 w-4" />
                            Reportar Poluição
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
                        {isManager && (
                            <>
                                <DropdownMenuItem onClick={() => handleStartReporting('land_plot')}>
                                    <Square className="mr-2 h-4 w-4" />
                                    Mapear Lote de Terreno
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStartReporting('announcement')}>
                                    <Megaphone className="mr-2 h-4 w-4" />
                                    Criar Anúncio
                                </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleStartReporting('water_resource')}>
                                    <Droplets className="mr-2 h-4 w-4" />
                                    Mapear Recurso Hídrico
                                </DropdownMenuItem>
                            </>
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
                            <Link href="/admin/definicoes">
                                <Settings className="mr-2 h-4 w-4" />
                                Definições
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
                activeLayers={finalActiveLayers}
                data={allData}
                userPosition={userPosition}
                searchedPlace={searchedPlace?.geometry?.location?.toJSON()}
                center={mapCenter}
                zoom={zoom}
                onCenterChanged={setMapCenter}
                onZoomChanged={setZoom}
                onMarkerClick={handleMarkerClick}
              >
                  <DirectionsRenderer waypoints={routeToOptimize} />
              </MapComponent>
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
                        <DropdownMenuItem onClick={() => handleStartReporting('croqui')}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Criar Croqui
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('incident')}>
                            <Siren className="mr-2 h-4 w-4" />
                            Reportar Incidente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('atm')}>
                            <Landmark className="mr-2 h-4 w-4" />
                            Mapear Caixa Eletrónico
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('water_leak')}>
                            <Droplet className="mr-2 h-4 w-4" />
                            Reportar Fuga de Água
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartReporting('pollution')}>
                            <Waves className="mr-2 h-4 w-4" />
                            Reportar Poluição
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
                        {isManager && (
                            <>
                                <DropdownMenuItem onClick={() => handleStartReporting('land_plot')}>
                                    <Square className="mr-2 h-4 w-4" />
                                    Mapear Lote de Terreno
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStartReporting('announcement')}>
                                    <Megaphone className="mr-2 h-4 w-4" />
                                    Criar Anúncio
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStartReporting('water_resource')}>
                                    <Droplets className="mr-2 h-4 w-4" />
                                    Mapear Recurso Hídrico
                                </DropdownMenuItem>
                            </>
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
         <PollutionReport
            open={activeSheet === 'pollution'}
            onOpenChange={handleSheetOpenChange}
            onPollutionSubmit={handleAddNewPollutionReport}
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
        <AnnouncementReport
            open={activeSheet === 'announcement'}
            onOpenChange={handleSheetOpenChange}
            onAnnouncementSubmit={addPoint}
            onAnnouncementEdit={handleEditAnnouncement}
            initialCenter={mapCenter}
            poiToEdit={poiToEdit}
        />
        <ConstructionEdit
            open={activeSheet === 'construction_edit'}
            onOpenChange={handleSheetOpenChange}
            onConstructionEdit={handleEditConstructionProject}
            poiToEdit={poiToEdit}
        />
        <CroquiReport
            open={activeSheet === 'croqui'}
            onOpenChange={handleSheetOpenChange}
            onCroquiSubmit={poiToEdit ? handleEditCroqui : handleAddNewCroqui}
            initialCenter={mapCenter}
            poiToEdit={poiToEdit}
            editMode={editMode}
        />
        <WaterResourceReport
            open={activeSheet === 'water_resource'}
            onOpenChange={handleSheetOpenChange}
            onWaterResourceSubmit={handleAddNewWaterResource}
            initialCenter={mapCenter}
        />
      </SidebarProvider>
  );
}
