
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PointOfInterest } from "@/lib/data"
import { ChevronDown, X, Calendar as CalendarIcon, Download } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CSVLink } from "react-csv";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onViewOnMap: (id: string) => void;
}

const typeLabelMap: { [key in PointOfInterest['type']]: string } = {
    atm: "ATM",
    construction: "Obra",
    incident: "Incidente",
    sanitation: "Saneamento"
}

const statusLabelMap: { [key in NonNullable<PointOfInterest['status']>]: string } = {
    available: "Disponível",
    unavailable: "Indisponível",
    unknown: "Desconhecido",
    collected: "Recolhido",
    full: "Cheio",
    damaged: "Danificado",
    in_progress: "Em Resolução",
};

const priorityLabelMap: { [key in NonNullable<PointOfInterest['priority']>]: string } = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
}


export function DataTable<TData extends PointOfInterest, TValue>({
  columns,
  data,
  onViewOnMap
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [date, setDate] = React.useState<DateRange | undefined>()
    const [isClient, setIsClient] = React.useState(false)

    React.useEffect(() => {
        setIsClient(true)
    }, [])


  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
        sorting,
        columnFilters,
        columnVisibility
    },
    meta: {
        onViewOnMap,
    }
  })

  React.useEffect(() => {
    if (date?.from && date?.to) {
        table.getColumn('lastReported')?.setFilterValue([date.from.toISOString(), date.to.toISOString()]);
    } else {
        table.getColumn('lastReported')?.setFilterValue(undefined);
    }
  }, [date, table]);

  const isFiltered = table.getState().columnFilters.length > 0;

  const csvData = React.useMemo(() => {
    const headers = [
        { label: "ID", key: "id" },
        { label: "Título", key: "title" },
        { label: "Tipo", key: "type" },
        { label: "Prioridade", key: "priority" },
        { label: "Descrição", key: "description" },
        { label: "Estado", key: "status" },
        { label: "Último Reporte", key: "lastReported" },
        { label: "Latitude", key: "position.lat" },
        { label: "Longitude", key: "position.lng" },
        { label: "ID do Autor", key: "authorId" },
    ];
    
    const data = table.getFilteredRowModel().rows.map(row => {
        const poi = row.original as PointOfInterest;
        return {
            ...poi,
            type: typeLabelMap[poi.type],
            priority: poi.priority ? priorityLabelMap[poi.priority] : "N/A",
            status: poi.status ? statusLabelMap[poi.status] : "N/A",
            lastReported: poi.lastReported ? new Date(poi.lastReported).toLocaleString('pt-PT') : "N/A"
        }
    });

    return { headers, data };

  }, [table.getFilteredRowModel().rows]);

  return (
    <div>
        <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <Input
                placeholder="Filtrar por título..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-9"
            />
            <div className="flex gap-2 flex-wrap justify-end flex-1">
                 {table.getColumn("type") && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9">
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Tipo
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.entries(typeLabelMap).map(([key, label]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    className="capitalize"
                                    checked={(table.getColumn("type")?.getFilterValue() as string[] || []).includes(key)}
                                    onCheckedChange={(value) => {
                                        const currentFilter = table.getColumn("type")?.getFilterValue() as string[] || [];
                                        const newFilter = value ? [...currentFilter, key] : currentFilter.filter(k => k !== key);
                                        table.getColumn("type")?.setFilterValue(newFilter.length ? newFilter : undefined)
                                    }}
                                >
                                    {label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                 {table.getColumn("priority") && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9">
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Prioridade
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.entries(priorityLabelMap).map(([key, label]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    className="capitalize"
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
                )}
                 {table.getColumn("status") && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9">
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Estado
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.entries(statusLabelMap).map(([key, label]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    className="capitalize"
                                    checked={(table.getColumn("status")?.getFilterValue() as string[] || []).includes(key)}
                                    onCheckedChange={(value) => {
                                         const currentFilter = table.getColumn("status")?.getFilterValue() as string[] || [];
                                        const newFilter = value ? [...currentFilter, key] : currentFilter.filter(k => k !== key);
                                        table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined)
                                    }}
                                >
                                    {label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "h-9 w-[260px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Selecione um intervalo</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                 {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                            setDate(undefined);
                        }}
                        className="h-9 px-2 lg:px-3"
                    >
                        Limpar
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                 )}
                {isClient && (
                    <Button variant="outline" className="h-9" asChild>
                        <CSVLink 
                            data={csvData.data}
                            headers={csvData.headers.map(h => ({label: h.label, key: h.key.replace('.', '_')}))}
                            filename={"reportes.csv"}
                            className="flex items-center"
                            target="_blank"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </CSVLink>
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
