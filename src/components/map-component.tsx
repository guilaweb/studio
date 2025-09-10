

"use client";

import { Map, AdvancedMarker, Pin, useAdvancedMarkerRef, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import type { PointOfInterest, ActiveLayers } from "@/lib/data";
import { Landmark, Construction, Siren, Trash, Search, Droplet, Square, Megaphone, Droplets, Share2, AlertTriangle, Fuel, Hospital, Stethoscope, Lightbulb, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import MapInfoWindow from "./map-infowindow";
import { GenericPolygonsRenderer } from "./generic-polygons-renderer";
import { useExternalLayers } from "@/services/external-layers-service";
import GeofenceRenderer from "./geofence-renderer";
import DirectionsRenderer from "./directions-renderer";


type MapComponentProps = {
  activeLayers: ActiveLayers | null;
  data: PointOfInterest[];
  userPosition: google.maps.LatLngLiteral | null;
  searchedPlace: google.maps.LatLngLiteral | null;
  placesResults?: google.maps.places.PlaceResult[];
  center: google.maps.LatLngLiteral;
  zoom: number;
  onCenterChanged: (center: google.maps.LatLngLiteral) => void;
  onZoomChanged: (zoom: number) => void;
  onMarkerClick: (pointId: string) => void;
  children?: React.ReactNode;
  styles?: google.maps.MapTypeStyle[];
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
};

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
    case "fuel_station":
        return <Fuel className={commonClasses} />;
    case "health_unit":
        return <Hospital className={commonClasses} />;
    case "lighting_pole":
        return <Lightbulb className={commonClasses} />;
    case "pt":
        return <Zap className={commonClasses} />;
    default:
      return null;
  }
};

const getSensorStatus = (point: PointOfInterest) => {
    if (point.type !== 'water_resource' || !point.customData) {
        return 'normal';
    }
    const ph = parseFloat(point.customData['pH']);
    if (!isNaN(ph) && (ph < 6 || ph > 8.5)) {
        return 'critical';
    }
    // Add more rules here for other parameters like 'Nível' or 'Caudal'
    return 'normal';
};

export const getPinStyle = (point: PointOfInterest) => {
    if (point.type === 'fuel_station' || point.type === 'atm') {
        switch (point.status) {
            case 'available':
                return { background: '#22c55e', borderColor: '#16a34a', glyphColor: '#ffffff' }; // green
            case 'unavailable':
                return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
            default:
                 return { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))', glyphColor: 'hsl(var(--primary-foreground))' };
        }
    }
    if (point.type === 'health_unit') {
        return { background: '#1d4ed8', borderColor: '#1e40af', glyphColor: '#ffffff' }; // blue
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
     if (point.type === 'water_resource') {
        const sensorStatus = getSensorStatus(point);
        if (sensorStatus === 'critical') {
            return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
        }
         if (sensorStatus === 'warning') {
            return { background: '#f97316', borderColor: '#ea580c', glyphColor: '#ffffff' }; // orange
        }
        return { background: '#0ea5e9', borderColor: '#0284c7', glyphColor: '#ffffff' }; // default sky blue for water resources
    }
    if (point.type === 'land_plot' || point.type === 'announcement' || point.type === 'croqui') {
        switch (point.status) {
            case 'available':
                return { background: '#22c55e', borderColor: '#16a34a', glyphColor: '#ffffff' }; // green
            case 'occupied':
            case 'reserved':
            case 'active': // for announcements
                return { background: '#f97316', borderColor: '#ea580c', glyphColor: '#ffffff' }; // orange
            case 'in_dispute':
                return { background: '#dc2626', borderColor: '#ef4444', glyphColor: '#ffffff' }; // red
            case 'protected':
                return { background: '#0e7490', borderColor: '#155e75', glyphColor: '#ffffff' }; // cyan
            default:
                return { background: '#a1a1aa', borderColor: '#71717a', glyphColor: '#ffffff' }; // gray
        }
    }
    if (point.type === 'lighting_pole' || point.type === 'pt') {
        switch (point.status) {
            case 'funcional':
                 return { background: '#facc15', borderColor: '#eab308', glyphColor: '#422006' }; // yellow
            case 'danificado':
            case 'desligado':
                 return { background: '#ef4444', borderColor: '#dc2626', glyphColor: '#ffffff' }; // red
            default:
                 return { background: '#a1a1aa', borderColor: '#71717a', glyphColor: '#ffffff' }; // gray
        }
    }
    return {};
}

