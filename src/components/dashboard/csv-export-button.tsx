
"use client";

import React from 'react';
import { Table } from '@tanstack/react-table';
import { PointOfInterest, priorityLabelMap, statusLabelMap, typeLabelMap } from '@/lib/data';
import { CSVLink } from 'react-csv';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface CsvExportButtonProps {
    table: Table<PointOfInterest>;
}

const CsvExportButton: React.FC<CsvExportButtonProps> = ({ table }) => {
    const csvData = React.useMemo(() => {
        return table.getRowModel().rows.map(row => ({
            ID: row.original.id,
            Titulo: row.original.title,
            Tipo: typeLabelMap[row.original.type] || row.original.type,
            Descricao: row.original.description,
            Prioridade: row.original.priority ? priorityLabelMap[row.original.priority] : 'N/A',
            Estado: row.original.status ? statusLabelMap[row.original.status] : 'N/A',
            Latitude: row.original.position.lat,
            Longitude: row.original.position.lng,
            DataReporte: row.original.lastReported ? new Date(row.original.lastReported).toLocaleString('pt-PT') : '',
            Autor: row.original.authorDisplayName,
        }));
    }, [table.getRowModel().rows]);

    const headers = [
        { label: "ID", key: "ID" },
        { label: "Título", key: "Titulo" },
        { label: "Tipo", key: "Tipo" },
        { label: "Descrição", key: "Descricao" },
        { label: "Prioridade", key: "Prioridade" },
        { label: "Estado", key: "Estado" },
        { label: "Latitude", key: "Latitude" },
        { label: "Longitude", key: "Longitude" },
        { label: "Data do Reporte", key: "DataReporte" },
        { label: "Autor", key: "Autor" },
    ];

    return (
        <CSVLink
            data={csvData}
            headers={headers}
            filename={`munitu_export_${new Date().toISOString()}.csv`}
            className="h-9"
        >
            <Button variant="outline" className="h-full">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
            </Button>
        </CSVLink>
    );
};

export default CsvExportButton;
