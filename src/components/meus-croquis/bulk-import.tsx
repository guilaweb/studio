
"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { usePoints } from '@/hooks/use-points';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

type ParsedRow = {
    nome: string;
    lat: number;
    lng: number;
    contacto?: string;
    notas?: string;
};

const requiredHeaders = ['nome', 'lat', 'lng'];

export default function BulkImport() {
    const { toast } = useToast();
    const { user, profile } = useAuth();
    const { addPoint } = usePoints();
    const [file, setFile] = useState<File | null>(null);
    const [collectionName, setCollectionName] = useState('');
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast({ variant: 'destructive', title: 'Ficheiro Inválido', description: 'Por favor, carregue um ficheiro CSV.' });
                return;
            }
            setFile(selectedFile);
            handleParse(selectedFile);
        }
    };

    const handleParse = (fileToParse: File) => {
        setIsParsing(true);
        setError(null);
        setParsedData([]);

        Papa.parse(fileToParse, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields;
                if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
                    setError(`O ficheiro CSV deve conter as colunas obrigatórias: ${requiredHeaders.join(', ')}.`);
                    setIsParsing(false);
                    return;
                }

                const data = results.data as any[];
                const validData: ParsedRow[] = [];
                for (const row of data) {
                    const lat = parseFloat(row.lat);
                    const lng = parseFloat(row.lng);
                    if (row.nome && !isNaN(lat) && !isNaN(lng)) {
                        validData.push({
                            nome: row.nome,
                            lat,
                            lng,
                            contacto: row.contacto,
                            notas: row.notas,
                        });
                    }
                }
                setParsedData(validData);
                setIsParsing(false);
            },
            error: (err) => {
                setError(`Erro ao analisar o ficheiro: ${err.message}`);
                setIsParsing(false);
            }
        });
    };

    const handleImport = async () => {
        if (parsedData.length === 0 || !collectionName.trim() || !user || !profile) {
            toast({ variant: 'destructive', title: 'Dados em Falta', description: 'Verifique se tem dados válidos, um nome de coleção e se está autenticado.' });
            return;
        }

        setIsImporting(true);
        let successCount = 0;

        for (const row of parsedData) {
            try {
                const croquiId = `croqui-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const timestamp = new Date().toISOString();

                await addPoint({
                    id: croquiId,
                    type: 'croqui',
                    title: row.nome,
                    description: row.notas || `Contacto: ${row.contacto || 'N/A'}`,
                    authorId: user.uid,
                    authorDisplayName: profile.displayName,
                    position: { lat: row.lat, lng: row.lng },
                    lastReported: timestamp,
                    collectionName: collectionName.trim(),
                    status: 'active',
                    updates: [{
                        id: `update-${croquiId}`,
                        text: `Croqui importado em massa para a coleção "${collectionName.trim()}".`,
                        authorId: user.uid,
                        authorDisplayName: profile.displayName,
                        timestamp: timestamp,
                    }]
                });
                successCount++;
            } catch (err) {
                console.error('Falha ao importar a linha:', row, err);
            }
        }

        setIsImporting(false);
        toast({
            title: 'Importação Concluída',
            description: `${successCount} de ${parsedData.length} croquis foram importados com sucesso para a coleção "${collectionName.trim()}".`
        });
        // Reset state after import
        setFile(null);
        setParsedData([]);
        setCollectionName('');
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Passo 1: Carregar Ficheiro</CardTitle>
                        <CardDescription>
                            Carregue um ficheiro CSV com os seus dados. As colunas obrigatórias são 'nome', 'lat', e 'lng'.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <a href="/templates/import_template.csv" download className="inline-block">
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4"/>
                                    Descarregar Modelo
                                </Button>
                            </a>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="csv-file">Ficheiro CSV</Label>
                            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="collection-name">Nome da Coleção</Label>
                            <Input
                                id="collection-name"
                                placeholder="Ex: Clientes da Zona Sul"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                disabled={parsedData.length === 0}
                            />
                        </div>
                         <Button onClick={handleImport} disabled={isImporting || parsedData.length === 0 || !collectionName.trim()}>
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            {isImporting ? 'A Importar...' : `Importar ${parsedData.length} Croquis`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Passo 2: Pré-visualização e Confirmação</CardTitle>
                        <CardDescription>
                            Reveja os dados analisados do seu ficheiro antes de importar. Linhas com dados inválidos serão ignoradas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isParsing ? (
                            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : error ? (
                            <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-md">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        ) : parsedData.length > 0 ? (
                            <div className="max-h-[60vh] overflow-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Latitude</TableHead>
                                            <TableHead>Longitude</TableHead>
                                            <TableHead>Contacto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.slice(0, 100).map((row, i) => ( // Preview up to 100 rows
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{row.nome}</TableCell>
                                                <TableCell>{row.lat.toFixed(5)}</TableCell>
                                                <TableCell>{row.lng.toFixed(5)}</TableCell>
                                                <TableCell>{row.contacto || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {parsedData.length > 100 && <p className="text-center text-xs text-muted-foreground p-2">A mostrar as primeiras 100 de ${parsedData.length} linhas.</p>}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium">Aguardando por um ficheiro CSV...</p>
                                <p className="text-xs text-muted-foreground">A pré-visualização dos seus dados aparecerá aqui.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
