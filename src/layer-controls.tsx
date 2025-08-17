
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Landmark, Construction, Siren, Trash, Droplet, Square, Megaphone } from "lucide-react";
import type { ActiveLayers, Layer } from "@/lib/data";
import { useAuth } from "./hooks/use-auth";
import { usePublicLayerSettings } from "./services/settings-service";

type LayerControlsProps = {
  activeLayers: ActiveLayers;
  onLayerChange: (layers: ActiveLayers) => void;
};

const allLayerConfig = [
  { id: "atm", label: "Caixas Eletrônicos", Icon: Landmark, isPublic: true },
  { id: "incident", label: "Incidentes", Icon: Siren, isPublic: true },
  { id: "sanitation", label: "Saneamento", Icon: Trash, isPublic: true },
  { id: "construction", label: "Obras e Projetos", Icon: Construction, isPublic: true },
  { id: "announcement", label: "Anúncios", Icon: Megaphone, isPublic: true },
  { id: "water", label: "Rede de Água", Icon: Droplet, isPublic: false },
  { id: "land_plot", label: "Lotes de Terreno", Icon: Square, isPublic: false },
];

export default function LayerControls({ activeLayers, onLayerChange }: LayerControlsProps) {
  const { profile } = useAuth();
  const { publicLayers, loading: loadingLayers } = usePublicLayerSettings();

  const handleToggle = (layerId: Layer) => {
    onLayerChange({
      ...activeLayers,
      [layerId]: !activeLayers[layerId],
    });
  };

  const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';

  const visibleLayers = React.useMemo(() => {
    if (isManager || loadingLayers) {
      // Managers and admins see all layers, or we show all while loading settings
      return allLayerConfig;
    }
    // Citizens only see layers marked as public in the database AND in the base config
    return allLayerConfig.filter(layer => layer.isPublic && publicLayers[layer.id as Layer]);
  }, [isManager, publicLayers, loadingLayers]);


  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Camadas de Informação</h3>
      {visibleLayers.map(({ id, label, Icon }) => (
        <div key={id} className="flex items-center justify-between">
          <Label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
            <Icon className="h-4 w-4 text-primary" />
            <span>{label}</span>
          </Label>
          <Switch
            id={id}
            checked={activeLayers[id as Layer]}
            onCheckedChange={() => handleToggle(id as Layer)}
            aria-label={`Toggle ${label} layer`}
          />
        </div>
      ))}
    </div>
  );
}
