
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PointOfInterestUsageType } from '@/lib/data';
import { Search, X } from 'lucide-react';

export interface SearchFilters {
    area: number | null;
    usageType: PointOfInterestUsageType | null;
    location: string;
}

interface PropertySearchProps {
    onSearch: (filters: SearchFilters) => void;
    initialFilters: SearchFilters;
}

const LandPlotSearch: React.FC<PropertySearchProps> = ({ onSearch, initialFilters }) => {
    const [filters, setFilters] = React.useState<SearchFilters>(initialFilters);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const handleSelectChange = (name: keyof SearchFilters) => (value: string) => {
        setFilters(prev => ({ ...prev, [name]: value === 'all' ? null : value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({
            ...filters,
            area: filters.area ? Number(filters.area) : null
        });
    };
    
    const handleClear = () => {
        const clearedFilters = { location: '', area: null, usageType: null };
        setFilters(clearedFilters);
        onSearch(clearedFilters);
    };

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base">Filtrar Lotes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">Localização</Label>
                        <Input
                            id="location"
                            name="location"
                            placeholder="Ex: Viana"
                            value={filters.location}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="area">Área Mínima (m²)</Label>
                            <Input
                                id="area"
                                name="area"
                                type="number"
                                placeholder="Ex: 1000"
                                value={filters.area || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="usageType">Uso Permitido</Label>
                            <Select
                                name="usageType"
                                onValueChange={handleSelectChange('usageType')}
                                value={filters.usageType || 'all'}
                            >
                                <SelectTrigger id="usageType">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="residential">Residencial</SelectItem>
                                    <SelectItem value="commercial">Comercial</SelectItem>
                                    <SelectItem value="industrial">Industrial</SelectItem>
                                    <SelectItem value="mixed">Misto</SelectItem>
                                    <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                            <Search className="mr-2 h-4 w-4" />
                            Pesquisar
                        </Button>
                         <Button onClick={handleClear} variant="ghost" size="icon" type="button">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default LandPlotSearch;
