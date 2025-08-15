
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapPin } from 'lucide-react';
import { IncidentClusterAlert } from '@/services/alert-service';
import { Button } from '../ui/button';


interface IntelligentAlertsProps {
    alerts: IncidentClusterAlert[];
    onViewOnMap: (id: string) => void;
}

const IntelligentAlerts: React.FC<IntelligentAlertsProps> = ({ alerts, onViewOnMap }) => {
    if (alerts.length === 0) {
        return null; // Don't render the card if there are no alerts
    }

    return (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <CardTitle className="text-yellow-800 dark:text-yellow-300">Alertas Inteligentes</CardTitle>
                </div>
                <CardDescription className="text-yellow-700 dark:text-yellow-400">
                    Clusters de incidentes detetados automaticamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert.id} className="p-3 rounded-lg bg-background/70 border">
                           <p className="text-sm font-semibold">{alert.title}</p>
                           <p className="text-xs text-muted-foreground">{alert.description}</p>
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
