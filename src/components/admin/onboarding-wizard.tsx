
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function OnboardingWizard() {
    const { profile, user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        // Automatically open the dialog if the user is an admin and hasn't completed onboarding.
        if (profile?.role === 'Administrador' && !profile.onboardingCompleted) {
            setIsOpen(true);
        }
    }, [profile]);

    const handleCompleteOnboarding = async () => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { onboardingCompleted: true });
            toast({
                title: "Configuração inicial concluída!",
                description: "Pode agora começar a gerir a sua plataforma.",
            });
            setIsOpen(false);
            // Optionally redirect to a relevant page, like user management
            router.push('/admin/users');
        } catch (error) {
            console.error("Failed to update onboarding status:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível guardar o estado da configuração.",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Bem-vindo à MUNITU, Gestor!</DialogTitle>
                    <DialogDescription>
                        A sua organização foi criada. Vamos dar os primeiros passos.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-sm">
                    <p>
                        Como o primeiro administrador da sua entidade, a sua conta foi configurada com permissões de gestão totais.
                    </p>
                    <div className="p-4 bg-muted rounded-md space-y-2">
                         <h4 className="font-semibold">Próximos Passos Recomendados:</h4>
                         <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Explore o <span className="font-semibold">Painel Municipal</span> para ter uma visão geral.</li>
                            <li>Visite as <span className="font-semibold">Definições</span> para configurar camadas e outras opções.</li>
                            <li>Vá para <span className="font-semibold">Gestão de Utilizadores</span> para convidar a sua equipa.</li>
                         </ul>
                    </div>
                     <p>
                       Pode explorar a plataforma livremente. Use este assistente para ser guiado quando estiver pronto.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleCompleteOnboarding}>
                        Começar a Gerir <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
