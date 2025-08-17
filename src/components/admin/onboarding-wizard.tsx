
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

export default function OnboardingWizard() {
    const { profile, user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
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
                title: "Configuração concluída!",
                description: "Pode agora explorar o Painel Municipal.",
            });
            setIsOpen(false);
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bem-vindo à MUNITU, Gestor!</DialogTitle>
                    <DialogDescription>
                        Vamos fazer uma configuração rápida para preparar a sua plataforma.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>
                        Este assistente irá guiá-lo na configuração inicial da sua entidade na plataforma MUNITU.
                        Por agora, vamos apenas marcar este passo como concluído.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleCompleteOnboarding}>Começar a Usar a Plataforma</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
