
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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, X, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CSVLink } from "react-csv";
import { CostItem } from "@/app/admin/relatorios/page";

interface ReportsDataTableProps {
  columns: ColumnDef<CostItem>[];
  data: CostItem[];
}

export function ReportsDataTable({ columns, data }: ReportsDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [date, setDate] = React.useState<DateRange | undefined>();

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
    
    React.useEffect(() => {
        table.getColumn('date')?.setFilterValue(date ? [date.from, date.to] : undefined);
    }, [date, table]);
    
    const csvData = React.useMemo(() => {
        return table.getFilteredRowModel().rows.map(row => row.original);
    }, [table.getFilteredRowModel().rows]);

    const csvHeaders = [
        { label: "Data", key: "date" },
        { label: "Veículo", key: "vehiclePlate" },
        { label: "Motorista", key: "driverName" },
        { label: "Tipo", key: "type" },
        { label: "Descrição", key: "description" },
        { label: "Custo (AOA)", key: "cost" },
        { label: "Custo Peças (AOA)", key: "partsCost"},
        { label: "Custo Mão de Obra (AOA)", key: "laborCost"},
    ];
    
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
    <div>
        <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <Input
                placeholder="Filtrar por veículo..."
                value={(table.getColumn("vehiclePlate")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("vehiclePlate")?.setFilterValue(event.target.value)}
                className="max-w-sm h-9"
            />
            <div className="flex gap-2 flex-wrap justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9">
                            <ChevronDown className="mr-2 h-4 w-4" /> Tipo de Custo
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {['Combustível', 'Manutenção'].map(type => (
                            <DropdownMenuCheckboxItem
                                key={type}
                                checked={(table.getColumn("type")?.getFilterValue() as string[] || []).includes(type)}
                                onCheckedChange={(value) => {
                                    const currentFilter = table.getColumn("type")?.getFilterValue() as string[] || [];
                                    const newFilter = value ? [...currentFilter, type] : currentFilter.filter(t => t !== type);
                                    table.getColumn("type")?.setFilterValue(newFilter.length ? newFilter : undefined);
                                }}
                            >
                                {type}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn("h-9 w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Selecione um intervalo</span>)}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                    </PopoverContent>
                </Popover>
                 {isFiltered && (
                    <Button variant="ghost" onClick={() => { table.resetColumnFilters(); setDate(undefined); }} className="h-9 px-2 lg:px-3">
                        Limpar <X className="ml-2 h-4 w-4" />
                    </Button>
                 )}
                 <CSVLink data={csvData} headers={csvHeaders} filename={`relatorio_custos_${new Date().toISOString().split('T')[0]}.csv`}>
                    <Button variant="outline" className="h-9">
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                 </CSVLink>
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
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                    )
                })}
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
