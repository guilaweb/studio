
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      toast({ title: 'Copiado para a área de transferência!' });
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={copyToClipboard}
      >
        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">Copiar código</span>
      </Button>
      <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};
