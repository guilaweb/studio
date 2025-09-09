

"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDataTable } from "@/components/admin/users/data-table";
import { useUsers } from "@/services/user-service";
import { usePoints } from "@/hooks/use-points";
import { UserProfile, UserProfileWithStats } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { columns } from "@/components/admin/users/columns";
import VehicleEditorDialog from "@/components/admin/users/vehicle-editor-dialog";
import { useSubscription } from "@/services/subscription-service";
import { Skeleton } from "@/components/ui/skeleton";


function AdminUsersPage() {
    const { users, loading: loadingUsers, error, updateUserRole, updateUserProfile } = useUsers();
    const { allData: allPoints, loading: loadingPoints } = usePoints();
    const { subscription, loading: loadingSub } = useSubscription();
    const [userToEditVehicle, setUserToEditVehicle] = React.useState<UserProfile | null>(null);

    const usersWithStats: UserProfileWithStats[] = React.useMemo(() => {
        if (loadingUsers || loadingPoints) return [];

        return users.map(user => {
            const contributions = allPoints.filter(point => point.authorId === user.uid);
            return {
                ...user,
                stats: {
                    ...user.stats,
                    contributions: contributions.length,
                    sanitationReports: contributions.filter(c => c.type === 'sanitation').length,
                    incidentReports: contributions.filter(c => c.type === 'incident').length,
                }
            }
        })
    }, [users, allPoints, loadingUsers, loadingPoints]);
    
    const currentAgentCount = React.useMemo(() => {
        return users.filter(u => u.role === 'Agente Municipal').length;
    }, [users]);


    if (loadingUsers || loadingPoints || loadingSub) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-muted/40 p-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500">Erro ao carregar utilizadores: {error}</div>;
    }

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Utilizadores e Frota
                    </h1>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Todos os Utilizadores</CardTitle>
                            <CardDescription>
                                Gira as permissões, equipas e veículos de todos os utilizadores registados na plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserDataTable 
                                columns={columns} 
                                data={usersWithStats} 
                                onUpdateUserRole={updateUserRole}
                                onUpdateUserProfile={updateUserProfile}
                                onEditVehicle={setUserToEditVehicle}
                                agentCount={currentAgentCount}
                                agentLimit={subscription?.limits?.agents ?? 0}
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
            <VehicleEditorDialog
                user={userToEditVehicle}
                open={!!userToEditVehicle}
                onOpenChange={(isOpen) => !isOpen && setUserToEditVehicle(null)}
                onSave={updateUserProfile}
            />
        </>
    );
}


export default withAuth(AdminUsersPage, ['Administrador']);