export const PointOfInterestMarker = ({ point, onClick, onMouseOver, onMouseOut }: { point: PointOfInterest; onClick: (pointId: string) => void; onMouseOver: (e: google.maps.MapMouseEvent, point: PointOfInterest) => void; onMouseOut: () => void; }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    const pinStyle = getPinStyle(point);
    const sensorStatus = getSensorStatus(point);

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
            <div className="relative">
                <Pin
                    background={pinStyle.background}
                    borderColor={pinStyle.borderColor}
                    glyphColor={pinStyle.glyphColor}
                >
                    <MarkerIcon type={point.type} />
                </Pin>
                {sensorStatus !== 'normal' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sensorStatus === 'critical' ? 'bg-red-400' : 'bg-yellow-400'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${sensorStatus === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    </span>
                )}
            </div>
        </AdvancedMarker>
    );
};

const LineRenderer: React.FC<{
    points: PointOfInterest[];
    onPolylineClick: (id: string) => void;
}> = ({ points, onPolylineClick }) => {
    const map = useMap();
    const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);

    useEffect(() => {
        if (!map) return;

        // Clean up previous polylines
        polylines.forEach(p => p.setMap(null));

        const newPolylines = points.map(point => {
            let options: google.maps.PolylineOptions = {};
            let path: google.maps.LatLngLiteral[] | undefined;

            if (point.type === 'water_resource' && point.polyline) {
                path = point.polyline;
                options = {
                    strokeColor: '#0ea5e9',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                };
            }

            if (!path) return null;

            const polyline = new google.maps.Polyline({
                path: path,
                geodesic: true,
                map: map,
                ...options
            });

            polyline.addListener('click', () => {
                onPolylineClick(point.id);
            });
            return polyline;
        }).filter((p): p is google.maps.Polyline => p !== null);

        setPolylines(newPolylines);

        // Cleanup on unmount
        return () => {
            newPolylines.forEach(p => p.setMap(null));
        };
    // We only want to re-run this when the map or the points change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, points]);

    return null;
}

export const WMSLayer = ({ url, layerName }: { url: string, layerName: string }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !url) return;

        const wmsLayer = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                const proj = map.getProjection();
                if (!proj) return null;
                
                const zfactor = Math.pow(2, zoom);
                const tileWidth = 256 / zfactor;
                
                const ne = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileWidth, coord.y * tileWidth));
                const sw = proj.fromPointToLatLng(new google.maps.Point(coord.x * tileWidth, (coord.y + 1) * tileWidth));
                
                const bbox = `${sw.lng()},${sw.lat()},${ne.lng()},${ne.lat()}`;
                
                let requestUrl = url;
                requestUrl += `?SERVICE=WMS`;
                requestUrl += `&VERSION=1.1.1`;
                requestUrl += `&REQUEST=GetMap`;
                requestUrl += `&LAYERS=${layerName}`;
                requestUrl += `&STYLES=`;
                requestUrl += `&SRS=EPSG:4326`;
                requestUrl += `&BBOX=${bbox}`;
                requestUrl += `&WIDTH=256`;
                requestUrl += `&HEIGHT=256`;
                requestUrl += `&FORMAT=image/png`;
                requestUrl += `&TRANSPARENT=true`;

                return requestUrl;
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            name: layerName,
        });

        map.overlayMapTypes.push(wmsLayer);

        return () => {
             // Find and remove the correct layer
            const index = map.overlayMapTypes.getArray().findIndex(l => l === wmsLayer);
            if (index > -1) {
                map.overlayMapTypes.removeAt(index);
            }
        };
    }, [map, url, layerName]);

    return null;
};

export const WMTSLayer = ({ url, layerName }: { url: string; layerName: string }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const wmtsLayer = new google.maps.ImageMapType({
      getTileUrl: function (coord, zoom) {
        // WMTS uses a template URL structure
        let requestUrl = url
          .replace('{TileMatrixSet}', 'EPSG:3857') // Common matrix set
          .replace('{TileMatrix}', zoom.toString())
          .replace('{TileCol}', coord.x.toString())
          .replace('{TileRow}', coord.y.toString());
        
        // Sometimes the layer name is also part of the template
        requestUrl = requestUrl.replace('{Layer}', layerName);

        return requestUrl;
      },
      tileSize: new google.maps.Size(256, 256),
      name: layerName,
    });

    map.overlayMapTypes.push(wmtsLayer);

    return () => {
      const index = map.overlayMapTypes.getArray().findIndex((l) => l === wmtsLayer);
      if (index > -1) {
        map.overlayMapTypes.removeAt(index);
      }
    };
  }, [map, url, layerName]);

  return null;
};


