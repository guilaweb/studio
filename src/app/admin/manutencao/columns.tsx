
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PointOfInterest, priorityLabelMap, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Car } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const priorityVariant = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Serviço <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
        <div className="grid pl-4">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-xs text-muted-foreground">ID: {row.original.id}</span>
        </div>
    ),
  },
  {
    accessorKey: "vehiclePlate",
    header: "Veículo",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Car className="h-4 w-4 text-muted-foreground" />
        {row.original.customData?.vehiclePlate || 'N/A'}
      </div>
    )
  },
  {
    accessorKey: "priority",
    header: "Prioridade",
    cell: ({ row }) => {
      const priority = row.original.priority;
      if (!priority) return "N/A";
      return <Badge variant={priorityVariant[priority]}>{priorityLabelMap[priority]}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return "N/A";
      return <Badge variant="outline">{statusLabelMap[status] || status}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Custo (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-mono">{(row.original.cost ?? 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>
  },
  {
    accessorKey: "lastReported",
    header: "Data",
    cell: ({ row }) => format(new Date(row.original.lastReported!), "dd/MM/yyyy"),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
        const order = row.original;
        const { onEditOrder } = table.options.meta as any;

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
                    <DropdownMenuItem onClick={() => onEditOrder(order)}>
                        <Edit className="mr-2 h-4 w-4"/> Gerir Ordem de Serviço
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
];
