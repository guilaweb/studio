
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SketchPreviewPage() {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedHtml = localStorage.getItem('sketchPreview');
        if (storedHtml) {
            // Replace the placeholder with the actual API key
            const finalHtml = storedHtml.replace(/YOUR_API_KEY/g, process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '');
            setHtmlContent(finalHtml);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">A carregar pré-visualização do croqui...</div>;
    }

    if (!htmlContent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Erro ao Carregar Croqui</h1>
                <p className="text-muted-foreground mb-6">Não foi possível encontrar o conteúdo do croqui. Por favor, tente gerá-lo novamente.</p>
                <Button onClick={() => window.close()}>Fechar Janela</Button>
            </div>
        );
    }

    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
}

    