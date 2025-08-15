
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDataTable } from "@/components/admin/users/data-table";
import { useUsers } from "@/services/user-service";
import { usePoints } from "@/hooks/use-points";
import { UserProfileWithStats } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


function AdminUsersPage() {
    const { users, loading: loadingUsers, error, updateUserRole } = useUsers();
    const { allData: allPoints, loading: loadingPoints } = usePoints();


    const usersWithStats: UserProfileWithStats[] = React.useMemo(() => {
        if (loadingUsers || loadingPoints) return [];

        return users.map(user => {
            const contributions = allPoints.filter(point => point.authorId === user.uid);
            return {
                ...user,
                stats: {
                    contributions: contributions.length,
                    sanitationReports: contributions.filter(c => c.type === 'sanitation').length,
                    incidentReports: contributions.filter(c => c.type === 'incident').length,
                }
            }
        })
    }, [users, allPoints, loadingUsers, loadingPoints]);


    if (loadingUsers || loadingPoints) {
        return <div>A carregar dados...</div>;
    }

    if (error) {
        return <div className="text-red-500">Erro ao carregar utilizadores: {error}</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Gestão de Utilizadores
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Todos os Utilizadores</CardTitle>
                        <CardDescription>
                            Veja, gira e defina as permissões de todos os utilizadores registados na plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserDataTable data={usersWithStats} onUpdateUserRole={updateUserRole} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}


export default withAuth(AdminUsersPage, ['Administrador']);
