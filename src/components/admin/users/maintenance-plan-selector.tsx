
"use client";

import React from 'react';
import { UserProfile } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useMaintenancePlans } from '@/services/maintenance-service';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type UserUpdateHandler = (uid: string, data: Partial<UserProfile>) => Promise<void>;

interface MaintenancePlanSelectorProps {
  user: UserProfile;
  onUpdateUserProfile: UserUpdateHandler;
}

const MaintenancePlanSelector: React.FC<MaintenancePlanSelectorProps> = ({ user, onUpdateUserProfile }) => {
    const { maintenancePlans, loading } = useMaintenancePlans();
    const { toast } = useToast();

    if (loading) {
        return <Badge variant="outline">A carregar...</Badge>;
    }
    
    const associatedPlanIds = user.vehicle?.maintenancePlanIds || [];

    const handlePlanToggle = async (planId: string, isChecked: boolean) => {
        const currentPlans = user.vehicle?.maintenancePlanIds || [];
        const newPlans = isChecked
            ? [...currentPlans, planId]
            : currentPlans.filter(id => id !== planId);
        
        try {
            await onUpdateUserProfile(user.uid, {
                vehicle: { ...user.vehicle!, maintenancePlanIds: newPlans }
            });
             toast({
                title: "Planos Atualizados!",
                description: `A manutenção do veículo de ${user.displayName} foi atualizada.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar planos",
                description: "Não foi possível guardar as alterações.",
            });
        }
    };
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48 justify-start">
                    <Wrench className="mr-2 h-4 w-4" />
                    Gerir Planos ({associatedPlanIds.length})
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Associar Planos de Manutenção</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {maintenancePlans.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground">Nenhum plano de manutenção criado. Vá a Definições para criar um.</p>
                ) : (
                    maintenancePlans.map(plan => (
                        <DropdownMenuCheckboxItem
                            key={plan.id}
                            checked={associatedPlanIds.includes(plan.id)}
                            onCheckedChange={(checked) => handlePlanToggle(plan.id, checked as boolean)}
                        >
                            {plan.name}
                        </DropdownMenuCheckboxItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default MaintenancePlanSelector;

    