export const WFSLayer = ({ url, layerName }: { url: string, layerName: string }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !url || !layerName) return;

        let requestUrl = `${url}?service=WFS&version=1.1.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json&srsname=EPSG:4326`;

        // Use the map's built-in GeoJSON loader
        map.data.loadGeoJson(requestUrl);

        map.data.setStyle({
            fillColor: 'hsl(var(--primary))',
            strokeWeight: 1,
            strokeColor: 'hsl(var(--primary))',
            fillOpacity: 0.2,
        });

        // Cleanup on unmount
        return () => {
            map.data.forEach(feature => {
                map.data.remove(feature);
            });
        };
    }, [map, url, layerName]);

    return null;
};



export default function MapComponent({ activeLayers, data, userPosition, searchedPlace, placesResults, center, zoom, onCenterChanged, onZoomChanged, onMarkerClick, children, styles, mapRef }: MapComponentProps) {
  
    const [infoWindowState, setInfoWindowState] = useState<{ anchor: google.maps.marker.AdvancedMarkerElement | google.maps.LatLngLiteral | null; poi: PointOfInterest | null }>({ anchor: null, poi: null });
    const { externalLayers } = useExternalLayers();

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
    
    const handlePolygonMouseOver = (event: google.maps.MapMouseEvent, poi: PointOfInterest) => {
        if (event.latLng) {
            setInfoWindowState({ anchor: event.latLng.toJSON(), poi });
        }
    };


    const polygonPoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers[p.type] && p.polygon);
    }, [data, activeLayers]);

    const markerPoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers[p.type] && !p.polygon && !p.polyline && !p.croquiRoute);
    }, [data, activeLayers]);

    const polylinePoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers[p.type] && (p.polyline));
    }, [data, activeLayers]);
    
     const routePoints = React.useMemo(() => {
        if (!activeLayers) return [];
        return data.filter(p => activeLayers['croqui'] && p.type === 'croqui' && p.croquiRoute);
    }, [data, activeLayers]);


    return (
        <div style={{ height: "100%", width: "100%", minHeight: "200px" }}>
            <Map
                ref={mapRef}
                mapId="jango-digital-map"
                center={center}
                zoom={zoom}
                gestureHandling={"greedy"}
                disableDefaultUI={false}
                mapTypeControl={true}
                onCameraChanged={handleCameraChange}
                styles={styles}
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

                <GenericPolygonsRenderer
                    plots={polygonPoints}
                    selectedPlotId={null} // Hover is handled by InfoWindow now
                    onPlotClick={onMarkerClick}
                    onMouseOver={handlePolygonMouseOver}
                    onMouseOut={handleMouseOut}
                />
                
                <LineRenderer
                    points={polylinePoints}
                    onPolylineClick={onMarkerClick}
                />
                
                {routePoints.map(point => (
                     <DirectionsRenderer key={point.id} path={point.croquiRoute} />
                ))}
                
                <GeofenceRenderer />

                {infoWindowState.anchor && infoWindowState.poi && (
                    <InfoWindow
                        anchor={infoWindowState.anchor instanceof google.maps.marker.AdvancedMarkerElement ? infoWindowState.anchor : undefined}
                        position={!(infoWindowState.anchor instanceof google.maps.marker.AdvancedMarkerElement) ? infoWindowState.anchor : undefined}
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
                
                {placesResults && placesResults.map((place, index) => (
                     place.geometry?.location && (
                        <AdvancedMarker key={place.place_id || index} position={place.geometry.location} title={place.name}>
                            <Pin background={'#FBBC04'} borderColor={'#FBBC04'} glyphColor={'#000000'}>
                                <Search className="h-5 w-5"/>
                            </Pin>
                        </AdvancedMarker>
                     )
                ))}


                {externalLayers.filter(l => l.visible).map(layer => {
                    if (layer.type === 'wms') {
                        return <WMSLayer key={layer.id} url={layer.url} layerName={layer.layerName} />
                    }
                    if (layer.type === 'wfs') {
                        return <WFSLayer key={layer.id} url={layer.url} layerName={layer.layerName} />
                    }
                    if (layer.type === 'wmts') {
                        return <WMTSLayer key={layer.id} url={layer.url} layerName={layer.layerName} />
                    }
                    return null;
                })}
                {children}
            </Map>
        </div>
    );
}
