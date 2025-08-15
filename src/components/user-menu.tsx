
"use client";

import { User } from "firebase/auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserProfile } from "@/lib/data";
import { LayoutDashboard, LogOut, Megaphone, User as UserIcon } from "lucide-react";


interface UserMenuProps {
    user: User | null;
    loading: boolean;
    logout: () => void;
    profile: UserProfile | null;
}

export function UserMenu({ user, loading, logout, profile }: UserMenuProps) {
    if (loading) {
      return null;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Registar</Link>
            </Button>
        </div>
      )
    }

    const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                        <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                         {profile && <p className="text-xs font-semibold leading-none text-primary pt-1">{profile.role}</p>}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/perfil">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                    </Link>
                </DropdownMenuItem>
                
                {isManager && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Painel Municipal</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/comunicacoes">
                                <Megaphone className="mr-2 h-4 w-4" />
                                <span>Comunicações</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
  }
