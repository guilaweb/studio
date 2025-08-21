
"use client";

import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { useMessages, sendMessage } from "@/services/chat-service";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Conversation, Message } from "@/lib/data";

function ConversationPage() {
  const params = useParams();
  const { profile } = useAuth();
  const conversationId = params.id as string;
  const { messages, loading: loadingMessages } = useMessages(conversationId);
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [loadingConversation, setLoadingConversation] = React.useState(true);
  const [messageText, setMessageText] = React.useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!conversationId) return;

    const unsub = onSnapshot(doc(db, "conversations", conversationId), (doc) => {
        if(doc.exists()) {
            setConversation({ id: doc.id, ...doc.data() } as Conversation);
        }
        setLoadingConversation(false);
    });

    return () => unsub();
  }, [conversationId]);
  
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !messageText.trim() || !profile) return;

    const textToSend = messageText;
    setMessageText("");
    await sendMessage(conversationId, textToSend, profile);
  };
  
  if (loadingConversation) {
      return <div className="flex h-screen w-full items-center justify-center">A carregar conversa...</div>
  }
  
  if (!conversation) {
     return <div className="flex h-screen w-full items-center justify-center">Conversa não encontrada.</div>
  }
  
  const otherParticipant = conversation.participantDetails.find(p => p.uid !== profile?.uid);

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
            <AvatarImage src={otherParticipant?.photoURL || undefined} alt={otherParticipant?.displayName} />
            <AvatarFallback>{otherParticipant?.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <p className="text-sm font-medium">{otherParticipant?.displayName}</p>
            <p className="text-xs text-muted-foreground">{conversation.propertyTitle}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
         <ScrollArea className="h-full" ref={scrollAreaRef}>
          {loadingMessages ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="space-y-6 p-4 md:p-6">
                {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex items-end gap-2 ${
                    message.senderId === profile?.uid ? "justify-end" : "justify-start"
                    }`}
                >
                    {message.senderId !== profile?.uid && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={otherParticipant?.photoURL || undefined} alt={otherParticipant?.displayName} />
                            <AvatarFallback>{otherParticipant?.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.senderId === profile?.uid
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.senderId === profile?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(message.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                ))}
            </div>
           )}
        </ScrollArea>
      </main>
      <footer className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="relative">
          <Input 
            placeholder="Escreva a sua mensagem..." 
            className="pr-12" 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            disabled={!messageText.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar Mensagem</span>
          </Button>
        </form>
      </footer>
    </div>
  );
}

export default withAuth(ConversationPage);
