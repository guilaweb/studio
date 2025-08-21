
"use client";

import { PointOfInterestStatus, statusLabelMap } from "@/lib/data";
import { HelpCircle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "../ui/badge";

export const VerificationSeal = ({ status }: { status: PointOfInterestStatus }) => {
    const sealConfig = {
        verificado_ouro: {
            Icon: ShieldCheck,
            label: "Verificado (Ouro)",
            description: "Propriedade validada com documentos oficiais e sem conflitos geo-espaciais.",
            className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300",
        },
        verificado_prata: {
            Icon: Shield,
            label: "Verificado (Prata)",
            description: "Posse confirmada com base em documentos históricos e/ou validação comunitária.",
             className: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:border-slate-700 dark:text-slate-300",
        },
        em_verificacao: {
            Icon: ShieldAlert,
            label: "Em Verificação",
            description: "Este imóvel está a ser analisado pelos nossos técnicos.",
            className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
        },
        informacao_insuficiente: {
            Icon: HelpCircle,
            label: "Info Insuficiente",
            description: "A verificação falhou. Por favor, verifique as comunicações e forneça os dados pedidos.",
             className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
        },
        default: {
            Icon: HelpCircle,
            label: statusLabelMap[status] || "Privado",
            description: "O estado atual deste imóvel é privado ou não verificado.",
            className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300",
        }
    };

    const config = sealConfig[status as keyof typeof sealConfig] || sealConfig.default;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Badge variant="outline" className={`gap-1.5 font-semibold ${config.className}`}>
                        <config.Icon className="h-3.5 w-3.5" />
                        {config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
