
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ListTodo } from "lucide-react";
import { TaskCard } from "@/components/team-management/task-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";

function MyTasksPage() {
    const { profile } = useAuth();
    const { updatePointStatus, loading } = usePoints();
    const [myTasks, setMyTasks] = React.useState<PointOfInterest[]>([]);

    React.useEffect(() => {
        if (profile?.taskQueue) {
            setMyTasks(profile.taskQueue);
        }
    }, [profile]);

    const handleStatusChange = (taskId: string, newStatus: PointOfInterest['status']) => {
        // Here you would also update the technician's taskQueue in their profile
        // For now, we'll just update the main POI status and let the local state reflect it
        updatePointStatus(taskId, newStatus, `Tarefa marcada como ${newStatus} pelo técnico.`);
        setMyTasks(prevTasks => 
            prevTasks.filter(task => task.id !== taskId) // A simple way to remove it from the pending list
        );
    };

    const pendingTasks = myTasks.filter(t => t.status !== 'collected');
    const completedTasks = myTasks.filter(t => t.status === 'collected');

    if (loading) {
        return <div>A carregar tarefas...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar ao Mapa</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    As Minhas Tarefas
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Tabs defaultValue="pending">
                     <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending">Pendentes ({pendingTasks.length})</TabsTrigger>
                        <TabsTrigger value="completed">Concluídas ({completedTasks.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tarefas Pendentes</CardTitle>
                                <CardDescription>As suas tarefas ativas. Atualize o estado à medida que avança.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {pendingTasks.length > 0 ? (
                                    pendingTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-2 text-sm font-semibold">Sem tarefas pendentes</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Está tudo em dia!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="completed">
                         <Card>
                            <CardHeader>
                                <CardTitle>Tarefas Concluídas</CardTitle>
                                <CardDescription>O seu histórico de trabalho finalizado.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {completedTasks.length > 0 ? (
                                    completedTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                                    ))
                                ) : (
                                     <div className="text-center py-12">
                                        <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-2 text-sm font-semibold">Sem tarefas concluídas</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Conclua uma tarefa para a ver aqui.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default withAuth(MyTasksPage, ['Agente Municipal', 'Administrador']);
