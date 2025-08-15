
"use client";

import { PointOfInterest } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { pt } from 'date-fns/locale';

const RecentActivityFeed = ({ data }: { data: PointOfInterest[] }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const recentPoints = data
        .sort((a, b) => {
            const dateA = a.lastReported ? new Date(a.lastReported).getTime() : 0;
            const dateB = b.lastReported ? new Date(b.lastReported).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Os últimos reportes e atualizações dos cidadãos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentPoints.map(point => (
                        <div key={point.id} className="flex items-center gap-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <div className="flex-1">
                               <p className="text-sm font-medium leading-none">{point.title}</p>
                               <p className="text-sm text-muted-foreground">
                                {isClient ? `Reportado ${point.lastReported ? formatDistanceToNow(new Date(point.lastReported), { addSuffix: true, locale: pt}) : 'recentemente'}` : 'A carregar...'}
                               </p>
                           </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentActivityFeed;
