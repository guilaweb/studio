
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
import { ArrowRight, Settings, Users, Building } from "lucide-react";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function OnboardingWizard() {
    const { profile, user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [orgName, setOrgName] = React.useState('');
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        if (profile?.role === 'Administrador' && !profile.onboardingCompleted) {
            setIsOpen(true);
            setOrgName(`${profile.displayName}'s Municipality`);
        }
    }, [profile]);
    
    const handleNextStep = () => setStep(prev => prev + 1);

    const handleCompleteOnboarding = async () => {
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.uid);
        const orgDocRef = doc(db, 'organizations', profile!.organizationId!);

        try {
            await updateDoc(userDocRef, { onboardingCompleted: true });
            if (orgName.trim() !== `${profile?.displayName}'s Municipality`) {
                 await updateDoc(orgDocRef, { name: orgName.trim() });
            }
            toast({
                title: "Configuração inicial concluída!",
                description: "Pode agora começar a gerir a sua plataforma.",
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
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                         <p>
                            Como o primeiro administrador da sua entidade, a sua conta foi configurada com permissões de gestão totais. Vamos dar os primeiros passos.
                        </p>
                        <div className="p-4 bg-muted rounded-md space-y-2">
                             <h4 className="font-semibold">Próximos Passos Recomendados:</h4>
                             <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Configure o nome da sua organização.</li>
                                <li>Explore o <span className="font-semibold text-foreground">Painel Municipal</span> para ter uma visão geral.</li>
                                <li>Visite as <span className="font-semibold text-foreground">Definições</span> para configurar camadas e outras opções.</li>
                                <li>Vá para <span className="font-semibold text-foreground">Gestão de Utilizadores</span> para convidar a sua equipa.</li>
                             </ul>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-4">
                         <p>
                            O nome da sua organização é usado em toda a plataforma. Pode alterá-lo mais tarde nas definições.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Nome da Organização/Município</Label>
                            <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                        </div>
                    </div>
                );
            case 3:
                 return (
                    <div className="space-y-4 text-center">
                        <Building className="h-12 w-12 mx-auto text-primary"/>
                        <p>Está tudo pronto! A sua plataforma está configurada com o nome <strong className="text-primary">{orgName}</strong>.</p>
                        <p className="text-sm text-muted-foreground">Clique em "Concluir" para começar a explorar e gerir a sua nova plataforma municipal.</p>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <Progress value={(step / 3) * 100} className="mb-4" />
                    <DialogTitle className="text-2xl">Bem-vindo à MUNITU, Gestor!</DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Vamos dar os primeiros passos."}
                        {step === 2 && "Configure o nome da sua organização."}
                        {step === 3 && "Configuração concluída."}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 min-h-[200px]">
                    {renderStepContent()}
                </div>
                <DialogFooter>
                    {step < 3 ? (
                        <Button onClick={handleNextStep}>
                            Próximo <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                         <Button onClick={handleCompleteOnboarding}>
                            Concluir
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
