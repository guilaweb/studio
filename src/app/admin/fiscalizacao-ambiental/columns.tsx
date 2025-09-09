
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PointOfInterest, priorityLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronsUpDown, MoreHorizontal, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import { Badge } from "@/components/ui/badge";

const priorityIcons = {
    high: { icon: ArrowUp, color: "text-red-500", label: "Alta" },
    medium: { icon: ArrowRight, color: "text-yellow-500", label: "Média" },
    low: { icon: ArrowDown, color: "text-green-500", label: "Baixa" },
};

export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Ocorrência
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const report = row.original;
      return (
        <div className="grid pl-4">
            <span className="font-medium">{report.description.substring(0, 50)}...</span>
            <span className="text-xs text-muted-foreground">ID: {report.id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Gravidade",
    cell: ({ row }) => {
        const priority = row.original.priority;
        if (!priority) return "N/A";
        const Icon = priorityIcons[priority].icon;
        return <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${priorityIcons[priority].color}`} />
            <span>{priorityLabelMap[priority]}</span>
        </div>
    }
  },
  {
    accessorKey: "authorDisplayName",
    header: "Autor",
  },
  {
    accessorKey: "lastReported",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data do Reporte
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
    cell: ({ row, table }) => {
        const report = row.original;
        const { onViewOnMap } = table.options.meta as any;

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
                    <DropdownMenuItem onClick={() => onViewOnMap(report.id)}>
                        Ver no Mapa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
];
