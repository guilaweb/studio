
"use client";

import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withAuth } from "@/hooks/use-auth";

function InboxPage() {
  // Placeholder data
  const conversations = [
    {
      id: "conv-1",
      participant: {
        name: "José Manzambi",
        avatar: "/avatars/01.png",
      },
      property: "Vivenda T4 no Patriota",
      lastMessage: "Olá, ainda está disponível? Tenho interesse...",
      timestamp: "há 2 horas",
      unread: true,
    },
     {
      id: "conv-2",
      participant: {
        name: "Sofia Luvumbo",
        avatar: "/avatars/02.png",
      },
      property: "Terreno de 2500m² em Viana",
      lastMessage: "Obrigado pela informação!",
      timestamp: "há 1 dia",
      unread: false,
    },
  ];

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
          Caixa de Entrada
        </h1>
        <Button size="icon" variant="outline" className="ml-auto">
          <Edit className="h-5 w-5" />
          <span className="sr-only">Nova Mensagem</span>
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversas</CardTitle>
            <CardDescription>
              As suas mensagens sobre imóveis no marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/inbox/${conv.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted transition-colors">
                    <Avatar className="h-10 w-10">
                       <AvatarImage
                        src={`https://placehold.co/40x40.png?text=${conv.participant.name.charAt(0)}`}
                        alt={conv.participant.name}
                      />
                      <AvatarFallback>
                        {conv.participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{conv.participant.name}</p>
                        <p className="text-xs text-muted-foreground">{conv.timestamp}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{conv.property}</p>
                      <p className="text-sm text-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && (
                      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(InboxPage);
