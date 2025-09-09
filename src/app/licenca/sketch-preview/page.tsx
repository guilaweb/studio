
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';

export default function SketchPreviewPage() {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedHtml = localStorage.getItem('sketchPreview');
        if (storedHtml) {
            // Replace the API key placeholder
            let finalHtml = storedHtml.replace(/YOUR_API_KEY/g, process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '');
            
            // Replace the MUNITU seal placeholder with the actual SVG
            const munituSealSvg = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"></path>
                        <path d="M12 22C12 22 19 16 19 10C19 5.58172 15.4183 2 12 2C8.58172 2 5 5.58172 5 10C5 16 12 22 12 22Z"></path>
                    </svg>
                    <span style="font-weight: 600;">MUNITU</span>
                </div>
            `;
            finalHtml = finalHtml.replace(/<!-- MUNITU_SEAL_PLACEHOLDER -->/g, munituSealSvg);
            
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
