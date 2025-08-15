
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

export const calculateIncidentPriority = (title: string, description: string): PointOfInterest['priority'] => {
    const highPriorityKeywords = ['grave', 'urgente', 'perigo', 'fatal', 'atropelamento', 'colisão grave'];
    const mediumPriorityKeywords = ['danificado', 'defeito', 'colisão ligeira', 'semáforo', 'iluminação', 'obstrução'];
    
    const text = `${title.toLowerCase()} ${description.toLowerCase()}`;

    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'high';
    }
    if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'medium';
    }
    return 'low';
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


    // Cluster Alerts
    const clusters: PointOfInterest[][] = [];
    const visited = new Set<string>();

    for (let i = 0; i < incidents.length; i++) {
        if (visited.has(incidents[i].id)) continue;

        const currentCluster: PointOfInterest[] = [incidents[i]];
        visited.add(incidents[i].id);

        for (let j = i + 1; j < incidents.length; j++) {
            if (visited.has(incidents[j].id)) continue;
            
            const distance = getDistance(incidents[i].position, incidents[j].position);
            const timeDiff = Math.abs(new Date(incidents[i].lastReported!).getTime() - new Date(incidents[j].lastReported!).getTime());
            
            if (distance <= distanceThreshold && timeDiff <= timeThreshold) {
                currentCluster.push(incidents[j]);
                visited.add(incidents[j].id);
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
            title: `Cluster de ${cluster.length} Incidentes`,
            description: `${cluster.length} incidentes reportados numa área de ${distanceThreshold}m nas últimas ${timeFrameHours} horas.`,
            location: { lat: centerLat, lng: centerLng },
            incidentCount: cluster.length,
            incidentIds: cluster.map(p => p.id),
            priority: 'medium',
            type: 'cluster',
        });
    });

    return alerts.sort((a, b) => (a.priority === 'high' ? -1 : 1));
};
