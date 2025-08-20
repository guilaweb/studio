

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PointOfInterest, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type StatusUpdateHandler = (uid: string, status: PointOfInterest['status']) => Promise<void>;

const StatusSelector = ({ project, onUpdateProjectStatus }: { project: PointOfInterest, onUpdateProjectStatus: StatusUpdateHandler }) => {
    const [currentStatus, setCurrentStatus] = React.useState(project.status);
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: PointOfInterest['status']) => {
        if (newStatus === currentStatus) return;
        try {
            await onUpdateProjectStatus(project.id, newStatus);
            setCurrentStatus(newStatus);
            toast({
                title: "Estado atualizado!",
                description: `O projeto "${project.title}" foi atualizado para: ${statusLabelMap[newStatus!]}.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar estado",
                description: "Não foi possível alterar o estado do projeto.",
            });
            console.error(error);
        }
    }

    const availableStatuses: PointOfInterest['status'][] = ['submitted', 'under_review', 'approved', 'rejected'];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-40 justify-between">
                    {currentStatus ? statusLabelMap[currentStatus] : 'N/A'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={currentStatus} onValueChange={(value) => handleStatusChange(value as PointOfInterest['status'])}>
                    {availableStatuses.map(status => (
                        <DropdownMenuRadioItem key={status} value={status}>
                            {statusLabelMap[status!]}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Projeto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="grid pl-4">
            <span className="font-medium">{project.title}</span>
            <span className="text-xs text-muted-foreground" title={project.landPlotId}>Lote: {project.landPlotId ? `${project.landPlotId.substring(0, 15)}...` : 'N/A'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "authorDisplayName",
     header: "Requerente",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row, table }) => {
        const project = row.original;
        const { onUpdateProjectStatus } = table.options.meta as any;
        return <StatusSelector project={project} onUpdateProjectStatus={onUpdateProjectStatus} />
    }
  },
   {
    accessorKey: "lastReported",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data de Submissão
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.lastReported;
      if (!date) return <div className="text-center">-</div>;
      return <div className="text-center">{new Date(date).toLocaleDateString('pt-PT')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
        const project = row.original;
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/projetos/${project.id}`}>
                            Ver Detalhes do Projeto
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
];
