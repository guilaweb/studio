
"use client";

import { Map, AdvancedMarker, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import type { PointOfInterest, ActiveLayers } from "@/lib/data";
import { Landmark, Construction, Siren, Trash, Search } from "lucide-react";
import React from "react";

type MapComponentProps = {
  activeLayers: ActiveLayers;
  data: PointOfInterest[];
  userPosition: google.maps.LatLngLiteral | null;
  searchedPlace: google.maps.LatLngLiteral | null;
  center: google.maps.LatLngLiteral;
  zoom: number;
  onCenterChanged: (center: google.maps.LatLngLiteral) => void;
  onZoomChanged: (zoom: number) => void;
  onMarkerClick: (pointId: string) => void;
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
      return <Siren className={commonClasses} />;
    case "sanitation":
        return <Trash className={commonClasses} />;
    default:
      return null;
  }
};

const getPinStyle = (point: PointOfInterest) => {
    if (point.type === 'atm') {
        switch (point.status) {
            case 'available':
                return { background: '#22c55e', borderColor: '#16a34a', glyphColor: '#ffffff' }; // green
            case 'unavailable':
                return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
            default:
                 return { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))', glyphColor: 'hsl(var(--primary-foreground))' };
        }
    }
    if (point.type === 'construction') {
        return { background: 'hsl(var(--secondary-foreground))', borderColor: 'hsl(var(--secondary-foreground))', glyphColor: 'hsl(var(--secondary))' };
    }
    if (point.type === 'incident') {
        return { background: 'hsl(var(--accent))', borderColor: 'hsl(var(--accent))', glyphColor: 'hsl(var(--accent-foreground))' };
    }
    if (point.type === 'sanitation') {
        switch (point.status) {
            case 'full':
                return { background: '#f97316', borderColor: '#ea580c', glyphColor: '#ffffff' }; // orange
            case 'damaged':
                return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
            case 'collected':
                return { background: '#22c55e', borderColor: '#16a34a', glyphColor: '#ffffff' }; // green
            default:
                return { background: '#a1a1aa', borderColor: '#71717a', glyphColor: '#ffffff' }; // gray
        }
    }
    return {};
}

const PointOfInterestMarker = ({ point, onClick }: { point: PointOfInterest; onClick: (pointId: string) => void }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const pinStyle = getPinStyle(point);

  return (
    <AdvancedMarker ref={markerRef} position={point.position} title={point.title} onClick={() => onClick(point.id)}>
        <Pin 
            background={pinStyle.background} 
            borderColor={pinStyle.borderColor} 
            glyphColor={pinStyle.glyphColor}
        >
            <MarkerIcon type={point.type} />
        </Pin>
    </AdvancedMarker>
  );
};

export default function MapComponent({ activeLayers, data, userPosition, searchedPlace, center, zoom, onCenterChanged, onZoomChanged, onMarkerClick }: MapComponentProps) {
  
  const handleCameraChange = (e: google.maps.MapCameraChangedEvent) => {
    onCenterChanged(e.detail.center);
    onZoomChanged(e.detail.zoom);
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Map
        mapId="cidadao-online-map"
        center={center}
        zoom={zoom}
        gestureHandling={"greedy"}
        disableDefaultUI={false}
        styles={mapStyles}
        onCameraChanged={handleCameraChange}
      >
        {data
          .filter((point) => activeLayers[point.type])
          .map((point) => (
            <PointOfInterestMarker key={point.id} point={point} onClick={onMarkerClick} />
          ))}
        {userPosition && (
          <AdvancedMarker position={userPosition} title="Sua localização">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-white"></span>
            </span>
          </AdvancedMarker>
        )}
        {searchedPlace && (
            <AdvancedMarker position={searchedPlace} title="Local Pesquisado">
                <Pin>
                    <Search className="h-5 w-5" />
                </Pin>
            </AdvancedMarker>
        )}
      </Map>
    </div>
  );
}
