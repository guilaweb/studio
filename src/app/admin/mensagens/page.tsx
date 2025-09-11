
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Mail, User, Building, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    entity?: string;
    subject: string;
    message: string;
    sentAt: string;
    read: boolean;
}

function AdminMessagesPage() {
    const [messages, setMessages] = React.useState<ContactMessage[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, "contactMessages"), orderBy("sentAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: ContactMessage[] = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as ContactMessage);
            });
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40 p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
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
                    Mensagens de Contacto
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Caixa de Entrada Geral</CardTitle>
                        <CardDescription>
                            Mensagens enviadas através do formulário de contacto do site público.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {messages.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {messages.map(msg => (
                                    <AccordionItem key={msg.id} value={msg.id}>
                                        <AccordionTrigger className={!msg.read ? 'font-bold' : ''}>
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="truncate">{msg.subject}</p>
                                                    <p className={`text-sm ${!msg.read ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        De: {msg.name} {msg.entity && `(${msg.entity})`}
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-16 pr-4 space-y-4">
                                            <div className="text-sm text-muted-foreground space-y-2">
                                                 <p className="flex items-center gap-2"><Mail className="h-4 w-4"/> <a href={`mailto:${msg.email}`} className="text-primary underline">{msg.email}</a></p>
                                                 <p className="flex items-center gap-2"><Clock className="h-4 w-4"/> {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true, locale: pt })}</p>
                                            </div>
                                            <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-4">{msg.message}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                <Mail className="mx-auto h-12 w-12" />
                                <p className="mt-4">A caixa de entrada está vazia.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(AdminMessagesPage, ['Administrador']);
