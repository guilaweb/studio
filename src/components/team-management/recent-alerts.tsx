
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, Info, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/button';

export interface Alert {
    id: string;
    time: string;
    description: string;
    level: 'critical' | 'warning' | 'info' | 'predictive';
}

const alertConfig = {
    critical: { icon: AlertTriangle, color: 'text-red-500' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    info: { icon: Info, color: 'text-blue-500' },
    predictive: { icon: BrainCircuit, color: 'text-purple-500' },
};

const RecentAlerts: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Central de Alertas Recentes</CardTitle>
                </div>
                <CardDescription>Últimos eventos importantes da frota.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[30vh] overflow-auto">
               {alerts.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">Nenhum alerta para mostrar.</p>
               ) : (
                alerts.map(alert => {
                   const config = alertConfig[alert.level];
                   return (
                        <div key={alert.id} className="flex items-start gap-3 p-2 rounded-md border bg-background">
                            <config.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                            <div>
                                <p className="text-sm font-medium">{alert.description}</p>
                                <p className="text-xs text-muted-foreground">{new Date(alert.time).toLocaleTimeString('pt-PT')}</p>
                            </div>
                        </div>
                   )
               }))
               }
            </CardContent>
        </Card>
    );
};

export default RecentAlerts;
