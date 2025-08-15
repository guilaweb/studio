
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PointOfInterest } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const typeVariantMap: { [key in PointOfInterest['type']]: "default" | "secondary" | "destructive" | "outline" } = {
    atm: "default",
    construction: "secondary",
    incident: "destructive",
    sanitation: "outline"
}

const typeLabelMap: { [key in PointOfInterest['type']]: string } = {
    atm: "ATM",
    construction: "Obra",
    incident: "Incidente",
    sanitation: "Saneamento"
}


export const columns: ColumnDef<PointOfInterest>[] = [
  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
        const type = row.getValue("type") as PointOfInterest['type']
        return <Badge variant={typeVariantMap[type]}>{typeLabelMap[type]}</Badge>
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as PointOfInterest['status']
        return status ? <span className="capitalize">{status}</span> : <span className="text-muted-foreground">N/A</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const poi = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(poi.id)}>
              Copiar ID do Reporte
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalhes no mapa</DropdownMenuItem>
            <DropdownMenuItem>Ver perfil do autor</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
