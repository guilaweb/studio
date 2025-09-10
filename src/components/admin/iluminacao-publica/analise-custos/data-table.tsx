
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import { AssetCost } from "@/app/admin/iluminacao-publica/analise-custos/page";

interface DataTableProps {
  columns: ColumnDef<AssetCost>[];
  data: AssetCost[];
}

export function DataTable({ columns, data }: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'totalCost', desc: true }]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { sorting, columnFilters },
    });

    const csvData = React.useMemo(() => {
        return table.getFilteredRowModel().rows.map(row => row.original);
    }, [table.getFilteredRowModel().rows]);

    const csvHeaders = [
        { label: "ID do Ativo", key: "title" },
        { label: "Tipo", key: "type" },
        { label: "Total de Reparos", key: "totalRepairs" },
        { label: "Custo Total de Peças (AOA)", key: "totalPartsCost" },
        { label: "Custo Total de Mão-de-Obra (AOA)", key: "totalLaborCost" },
        { label: "Custo Total (AOA)", key: "totalCost" },
    ];

    return (
    <div>
        <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <Input
                placeholder="Filtrar por ID do ativo..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
                className="max-w-sm h-9"
            />
            <CSVLink data={csvData} headers={csvHeaders} filename={`relatorio_custos_iluminacao_${new Date().toISOString().split('T')[0]}.csv`}>
                <Button variant="outline" className="h-9">
                    <Download className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
            </CSVLink>
        </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                ))}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    Sem resultados.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Seguinte
            </Button>
        </div>
    </div>
  )
}
