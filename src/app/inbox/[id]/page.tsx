
"use client";

import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withAuth } from "@/hooks/use-auth";

function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  // Placeholder data
  const conversation = {
    id: conversationId,
    property: {
      title: "Vivenda T4 no Patriota",
      image: "https://placehold.co/600x400.png",
    },
    participant: {
      name: "José Manzambi",
      avatar: "https://placehold.co/40x40.png?text=JM",
    },
    messages: [
      {
        id: "msg1",
        sender: "participant",
        text: "Olá, ainda está disponível? Tenho interesse e gostaria de saber mais detalhes.",
        timestamp: "10:30",
      },
      {
        id: "msg2",
        sender: "me",
        text: "Olá José, sim, ainda está disponível. O que gostaria de saber especificamente?",
        timestamp: "10:32",
      },
       {
        id: "msg3",
        sender: "participant",
        text: "Excelente! A documentação está toda em ordem? Tem o selo de verificação da MUNITU?",
        timestamp: "10:35",
      },
    ],
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button asChild variant="outline" size="icon">
          <Link href="/inbox">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar à Caixa de Entrada</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.participant.avatar} alt={conversation.participant.name} />
            <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <p className="text-sm font-medium">{conversation.participant.name}</p>
            <p className="text-xs text-muted-foreground">{conversation.property.title}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
         <ScrollArea className="h-full">
          <div className="space-y-6 p-4 md:p-6">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === 'participant' && (
                    <Avatar className="h-8 w-8">
                         <AvatarImage src={conversation.participant.avatar} alt={conversation.participant.name} />
                        <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </main>
      <footer className="border-t bg-background p-4">
        <div className="relative">
          <Input placeholder="Escreva a sua mensagem..." className="pr-12" />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar Mensagem</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default withAuth(ConversationPage);
