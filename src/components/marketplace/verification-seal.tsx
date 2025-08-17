
"use client";

import { PointOfInterestStatus, statusLabelMap } from "@/lib/data";
import { HelpCircle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export const VerificationSeal = ({ status }: { status: PointOfInterestStatus }) => {
    const sealConfig = {
        verificado_ouro: {
            Icon: ShieldCheck,
            label: "Verificado (Ouro)",
            description: "Propriedade validada com documentos oficiais e sem conflitos geo-espaciais.",
            className: "bg-yellow-400 text-yellow-900 border-yellow-500",
        },
        verificado_prata: {
            Icon: Shield,
            label: "Verificado (Prata)",
            description: "Posse confirmada com base em documentos históricos e/ou validação comunitária.",
             className: "bg-slate-400 text-slate-900 border-slate-500",
        },
        em_verificacao: {
            Icon: ShieldAlert,
            label: "Em Verificação",
            description: "Este imóvel está a ser analisado pelos nossos técnicos.",
            className: "bg-blue-400 text-blue-900 border-blue-500",
        },
        informacao_insuficiente: {
            Icon: HelpCircle,
            label: "Informação Insuficiente",
            description: "A verificação falhou. Por favor, verifique as comunicações e forneça os dados pedidos.",
             className: "bg-red-400 text-red-900 border-red-500",
        },
        default: {
            Icon: HelpCircle,
            label: statusLabelMap[status] || "Privado",
            description: "O estado atual deste imóvel é privado ou não verificado.",
            className: "bg-gray-400 text-gray-900 border-gray-500",
        }
    };

    const config = sealConfig[status as keyof typeof sealConfig] || sealConfig.default;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <div className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2 py-1 rounded-full ${config.className}`}>
                        <config.Icon className="h-3.5 w-3.5" />
                        {config.label}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
