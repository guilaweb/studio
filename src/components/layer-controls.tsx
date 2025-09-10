

"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Landmark, Construction, Siren, Trash, Droplet, Square, Megaphone, Droplets, Share2, Fuel, Hospital, Stethoscope, Lightbulb } from "lucide-react";
import type { ActiveLayers, Layer } from "@/lib/data";

type LayerControlsProps = {
  activeLayers: ActiveLayers;
  onLayerChange: (layers: ActiveLayers) => void;
};

const layerConfig = [
  { id: "atm", label: "Caixas Eletrônicos", Icon: Landmark },
  { id: "health_unit", label: "Unidades Sanitárias", Icon: Hospital },
  { id: "health_case", label: "Casos Clínicos", Icon: Stethoscope },
  { id: "construction", label: "Obras e Projetos", Icon: Construction },
  { id: "incident", label: "Incidentes", Icon: Siren },
  { id: "sanitation", label: "Saneamento", Icon: Trash },
  { id: "fuel_station", label: "Postos de Combustível", Icon: Fuel },
  { id: "lighting_pole", label: "Postes de Iluminação", Icon: Lightbulb },
  { id: "water", label: "Rede de Água", Icon: Droplet },
  { id: "water_resource", label: "Recursos Hídricos", Icon: Droplets },
  { id: "land_plot", label: "Lotes de Terreno", Icon: Square },
  { id: "announcement", label: "Anúncios", Icon: Megaphone },
  { id: "croqui", label: "Croquis", Icon: Share2 },
];

export default function LayerControls({ activeLayers, onLayerChange }: LayerControlsProps) {
  const handleToggle = (layerId: Layer) => {
    onLayerChange({
      ...activeLayers,
      [layerId]: !activeLayers[layerId],
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Camadas de Informação</h3>
      {layerConfig.map(({ id, label, Icon }) => (
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
