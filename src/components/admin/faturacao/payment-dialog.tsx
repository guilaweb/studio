
"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  planName: string;
  isChangingPlan: boolean;
}

const bankDetails = {
    bank: "BMA-Banco Millennium Atlântico",
    beneficiary: "DIANGUILA EMPREENDIMENTOS, COMÉRCIO E PRESTAÇÃO DE SERVIÇOS",
    nif: "5001706802",
    iban: "AO06.0055.0000.1437.0893.1010.9",
    account: "1437089310109",
};

export default function PaymentDialog({ open, onOpenChange, onConfirm, planName, isChangingPlan }: PaymentDialogProps) {
    const { toast } = useToast();

    const handleCopy = (textToCopy: string, fieldName: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ title: `${fieldName} Copiado!`, description: `O ${fieldName.toLowerCase()} foi copiado para a sua área de transferência.` });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Pagamento por Transferência Bancária</AlertDialogTitle>
                    <AlertDialogDescription>
                        Para subscrever ao plano <strong>{planName}</strong>, por favor, efetue uma transferência para os seguintes dados:
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2 space-y-4 text-sm">
                    <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <div><p className="font-semibold text-muted-foreground">Banco</p><p>{bankDetails.bank}</p></div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <div><p className="font-semibold text-muted-foreground">Beneficiário</p><p>{bankDetails.beneficiary}</p></div>
                        </div>
                        <Separator />
                         <div className="flex justify-between items-center">
                            <div><p className="font-semibold text-muted-foreground">NIF</p><p>{bankDetails.nif}</p></div>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(bankDetails.nif, 'NIF')}><Copy className="h-4 w-4"/></Button>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <div><p className="font-semibold text-muted-foreground">Conta</p><p>{bankDetails.account}</p></div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(bankDetails.account, 'Número de Conta')}><Copy className="h-4 w-4"/></Button>
                        </div>
                         <Separator />
                        <div className="flex justify-between items-center">
                            <div><p className="font-semibold text-muted-foreground">IBAN</p><p>{bankDetails.iban}</p></div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(bankDetails.iban, 'IBAN')}><Copy className="h-4 w-4"/></Button>
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Após a transferência, clique em "Já Efetuei o Pagamento". A sua subscrição será ativada assim que o pagamento for confirmado (pode levar até 24 horas úteis).
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isChangingPlan}>
                        {isChangingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Já Efetuei o Pagamento
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
