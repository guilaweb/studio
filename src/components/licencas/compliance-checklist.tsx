
"use client";

import React from 'react';
import { AnalyzeProjectComplianceOutput } from '@/lib/data';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ComplianceChecklistProps {
    result: AnalyzeProjectComplianceOutput;
}

const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ result }) => {
    const Icon = result.isCompliant ? CheckCircle : AlertCircle;
    const colorClass = result.isCompliant ? 'text-green-600' : 'text-yellow-600';
    const bgClass = result.isCompliant ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20';
    const borderClass = result.isCompliant ? 'border-green-200 dark:border-green-700' : 'border-yellow-200 dark:border-yellow-700';

    return (
        <Card className={`${bgClass} ${borderClass}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Icon className={`h-6 w-6 mt-1 flex-shrink-0 ${colorClass}`} />
                    <div>
                        <h4 className={`font-semibold ${colorClass}`}>
                            {result.isCompliant ? 'Projeto em Conformidade Preliminar' : 'Potencial Inconformidade ou Risco Detetado'}
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.analysis}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComplianceChecklist;
