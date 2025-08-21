

"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PointOfInterest, priorityLabelMap, statusLabelMap, typeLabelMap } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal, ArrowUp, ArrowRight, ArrowDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import React from "react"
import DeleteConfirmationDialog from "../delete-confirmation-dialog"
import { useAuth } from "@/hooks/use-auth"
import { usePoints } from "@/hooks/use-points"

const typeVariantMap: { [key in PointOfInterest['type']]: "default" | "secondary" | "destructive" | "outline" } = {
    atm: "default",
    construction: "secondary",
    incident: "destructive",
    sanitation: "outline",
    water: "default",
    land_plot: "secondary",
    announcement: "default",
    water_resource: "default"
}

const priorityIcons = {
    high: { icon: ArrowUp, color: "text-red-500", label: "Alta" },
    medium: { icon: ArrowRight, color: "text-yellow-500", label: "Média" },
    low: { icon: ArrowDown, color: "text-green-500", label: "Baixa" },
}

const ActionsCell = ({ row, table }: { row: any, table: any }) => {
    const poi = row.original as PointOfInterest;
    const { profile } = useAuth();
    const { deletePoint } = usePoints();
    const { onViewOnMap } = table.options.meta as any;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        await deletePoint(poi.id);
        setIsDeleteDialogOpen(false);
    };
    
    const isAdmin = profile?.role === 'Administrador';

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
                <DropdownMenuItem onClick={() => onViewOnMap?.(poi.id)}>
                    Ver detalhes no mapa
                </DropdownMenuItem>
                 {poi.authorId && poi.authorId !== 'system' && (
                    <DropdownMenuItem asChild>
                        <Link href={`/public-profile/${poi.authorId}`}>
                            Ver perfil do autor
                        </Link>
                    </DropdownMenuItem>
                 )}
                 {isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Eliminar
                        </DropdownMenuItem>
                    </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DeleteConfirmationDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
            />
        </>
    )
}


export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => <div className="pl-4">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
        const type = row.getValue("type") as PointOfInterest['type']
        return <Badge variant={typeVariantMap[type]}>{typeLabelMap[type]}</Badge>
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
    {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prioridade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as PointOfInterest['priority'];
      if (!priority || !priorityIcons[priority]) {
        return <div className="text-center text-muted-foreground">-</div>;
      }
      const { icon: Icon, color, label } = priorityIcons[priority];
      return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 justify-center">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="sr-only">{label}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Prioridade: {label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      );
    },
     filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as PointOfInterest['status']
        if (!status) {
            return <span className="text-muted-foreground">N/A</span>
        }
        return <span>{statusLabelMap[status]}</span>
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
   {
    accessorKey: "lastReported",
    header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Último Reporte
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )
    },
    cell: ({ row }) => {
        const date = row.getValue("lastReported") as string | undefined;
        if (!date) {
            return <div className="text-center">-</div>
        }
        return <div className="text-left font-medium">{new Date(date).toLocaleDateString('pt-PT')}</div>
    },
    filterFn: (row, id, value) => {
        const date = row.getValue(id) as string;
        if (!date) return false;

        const [start, end] = value as string[];
        const reportDate = new Date(date);
        
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        return reportDate >= startDate && reportDate <= endDate;
    }
   },
  {
    id: "actions",
    cell: ActionsCell
  },
]
