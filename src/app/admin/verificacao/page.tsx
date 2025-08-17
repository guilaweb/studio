
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoints } from "@/hooks/use-points";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PointOfInterest } from "@/lib/data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/projetos/data-table"; // Reusing this data-table component

const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: "Imóvel / Lote",
    cell: ({ row }) => {
      const property = row.original;
      return (
        <div className="grid">
            <span className="font-medium">{property.title}</span>
            <span className="text-xs text-muted-foreground">ID: {property.id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "authorDisplayName",
    header: "Requerente",
  },
  {
    accessorKey: "lastReported",
    header: "Data de Submissão",
    cell: ({ row }) => new Date(row.original.lastReported!).toLocaleDateString('pt-PT'),
  },
  {
    id: "actions",
    cell: ({ row }) => (
        <Button asChild variant="outline" size="sm">
            <Link href={`/admin/verificacao/${row.original.id}`}>
                Verificar
            </Link>
        </Button>
    ),
  }
];

function AdminPropertyVerificationPage() {
    const { allData, loading } = usePoints();

    const propertiesToVerify = React.useMemo(() => {
        return allData.filter(p => p.type === 'land_plot' && p.status === 'em_verificacao');
    }, [allData]);

    if (loading) {
        return <div>A carregar imóveis para verificação...</div>;
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
                    Verificação de Imóveis
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Imóveis Pendentes de Verificação</CardTitle>
                        <CardDescription>
                            Analise e valide os pedidos de registo de imóveis submetidos pelos cidadãos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} 
                            data={propertiesToVerify} 
                            onUpdateProjectStatus={() => Promise.resolve()} // Not needed here
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(AdminPropertyVerificationPage, ['Agente Municipal', 'Administrador']);
