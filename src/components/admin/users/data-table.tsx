
"use client"

import * as React from "react"
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
} from "@tanstack/react-table"

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
import { UserProfile } from "@/lib/data"


interface UserDataTableProps<TData, TValue> {
  data: TData[],
  onUpdateUserRole: (uid: string, role: UserProfile['role']) => Promise<void>
}

export function UserDataTable<TData, TValue>({
  data,
  onUpdateUserRole
}: UserDataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const columns: ColumnDef<TData, TValue>[] = (React.useMemo(() => {
        // Dynamically import columns to avoid circular dependencies if columns import this table
        // This is a common pattern for creating modular and reusable table components
        const { columns: userColumns } = require('./columns');
        return userColumns;
    }, []) as ColumnDef<TData, TValue>[]);


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
        meta: {
            onUpdateUserRole
        }
    });

  return (
    <div>
        <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <Input
                placeholder="Filtrar por nome ou email..."
                value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("displayName")?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-9"
            />
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

