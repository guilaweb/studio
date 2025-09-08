
import { PointOfInterest } from "@/lib/data";

export interface IncidentClusterAlert {
    id: string;
    title: string;
    description: string;
    location?: { lat: number; lng: number };
    incidentCount?: number;
    incidentIds: string[];
    priority: 'high' | 'medium';
    type: 'cluster' | 'priority';
}

const getDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
    const R = 6371e3; // metres
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};


export const getIntelligentAlerts = (
    allData: PointOfInterest[],
    distanceThreshold: number = 500, // 500 meters
    timeThreshold: number = 48 * 60 * 60 * 1000 // 48 hours
): IncidentClusterAlert[] => {
    const now = new Date().getTime();
    const incidents = allData.filter(p => p.type === 'incident' && p.lastReported);
    const alerts: IncidentClusterAlert[] = [];
    
    // High Priority Incident Alerts
    const highPriorityIncidents = incidents.filter(p => p.priority === 'high' && p.lastReported && (now - new Date(p.lastReported).getTime() < timeThreshold));
    highPriorityIncidents.forEach(p => {
        alerts.push({
            id: `priority-${p.id}`,
            title: `Incidente de Alta Prioridade: ${p.title}`,
            description: `Um novo incidente de alta prioridade foi reportado. Requer atenção imediata.`,
            incidentIds: [p.id],
            priority: 'high',
            type: 'priority',
        });
    });


    // Cluster Alerts for traffic-related incidents
    const trafficIncidents = incidents.filter(p => 
        p.title === 'Colisão Ligeira' ||
        p.title === 'Colisão Grave' ||
        p.title === 'Atropelamento' ||
        p.title === 'Acidente de Moto'
    );
    const clusters: PointOfInterest[][] = [];
    const visited = new Set<string>();

    for (let i = 0; i < trafficIncidents.length; i++) {
        if (visited.has(trafficIncidents[i].id)) continue;

        const currentCluster: PointOfInterest[] = [trafficIncidents[i]];
        visited.add(trafficIncidents[i].id);

        for (let j = i + 1; j < trafficIncidents.length; j++) {
            if (visited.has(trafficIncidents[j].id)) continue;
            
            const distance = getDistance(trafficIncidents[i].position, trafficIncidents[j].position);
            const timeDiff = Math.abs(new Date(trafficIncidents[i].lastReported!).getTime() - new Date(trafficIncidents[j].lastReported!).getTime());
            
            if (distance <= distanceThreshold && timeDiff <= timeThreshold) {
                currentCluster.push(trafficIncidents[j]);
                visited.add(trafficIncidents[j].id);
            }
        }
        
        if (currentCluster.length > 2) { // Only consider clusters of 3 or more
            clusters.push(currentCluster);
        }
    }

    clusters.forEach((cluster, index) => {
        const centerLat = cluster.reduce((sum, p) => sum + p.position.lat, 0) / cluster.length;
        const centerLng = cluster.reduce((sum, p) => sum + p.position.lng, 0) / cluster.length;

        const timeFrameHours = Math.round(timeThreshold / (60 * 60 * 1000));

        alerts.push({
            id: `cluster-${index}`,
            title: `Cluster de ${cluster.length} Acidentes de Trânsito`,
            description: `${cluster.length} acidentes reportados numa área de ${distanceThreshold}m nas últimas ${timeFrameHours} horas.`,
            location: { lat: centerLat, lng: centerLng },
            incidentCount: cluster.length,
            incidentIds: cluster.map(p => p.id),
            priority: 'medium',
            type: 'cluster',
        });
    });

    return alerts.sort((a, b) => (a.priority === 'high' ? -1 : 1));
};

    