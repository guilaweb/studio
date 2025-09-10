
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { typeLabelMap } from "@/lib/data";
import { AssetCost } from "@/app/admin/iluminacao-publica/analise-custos/page";

export const columns: ColumnDef<AssetCost>[] = [
  {
    accessorKey: "title",
    header: "ID do Ativo",
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline">
        {typeLabelMap[row.original.type as keyof typeof typeLabelMap]}
      </Badge>
    ),
  },
  {
    accessorKey: "totalRepairs",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nº de Avarias <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center font-medium">{row.original.totalRepairs}</div>,
  },
  {
    accessorKey: "totalPartsCost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Custo Peças (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.totalPartsCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
      </div>
    ),
  },
  {
    accessorKey: "totalLaborCost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Mão de Obra (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.totalLaborCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
      </div>
    ),
  },
  {
    accessorKey: "totalCost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Custo Total (AOA) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono font-bold text-primary">
        {row.original.totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
      </div>
    ),
  },
];
