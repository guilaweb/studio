
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PointOfInterest, statusLabelMap, typeLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronsUpDown, MoreHorizontal, Lightbulb, Zap, Edit, MapPin } from "lucide-react";
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

export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        ID do Ativo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const asset = row.original;
      return (
        <div className="grid pl-4 font-mono text-xs">
            {asset.title}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
        const type = row.original.type;
        const Icon = type === 'lighting_pole' ? Lightbulb : Zap;
        return <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{typeLabelMap[type]}</span>
        </div>
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "status",
    header: "Estado Operacional",
    cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return "N/A";
        const isFunctional = status === 'funcional';
        return <Badge variant={isFunctional ? "default" : "destructive"} className={isFunctional ? "bg-green-600" : ""}>
            {statusLabelMap[status]}
        </Badge>
    },
     filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "lastReported",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data de Instalação
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
        const asset = row.original;
        const { onViewOnMap, onEdit } = table.options.meta as any;

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
                    <DropdownMenuItem onClick={() => onViewOnMap(asset.id)}>
                        <MapPin className="mr-2 h-4 w-4"/> Ver no Mapa
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => onEdit(asset)}>
                        <Edit className="mr-2 h-4 w-4"/> Editar Ativo
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
];
