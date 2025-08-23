
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PointOfInterest, announcementCategoryMap, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronsUpDown, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { usePoints } from "@/hooks/use-points";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";

export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Título
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const announcement = row.original;
      return (
        <div className="grid pl-4">
            <span className="font-medium">{announcement.title}</span>
            <span className="text-xs text-muted-foreground">ID: {announcement.id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "announcementCategory",
    header: "Categoria",
    cell: ({ row }) => {
        const category = row.original.announcementCategory;
        if (!category) return "N/A";
        return <Badge variant="secondary">{announcementCategoryMap[category]}</Badge>
    }
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Início
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.startDate;
      if (!date) return <div className="text-center">-</div>;
      return <div className="text-center">{new Date(date).toLocaleDateString('pt-PT')}</div>;
    },
  },
   {
    accessorKey: "endDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Fim
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.endDate;
      if (!date) return <div className="text-center">-</div>;
      return <div className="text-center">{new Date(date).toLocaleDateString('pt-PT')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
        const announcement = row.original;
        const { deletePoint } = usePoints();
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
        const { onEdit } = table.options.meta as any;

        const handleDelete = async () => {
           await deletePoint(announcement.id);
        }

        return (
            <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(announcement)}>
                        Editar Anúncio
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteConfirmationDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
            />
            </>
        )
    }
  }
];
