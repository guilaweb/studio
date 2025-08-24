

"use client";

import { Map, AdvancedMarker, Pin, useAdvancedMarkerRef, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import type { PointOfInterest, ActiveLayers } from "@/lib/data";
import { Landmark, Construction, Siren, Trash, Search, Droplet, Square, Megaphone, Droplets, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import MapInfoWindow from "./map-infowindow";
import { LandPlotPolygons } from "./marketplace/land-plot-polygons";


type MapComponentProps = {
  activeLayers: ActiveLayers | null;
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
    case "water":
        return <Droplet className={commonClasses} />;
    case "water_resource":
        return <Droplets className={commonClasses} />;
    case "land_plot":
        return <Square className={commonClasses} />;
    case "announcement":
        return <Megaphone className={commonClasses} />;
    case "croqui":
        return <Share2 className={commonClasses} />;
    default:
      return null;
  }
};

export const getPinStyle = (point: PointOfInterest) => {
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
    if (point.type === 'incident' || point.type === 'water') {
        switch (point.priority) {
            case 'high':
                return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
            case 'medium':
                return { background: '#f97316', borderColor: '#ea580c', glyphColor: '#ffffff' }; // orange
            default:
                 return { background: 'hsl(var(--accent))', borderColor: 'hsl(var(--accent))', glyphColor: 'hsl(var(--accent-foreground))' };
        }
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
    if (point.type === 'land_plot' || point.type === 'announcement' || point.type === 'water_resource') {
        switch (point.status) {
            case 'available':
                return { background: '#22c55e', borderColor: '#16a34a', glyphColor: '#ffffff' }; // green
            case 'occupied':
            case 'reserved':
            case 'active': // for announcements
                return { background: '#f97316', borderColor: '#ea580c', glyphColor: '#ffffff' }; // orange
            case 'in_dispute':
                return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
            case 'protected':
                return { background: '#0e7490', borderColor: '#155e75', glyphColor: '#ffffff' }; // cyan
            default:
                return { background: '#a1a1aa', borderColor: '#71717a', glyphColor: '#ffffff' }; // gray
        }
    }
    return {};
}

export const PointOfInterestMarker = ({ point, onClick, onMouseOver, onMouseOut }: { point: PointOfInterest; onClick: (pointId: string) => void; onMouseOver: (e: google.maps.MapMouseEvent, point: PointOfInterest) => void; onMouseOut: () => void; }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    const pinStyle = getPinStyle(point);

    if (point.type === 'announcement' && point.status === 'expired') {
        return null;
    }

    return (
        <AdvancedMarker
            ref={markerRef}
            position={point.position}
            title={point.title}
            onClick={() => onClick(point.id)}
            onMouseOver={(e) => onMouseOver(e, point)}
            onMouseOut={onMouseOut}
        >
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

const RiverPolylines: React.FC<{
    rivers: PointOfInterest[];
    onPolylineClick: (id: string) => void;
}> = ({ rivers, onPolylineClick }) => {
    const map = useMap();
    const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);

    useEffect(() => {
        if (!map) return;

        // Clean up previous polylines
        polylines.forEach(p => p.setMap(null));

        const newPolylines = rivers.map(river => {
            const polyline = new google.maps.Polyline({
                path: river.polyline,
                geodesic: true,
                strokeColor: '#0077be', // A nice blue for rivers
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: map,
            });

            polyline.addListener('click', () => {
                onPolylineClick(river.id);
            });
            return polyline;
        });

        setPolylines(newPolylines);

        // Cleanup on unmount
        return () => {
            newPolylines.forEach(p => p.setMap(null));
        };
    // We only want to re-run this when the map or the rivers change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, rivers]);

    return null;
}


export default function MapComponent({ activeLayers, data, userPosition, searchedPlace, center, zoom, onCenterChanged, onZoomChanged, onMarkerClick }: MapComponentProps) {
  
    const [infoWindowState, setInfoWindowState] = useState<{ anchor: google.maps.marker.AdvancedMarkerElement | null; poi: PointOfInterest | null }>({ anchor: null, poi: null });

    const handleCameraChange = (e: google.maps.MapCameraChangedEvent) => {
        onCenterChanged(e.detail.center);
        onZoomChanged(e.detail.zoom);
    };

    const handleMouseOver = (event: google.maps.MapMouseEvent, poi: PointOfInterest) => {
        if (!event.domEvent.target) return;
        const anchor = event.domEvent.target as unknown as google.maps.marker.AdvancedMarkerElement;
        setInfoWindowState({ anchor, poi });
    };

    const handleMouseOut = () => {
        setInfoWindowState({ anchor: null, poi: null });
    };

    const polygonPoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers[p.type] && p.polygon && !p.polyline);
    }, [data, activeLayers]);

    const markerPoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers[p.type] && !p.polygon && !p.polyline);
    }, [data, activeLayers]);

    const polylinePoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers[p.type] && p.polyline);
    }, [data, activeLayers]);


    return (
        <div style={{ height: "100%", width: "100%" }}>
            <Map
                mapId="jango-digital-map"
                center={center}
                zoom={zoom}
                gestureHandling={"greedy"}
                disableDefaultUI={false}
                styles={mapStyles}
                onCameraChanged={handleCameraChange}
            >
                {markerPoints.map((point) => (
                    <PointOfInterestMarker
                        key={point.id}
                        point={point}
                        onClick={onMarkerClick}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    />
                ))}

                <LandPlotPolygons
                    plots={polygonPoints}
                    selectedPlotId={null} // Hover is handled by InfoWindow now
                    onPlotClick={onMarkerClick}
                />
                
                <RiverPolylines
                    rivers={polylinePoints}
                    onPolylineClick={onMarkerClick}
                />

                {infoWindowState.anchor && infoWindowState.poi && (
                    <InfoWindow
                        anchor={infoWindowState.anchor}
                        onCloseClick={() => setInfoWindowState({ anchor: null, poi: null })}
                        pixelOffset={new google.maps.Size(0, -40)}
                    >
                        <MapInfoWindow poi={infoWindowState.poi} />
                    </InfoWindow>
                )}

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
