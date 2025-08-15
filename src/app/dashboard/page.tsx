
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { usePoints } from "@/hooks/use-points";
import { Layer } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const chartConfig = {
  reports: {
    label: "Reportes",
  },
  incident: {
    label: "Incidentes",
    color: "hsl(var(--accent))",
  },
  construction: {
    label: "Obras",
    color: "hsl(var(--secondary))",
  },
  atm: {
    label: "ATMs",
    color: "hsl(var(--primary))",
  },
  sanitation: {
    label: "Saneamento",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { allData } = usePoints();

  const chartData = React.useMemo(() => {
    const counts = allData.reduce((acc, point) => {
      acc[point.type] = (acc[point.type] || 0) + 1;
      return acc;
    }, {} as Record<Layer, number>);

    return Object.entries(counts).map(([name, total]) => ({
      name: chartConfig[name as Layer]?.label || name,
      total,
      fill: `var(--color-${name})`,
    }));
  }, [allData]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Button size="icon" variant="outline" asChild>
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Voltar ao Mapa</span>
                </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Painel Municipal
            </h1>
        </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral dos Reportes</CardTitle>
            <CardDescription>
              Número total de pontos de interesse registados por categoria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                   <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                   />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="total" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
