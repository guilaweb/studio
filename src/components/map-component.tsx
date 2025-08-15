"use client";

import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { PointOfInterest, ActiveLayers } from "@/lib/data";
import { Landmark, Construction, TriangleAlert } from "lucide-react";

type MapComponentProps = {
  activeLayers: ActiveLayers;
  data: PointOfInterest[];
  userPosition: google.maps.LatLngLiteral | null;
  center: google.maps.LatLngLiteral;
};

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  ];

const MarkerIcon = ({ type }: { type: PointOfInterest["type"] }) => {
  const commonClasses = "h-5 w-5";
  switch (type) {
    case "atm":
      return <Landmark className={commonClasses} />;
    case "construction":
      return <Construction className={commonClasses} />;
    case "incident":
      return <TriangleAlert className={commonClasses} />;
    default:
      return null;
  }
};

const pinStyles = {
  atm: {
    background: 'hsl(var(--primary))',
    borderColor: 'hsl(var(--primary))',
    glyphColor: 'hsl(var(--primary-foreground))',
  },
  construction: {
    background: 'hsl(var(--accent))',
    borderColor: 'hsl(var(--accent))',
    glyphColor: 'hsl(var(--accent-foreground))',
  },
  incident: {
    background: 'hsl(var(--destructive))',
    borderColor: 'hsl(var(--destructive))',
    glyphColor: 'hsl(var(--destructive-foreground))',
  },
};

export default function MapComponent({ activeLayers, data, userPosition, center }: MapComponentProps) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Map
        mapId="cidadao-online-map"
        center={center}
        zoom={13}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        styles={mapStyles}
      >
        {data
          .filter((point) => activeLayers[point.type])
          .map((point) => (
            <AdvancedMarker key={point.id} position={point.position} title={point.title}>
              <Pin 
                background={pinStyles[point.type].background} 
                borderColor={pinStyles[point.type].borderColor} 
                glyphColor={pinStyles[point.type].glyphColor}
              >
                  <MarkerIcon type={point.type} />
              </Pin>
            </AdvancedMarker>
          ))}
        {userPosition && (
          <AdvancedMarker position={userPosition} title="Sua localização">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-white"></span>
            </span>
          </AdvancedMarker>
        )}
      </Map>
    </div>
  );
}
