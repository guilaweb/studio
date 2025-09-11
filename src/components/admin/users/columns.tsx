

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserProfile, UserProfileWithStats } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronsUpDown, MoreHorizontal, Link as LinkIcon, Car } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import MaintenancePlanSelector from "./maintenance-plan-selector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

type RoleUpdateHandler = (uid: string, role: UserProfile['role']) => Promise<void>;
type UserUpdateHandler = (uid: string, data: Partial<UserProfile>) => Promise<void>;

const RoleSelector = ({ user, onUpdateUserRole, agentCount, agentLimit }: { user: UserProfile, onUpdateUserRole: RoleUpdateHandler, agentCount: number, agentLimit: number }) => {
    const { profile: currentProfile } = useAuth();
    const [currentRole, setCurrentRole] = React.useState(user.role);
    const { toast } = useToast();
    
    const isAgentLimitReached = agentLimit !== -1 && agentCount >= agentLimit;
    const canBecomeAgent = user.role !== 'Agente Municipal' && isAgentLimitReached;

    const handleRoleChange = async (newRole: UserProfile['role']) => {
        if (newRole === currentRole) return;
        if (newRole === 'Agente Municipal' && canBecomeAgent) {
             toast({
                variant: "destructive",
                title: "Limite de Agentes Atingido",
                description: "O seu plano atual não permite adicionar mais agentes. Por favor, faça um upgrade.",
            });
            return;
        }

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

    const agentOption = (
        <DropdownMenuRadioItem value="Agente Municipal" disabled={canBecomeAgent}>
            Agente Municipal
        </DropdownMenuRadioItem>
    );

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
                     {canBecomeAgent ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>{agentOption}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Limite de agentes ({agentLimit}) atingido. <Link href="/admin/faturacao" className="font-bold underline">Faça um upgrade</Link>.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                     ) : agentOption }
                     <DropdownMenuRadioItem value="Administrador">Administrador</DropdownMenuRadioItem>
                     <DropdownMenuRadioItem value="Epidemiologista">Epidemiologista</DropdownMenuRadioItem>
                     {currentProfile?.role === 'Super Administrador' && (
                        <DropdownMenuRadioItem value="Super Administrador">Super Administrador</DropdownMenuRadioItem>
                     )}
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
            toast({ title: "Equipa atualizada!" });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao atualizar equipa" });
        }
    }
    
    if (user.role !== 'Agente Municipal') return null;

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
    )
}


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
        <div className="flex items-center gap-3 pl-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
            <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="grid">
            <span className="font-medium">{user.displayName}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Permissão",
    cell: ({ row, table }) => {
        const user = row.original;
        const { onUpdateUserRole, agentCount, agentLimit } = table.options.meta as any;
        return <RoleSelector user={user} onUpdateUserRole={onUpdateUserRole} agentCount={agentCount} agentLimit={agentLimit} />
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
    accessorKey: "vehicle",
    header: "Veículo",
    cell: ({ row, table }) => {
        const user = row.original;
        const { onEditVehicle } = table.options.meta as any;
        if (user.role !== 'Agente Municipal') return <div className="text-center text-muted-foreground">-</div>;
        
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEditVehicle(user)}>
                    <Car className="mr-2 h-4 w-4" />
                    {user.vehicle?.plate || 'Gerir Veículo'}
                </Button>
            </div>
        )
    }
  },
  {
    id: "maintenance",
    header: "Manutenção",
    cell: ({ row, table }) => {
        const user = row.original;
        const { onUpdateUserProfile } = table.options.meta as any;
        if (user.role !== 'Agente Municipal') return null;
        return <MaintenancePlanSelector user={user} onUpdateUserProfile={onUpdateUserProfile} />
    }
  },
  {
    accessorKey: "stats.contributions",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Contribs
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center font-medium">{row.original.stats.contributions}</div>
  },
  {
    id: "actions",
    cell: ({ row }) => {
        const user = row.original;
        const profileLink = user.role === 'Agente Municipal' ? `/admin/equipa/${user.uid}` : `/public-profile/${user.uid}`;
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
                        <Link href={profileLink} target="_blank">
                            <LinkIcon className="mr-2 h-4 w-4" /> Ver Perfil Detalhado
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
];
