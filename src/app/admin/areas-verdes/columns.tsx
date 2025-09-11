
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PointOfInterest, pestStatusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, MapPin, TreePine, Fence } from "lucide-react";
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

const typeLabelMap: Record<string, string> = {
    park: "Parque",
    square: "Praça",
    tree: "Árvore",
    other: "Outro",
}

export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome / ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
        <div className="grid pl-4">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-xs text-muted-foreground">{row.original.id}</span>
        </div>
    ),
  },
  {
    accessorKey: "greenAreaType",
    header: "Tipo",
    cell: ({ row }) => {
        const type = row.original.greenAreaType;
        if (!type) return "N/D";
        const Icon = type === 'tree' ? TreePine : Fence;
        return (
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{typeLabelMap[type] || "N/D"}</span>
            </div>
        )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "pestStatus",
    header: "Estado Fitossanitário",
    cell: ({ row }) => {
      const status = row.original.pestStatus;
      if (!status) return <div className="text-center text-muted-foreground">-</div>;
      
      const variant: "default" | "destructive" | "secondary" = 
        status === 'healthy' ? 'default' 
        : status === 'infested' ? 'destructive' 
        : 'secondary';
        
       const colorClass = status === 'healthy' ? 'bg-green-600' : '';

      return <Badge variant={variant} className={colorClass}>{pestStatusLabelMap[status]}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "lastPruning",
    header: "Última Poda",
    cell: ({ row }) => {
        const date = row.original.lastPruning;
        if (!date) return <div className="text-center text-muted-foreground">-</div>;
        return new Date(date).toLocaleDateString('pt-PT');
    }
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
    