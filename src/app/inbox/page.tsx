
"use client";

import Link from "next/link";
import { ArrowLeft, Edit, Inbox as InboxIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { useConversations } from "@/services/chat-service";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

function InboxPage() {
  const { user } = useAuth();
  const { conversations, loading } = useConversations();

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
        <Button size="icon" variant="outline" className="ml-auto" disabled>
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
            {loading ? (
              <p>A carregar conversas...</p>
            ) : conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conv) => {
                   const otherParticipant = conv.participantDetails.find(p => p.uid !== user?.uid);
                   const isUnread = conv.lastMessage && !conv.lastMessage.readBy.includes(user?.uid || '');

                   return (
                    <Link key={conv.id} href={`/inbox/${conv.id}`} className="block">
                      <div className={`flex items-center gap-4 rounded-lg border p-3 hover:bg-muted transition-colors ${isUnread ? 'bg-primary/5' : ''}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={otherParticipant?.photoURL || `https://placehold.co/40x40.png?text=${otherParticipant?.displayName.charAt(0)}`}
                            alt={otherParticipant?.displayName}
                          />
                          <AvatarFallback>
                            {otherParticipant?.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{otherParticipant?.displayName}</p>
                            {conv.lastMessage && (
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: true, locale: pt })}
                                </p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{conv.propertyTitle}</p>
                          {conv.lastMessage && (
                            <p className={`text-sm truncate ${isUnread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{conv.lastMessage.text}</p>
                          )}
                        </div>
                        {isUnread && (
                          <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-primary" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
                <div className="text-center py-12">
                     <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">Sem mensagens</h3>
                    <p className="mt-1 text-sm text-muted-foreground">As suas conversas sobre imóveis aparecerão aqui.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(InboxPage);
