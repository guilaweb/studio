
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function LicensePreviewPage() {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This code runs only on the client side
        const storedHtml = localStorage.getItem('licensePreview');
        if (storedHtml) {
            setHtmlContent(storedHtml);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">A carregar pré-visualização...</div>;
    }

    if (!htmlContent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Erro ao Carregar Licença</h1>
                <p className="text-muted-foreground mb-6">Não foi possível encontrar o conteúdo da licença. Por favor, tente gerá-la novamente.</p>
                <Button onClick={() => window.close()}>Fechar Janela</Button>
            </div>
        );
    }

    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
}
