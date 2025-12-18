
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PointOfInterest, priorityLabelMap, statusLabelMap } from "@/lib/data";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";

interface DataTableProps {
  columns: ColumnDef<PointOfInterest>[],
  data: PointOfInterest[],
  meta: any,
}

export function MaintenanceDataTable({
  columns,
  data,
  meta,
}: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'lastReported', desc: true }]);
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
        state: {
            sorting,
            columnFilters,
        },
        meta: meta
    });
    
    const isFiltered = table.getState().columnFilters.length > 0;


  return (
    <div>
        <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <Input
                placeholder="Filtrar por serviço ou ID..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-9"
            />
            <div className="flex gap-2">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9">
                            <ChevronDown className="mr-2 h-4 w-4" /> Prioridade
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {Object.entries(priorityLabelMap).map(([key, label]) => (
                            <DropdownMenuCheckboxItem
                                key={key}
                                checked={(table.getColumn("priority")?.getFilterValue() as string[] || []).includes(key)}
                                onCheckedChange={(value) => {
                                    const currentFilter = table.getColumn("priority")?.getFilterValue() as string[] || [];
                                    const newFilter = value ? [...currentFilter, key] : currentFilter.filter(k => k !== key);
                                    table.getColumn("priority")?.setFilterValue(newFilter.length ? newFilter : undefined)
                                }}
                            >
                                {label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9">
                            <ChevronDown className="mr-2 h-4 w-4" /> Estado
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {['Pendente', 'Em Oficina', 'Concluído'].map(status => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={(table.getColumn("status")?.getFilterValue() as string[] || []).includes(status)}
                                onCheckedChange={(value) => {
                                    const currentFilter = table.getColumn("status")?.getFilterValue() as string[] || [];
                                    const newFilter = value ? [...currentFilter, status] : currentFilter.filter(k => k !== status);
                                    table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined)
                                }}
                            >
                                {status}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                 {isFiltered && (
                    <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-9 px-2 lg:px-3">
                        Limpar <X className="ml-2 h-4 w-4" />
                    </Button>
                 )}
            </div>
        </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id}>
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </TableHead>
                    )
                })}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                >
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
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            Anterior
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            Seguinte
            </Button>
        </div>
    </div>
  )
}
