
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapPin, Users } from 'lucide-react';
import { IncidentClusterAlert } from '@/services/alert-service';
import { Button } from '../ui/button';


interface IntelligentAlertsProps {
    alerts: IncidentClusterAlert[];
    onViewOnMap: (id: string) => void;
}

const IntelligentAlerts: React.FC<IntelligentAlertsProps> = ({ alerts, onViewOnMap }) => {
    if (alerts.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                        <CardTitle>Alertas Inteligentes</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Não foram detetados novos alertas ou clusters de incidentes.</p>
                </CardContent>
            </Card>
        )
    }
    
    const highPriorityAlerts = alerts.filter(a => a.priority === 'high');
    const mediumPriorityAlerts = alerts.filter(a => a.priority === 'medium');

    return (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <CardTitle className="text-yellow-800 dark:text-yellow-300">Alertas Inteligentes</CardTitle>
                </div>
                <CardDescription className="text-yellow-700 dark:text-yellow-400">
                    Incidentes de alta prioridade e clusters detetados automaticamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {highPriorityAlerts.map(alert => (
                        <div key={alert.id} className="p-3 rounded-lg bg-red-100/80 dark:bg-red-900/20 border border-red-300 dark:border-red-800">
                           <div className="flex items-center gap-2">
                             <AlertTriangle className="h-4 w-4 text-red-600" />
                             <p className="text-sm font-semibold text-red-800 dark:text-red-200">{alert.title}</p>
                           </div>
                           <p className="text-xs text-red-700 dark:text-red-300 mt-1">{alert.description}</p>
                           <Button 
                             size="sm" 
                             variant="link" 
                             className="p-0 h-auto mt-1 text-red-600 dark:text-red-400"
                             onClick={() => onViewOnMap(alert.incidentIds[0])}
                            >
                                <MapPin className="mr-1 h-3 w-3" />
                                Ver no mapa
                           </Button>
                        </div>
                    ))}
                    {mediumPriorityAlerts.map(alert => (
                        <div key={alert.id} className="p-3 rounded-lg bg-background/70 border">
                           <div className="flex items-center gap-2">
                             <Users className="h-4 w-4 text-primary" />
                             <p className="text-sm font-semibold">{alert.title}</p>
                           </div>
                           <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                           <Button 
                             size="sm" 
                             variant="link" 
                             className="p-0 h-auto mt-1"
                             onClick={() => onViewOnMap(alert.incidentIds[0])}
                            >
                                <MapPin className="mr-1 h-3 w-3" />
                                Ver no mapa
                           </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default IntelligentAlerts;
