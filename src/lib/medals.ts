
import type { PointOfInterest } from "./data";
import { Award, Shield, Star, Trash2, Siren } from "lucide-react";
import type { ElementType } from "react";

export type Medal = {
    name: string;
    description: string;
    Icon: ElementType;
    colorClasses: {
      bg: string;
      border: string;
      icon: string;
      title: string;
      text: string;
    };
    isAchieved: (contributions: PointOfInterest[]) => boolean;
};

export const medals: Medal[] = [
    {
        name: "Fiscal Iniciante",
        description: "Concedida pela sua primeira contribuição. Bem-vindo!",
        Icon: Award,
        colorClasses: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: 'text-yellow-500',
            title: 'text-yellow-800 dark:text-yellow-300',
            text: 'text-yellow-700 dark:text-yellow-400',
        },
        isAchieved: (contributions) => contributions.length >= 1,
    },
    {
        name: "Fiscal Atento",
        description: "Dez contribuições! Os seus olhos estão a fazer a diferença.",
        Icon: Star,
        colorClasses: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'text-blue-500',
            title: 'text-blue-800 dark:text-blue-300',
            text: 'text-blue-700 dark:text-blue-400',
        },
        isAchieved: (contributions) => contributions.length >= 10,
    },
    {
        name: "Guardião da Cidade",
        description: "Vinte e cinco contribuições! Você é um pilar da comunidade.",
        Icon: Shield,
        colorClasses: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: 'text-green-500',
            title: 'text-green-800 dark:text-green-300',
            text: 'text-green-700 dark:text-green-400',
        },
        isAchieved: (contributions) => contributions.length >= 25,
    },
    {
        name: "Vigilante do Saneamento",
        description: "Reportou 5 pontos de saneamento. A sua ajuda mantém a cidade limpa!",
        Icon: Trash2,
        colorClasses: {
            bg: 'bg-cyan-50 dark:bg-cyan-900/20',
            border: 'border-cyan-200 dark:border-cyan-800',
            icon: 'text-cyan-500',
            title: 'text-cyan-800 dark:text-cyan-300',
            text: 'text-cyan-700 dark:text-cyan-400',
        },
        isAchieved: (contributions) => contributions.filter(c => c.type === 'sanitation').length >= 5,
    },
    {
        name: "Sentinela de Incidentes",
        description: "Reportou 5 incidentes. A sua prontidão ajuda a manter todos seguros.",
        Icon: Siren,
        colorClasses: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: 'text-red-500',
            title: 'text-red-800 dark:text-red-300',
            text: 'text-red-700 dark:text-red-400',
        },
        isAchieved: (contributions) => contributions.filter(c => c.type === 'incident').length >= 5,
    },
];
