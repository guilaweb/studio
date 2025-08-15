
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
import Link from "next/link"

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

const statusLabelMap: { [key in NonNullable<PointOfInterest['status']>]: string } = {
    available: "Disponível",
    unavailable: "Indisponível",
    unknown: "Desconhecido",
    collected: "Recolhido",
    full: "Cheio",
    damaged: "Danificado",
    in_progress: "Em Resolução",
};


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
        if (!status) {
            return <span className="text-muted-foreground">N/A</span>
        }
        return <span>{statusLabelMap[status]}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const poi = row.original
      const { onViewOnMap } = table.options.meta as any;
 
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
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
