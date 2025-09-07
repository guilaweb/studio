

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserProfile, UserProfileWithStats } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronsUpDown, MoreHorizontal, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/services/user-service";

type RoleUpdateHandler = (uid: string, role: UserProfile['role']) => Promise<void>;
type UserUpdateHandler = (uid: string, data: Partial<UserProfile>) => Promise<void>;


const RoleSelector = ({ user, onUpdateUserRole }: { user: UserProfile, onUpdateUserRole: RoleUpdateHandler }) => {
    const [currentRole, setCurrentRole] = React.useState(user.role);
    const { toast } = useToast();

    const handleRoleChange = async (newRole: UserProfile['role']) => {
        if (newRole === currentRole) return;
        try {
            await onUpdateUserRole(user.uid, newRole);
            setCurrentRole(newRole);
            toast({
                title: "Permissão atualizada!",
                description: `O utilizador ${user.displayName} é agora um ${newRole}.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar permissão",
                description: "Não foi possível alterar a permissão do utilizador.",
            });
            console.error(error);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-40 justify-between">
                    {currentRole}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => handleRoleChange(value as UserProfile['role'])}>
                     <DropdownMenuRadioItem value="Cidadao">Cidadao</DropdownMenuRadioItem>
                     <DropdownMenuRadioItem value="Agente Municipal">Agente Municipal</DropdownMenuRadioItem>
                     <DropdownMenuRadioItem value="Administrador">Administrador</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const TeamSelector = ({ user, onUpdateUserProfile }: { user: UserProfile, onUpdateUserProfile: UserUpdateHandler }) => {
    const [currentTeam, setCurrentTeam] = React.useState(user.team);
    const { toast } = useToast();

    const handleTeamChange = async (newTeam: UserProfile['team']) => {
        if (newTeam === currentTeam) return;
        try {
            await onUpdateUserProfile(user.uid, { team: newTeam });
            setCurrentTeam(newTeam);
            toast({
                title: "Equipa atualizada!",
                description: `${user.displayName} foi movido para a equipa de ${newTeam}.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar equipa",
                description: "Não foi possível alterar a equipa do utilizador.",
            });
        }
    };
    
    if (user.role !== 'Agente Municipal') return <div className="text-center text-muted-foreground">-</div>;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-40 justify-between">
                    {currentTeam || 'Sem Equipa'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={currentTeam} onValueChange={(value) => handleTeamChange(value as UserProfile['team'])}>
                     <DropdownMenuRadioItem value="Saneamento">Saneamento</DropdownMenuRadioItem>
                     <DropdownMenuRadioItem value="Eletricidade">Eletricidade</DropdownMenuRadioItem>
                     <DropdownMenuRadioItem value="Geral">Geral</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export const columns: ColumnDef<UserProfileWithStats>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Utilizador
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Link href={`/public-profile/${user.uid}`} className="flex items-center gap-3 pl-4 group hover:underline">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
            <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="grid">
            <span className="font-medium">{user.displayName}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Permissão",
    cell: ({ row, table }) => {
        const user = row.original;
        const { onUpdateUserRole } = table.options.meta as any;
        return <RoleSelector user={user} onUpdateUserRole={onUpdateUserRole} />
    }
  },
  {
    accessorKey: "team",
    header: "Equipa",
    cell: ({ row, table }) => {
        const user = row.original;
        const { onUpdateUserProfile } = table.options.meta as any;
        return <TeamSelector user={user} onUpdateUserProfile={onUpdateUserProfile} />
    }
  },
  {
    accessorKey: "stats.contributions",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Contribuições
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const stats = row.original.stats;
        return <div className="text-center font-medium">{stats.contributions}</div>
    }
  },
  {
    accessorKey: "stats.performanceScore",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Pontuação
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const score = row.original.stats.performanceScore;
        const colorClass = score && score >= 90 ? 'text-green-500' : score && score >= 70 ? 'text-yellow-500' : 'text-red-500';
        return (
            <div className={`text-center font-bold flex items-center justify-center gap-1 ${colorClass}`}>
                <TrendingUp className="h-4 w-4" />
                {score || 'N/A'}
            </div>
        )
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Membro Desde
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <div className="text-center">-</div>;
      return <div className="text-center">{new Date(date).toLocaleDateString('pt-PT')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
        const user = row.original;
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
                    <DropdownMenuItem asChild>
                        <Link href={`/public-profile/${user.uid}`}>
                            Ver Perfil Público
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
];

    
