

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
import { UserProfile, UserProfileWithStats } from "@/lib/data"


interface UserDataTableProps {
  columns: ColumnDef<UserProfileWithStats>[],
  data: UserProfileWithStats[],
  onUpdateUserRole: (uid: string, role: UserProfile['role']) => Promise<void>,
  onUpdateUserProfile: (uid: string, data: Partial<UserProfile>) => Promise<void>,
  onEditVehicle: (user: UserProfile) => void;
  agentCount: number;
  agentLimit: number;
}

export function UserDataTable({
  columns,
  data,
  onUpdateUserRole,
  onUpdateUserProfile,
  onEditVehicle,
  agentCount,
  agentLimit,
}: UserDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

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
            onUpdateUserRole,
            onUpdateUserProfile,
            onEditVehicle,
            agentCount,
            agentLimit,
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
             <div className="text-sm text-muted-foreground">
                Agentes Municipais: <strong>{agentCount}</strong> / <strong>{agentLimit === -1 ? 'Ilimitados' : agentLimit}</strong>
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

