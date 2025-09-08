
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoints } from "@/hooks/use-points";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Hospital } from "lucide-react";
import { PointOfInterest } from "@/lib/data";
import { DataTable } from "@/components/admin/projetos/data-table"; 
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: "Unidade Sanitária",
    cell: ({ row }) => {
      const unit = row.original;
      return (
        <div className="grid">
            <span className="font-medium">{unit.title}</span>
            <span className="text-xs text-muted-foreground">ID: {unit.id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "licensingStatus",
    header: "Estado da Licença",
    cell: ({ row }) => {
        const status = row.original.licensingStatus;
        if (!status) return <Badge variant="secondary">N/A</Badge>;

        const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            licensed: 'default',
            pending: 'secondary',
            expired: 'destructive',
            non_compliant: 'destructive'
        }
        const colorClassMap: Record<string, string> = {
            licensed: 'bg-green-600',
        }
        
        return <Badge variant={variantMap[status] || 'secondary'} className={colorClassMap[status] || ''}>{status}</Badge>;
    }
  },
  {
    accessorKey: "lastInspectionDate",
    header: "Última Vistoria",
    cell: ({ row }) => row.original.lastInspectionDate ? new Date(row.original.lastInspectionDate).toLocaleDateString('pt-PT') : 'Nunca',
  },
  {
    id: "actions",
    cell: ({ row }) => (
        <Button asChild variant="outline" size="sm">
            <Link href={`/admin/fiscalizacao-sanitaria/${row.original.id}`}>
                Ver Dossiê
            </Link>
        </Button>
    ),
  }
];


function HealthInspectionPage() {
    const { allData, loading } = usePoints();

    const healthUnits = React.useMemo(() => {
        return allData.filter(p => p.type === 'health_unit');
    }, [allData]);

    if (loading) {
        return <div>A carregar unidades sanitárias...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Fiscalização Sanitária
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Unidades Sanitárias Registadas</CardTitle>
                        <CardDescription>
                            Gira e fiscalize todas as unidades de saúde registadas na plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} 
                            data={healthUnits} 
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(HealthInspectionPage, ['Agente Municipal', 'Administrador', 'Epidemiologista']);

    
