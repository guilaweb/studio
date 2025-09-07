
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CostItem } from "@/app/admin/relatorios/page";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<CostItem>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.original.date), "dd/MM/yyyy"),
  },
  {
    accessorKey: "vehiclePlate",
    header: "Veículo",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.vehiclePlate}</span>
        <span className="text-xs text-muted-foreground">{row.original.driverName}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant={row.original.type === 'Combustível' ? 'secondary' : 'destructive'}>
        {row.original.type}
      </Badge>
    ),
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
  },
   {
    accessorKey: "partsCost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Custo Peças (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.partsCost?.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) || '0.00'}
      </div>
    ),
  },
    {
    accessorKey: "laborCost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Mão de Obra (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.laborCost?.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) || '0.00'}
      </div>
    ),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Custo Total (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono font-bold">
        {row.original.cost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
      </div>
    ),
  },
];
