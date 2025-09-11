
"use client";

import { User } from "firebase/auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { UserProfile } from "@/lib/data";
import { LayoutDashboard, LogOut, Megaphone, User as UserIcon, Users, FileText, Briefcase, ScanLine, Settings, Home, Building, ShieldCheck, Inbox, Droplets, GitBranch, Share2, AreaChart, Fuel, Wrench, Sun, Hospital, Stethoscope, CreditCard, Package, Bus, ListTodo, Lightbulb, Zap, HardHat, DollarSign, Trees, Bike } from "lucide-react";


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

    const isAgentOrAdmin = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador';
    const isAdmin = profile?.role === 'Administrador';
    const isHealthOfficial = isAdmin || profile?.role === 'Epidemiologista';

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
            <DropdownMenuContent className="w-64" align="end" forceMount>
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

                <DropdownMenuGroup>
                     <DropdownMenuLabel>Área Pessoal</DropdownMenuLabel>
                     <DropdownMenuItem asChild>
                        <Link href="/perfil">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Meu Perfil</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/inbox">
                            <Inbox className="mr-2 h-4 w-4" />
                            <span>Caixa de Entrada</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/comunicacoes">
                            <Megaphone className="mr-2 h-4 w-4" />
                            <span>Comunicações</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Bus className="mr-2 h-4 w-4" />
                            <span>Transportes</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                             <DropdownMenuItem asChild>
                                <Link href="/transportes">
                                    <Bus className="mr-2 h-4 w-4" />
                                    <span>Rotas Públicas</span>
                                </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href="/transportes/ciclovias">
                                    <Bike className="mr-2 h-4 w-4" />
                                    <span>Planeamento de Ciclovias</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                        <Link href="/marketplace">
                            <Building className="mr-2 h-4 w-4" />
                            <span>Marketplace</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/meus-imoveis">
                            <Home className="mr-2 h-4 w-4" />
                            <span>Meus Imóveis</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/licencas">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Minhas Licenças</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/meus-croquis">
                            <Package className="mr-2 h-4 w-4" />
                            <span>Mapas de Localização</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                
                {isAgentOrAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Ferramentas de Gestão</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Painel Municipal</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Users className="mr-2 h-4 w-4" />
                                <span>Equipa e Frota</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem asChild><Link href="/admin/equipa">Gestão de Equipa</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/equipa/minhas-tarefas">Minhas Tarefas</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/abastecimento">Registar Abastecimento</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/analise-custos">Análise de Custos</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/relatorios">Relatórios Financeiros</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/inventario">Inventário de Peças</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/fornecedores">Portal de Fornecedores</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                         <DropdownMenuItem asChild>
                            <Link href="/admin/iluminacao-publica">
                                <Lightbulb className="mr-2 h-4 w-4" />
                                <span>Iluminação Pública</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href="/admin/areas-verdes">
                                <Trees className="mr-2 h-4 w-4" />
                                <span>Áreas Verdes</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/projetos">
                                <Briefcase className="mr-2 h-4 w-4" />
                                <span>Gerir Projetos</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href="/admin/verificacao">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Verificação de Imóveis</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/inspecao">
                                <ScanLine className="mr-2 h-4 w-4" />
                                <span>Prova de Visita</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <GitBranch className="mr-2 h-4 w-4" />
                                <span>Planeamento e Território</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem asChild><Link href="/admin/planeamento-3d">Planeamento Urbano 3D</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/recursos-hidricos">Recursos Hídricos</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/cobertura-do-solo">Cobertura do Solo</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/analise-territorio">Análise de Território</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                         {isAdmin && (
                            <DropdownMenuSub>
                                 <DropdownMenuSubTrigger>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Administração</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                     <DropdownMenuItem asChild>
                                        <Link href="/admin/comunicacoes">
                                            <Megaphone className="mr-2 h-4 w-4" />
                                            <span>Comunicações</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/users">
                                            <Users className="mr-2 h-4 w-4" />
                                            <span>Gerir Utilizadores</span>
                                        </Link>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                        <Link href="/admin/fiscalizacao-ambiental">
                                            <Droplets className="mr-2 h-4 w-4" />
                                            <span>Fiscalização Ambiental</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/faturacao">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            <span>Faturação e Plano</span>
                                        </Link>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                        <Link href="/admin/definicoes">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Definições</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        )}
                    </>
                )}
                
                 {isHealthOfficial && (
                     <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Saúde Pública</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/fiscalizacao-sanitaria">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Fiscalização Sanitária</span>
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

    