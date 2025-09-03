

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
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PointOfInterest, priorityLabelMap, statusLabelMap, typeLabelMap } from "@/lib/data"
import { ChevronDown, X, Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import CsvExportButton from "./csv-export-button"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onViewOnMap: (id: string) => void;
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
    table.getColumn('lastReported')?.setFilterValue(date ? [date.from?.toISOString(), date.to?.toISOString()] : undefined)
  }, [date, table]);


  const isFiltered = table.getState().columnFilters.length > 0 || date;
  
  // Use the first column as the default for text search
  const firstColumn = table.getAllColumns()[0];

  return (
    <div>
        <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <Input
                placeholder="Filtrar por texto..."
                value={(firstColumn?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    firstColumn?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-9"
            />
            <div className="flex gap-2 flex-wrap justify-end flex-1">
                 {table.getColumn("type") && typeLabelMap && (
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
                 {table.getColumn("priority") && priorityLabelMap && (
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
                 {table.getColumn("status") && statusLabelMap && (
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
                <CsvExportButton table={table} />
            </div>
        </div>
        <div className="rounded-md border">
        <UITable>
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
        </UITable>
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
