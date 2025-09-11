"use client";

import { LocateFixed, MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ThemeSwitcher } from "./theme-switcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export type MapStyle = 'default' | 'night' | 'logistics';

type AppHeaderProps = {
  onLocateClick: () => void;
  children?: React.ReactNode;
  searchBox: React.ReactNode;
  onMapStyleChange: (style: MapStyle) => void;
  currentMapStyle: MapStyle;
};

const mapStyleOptions: { key: MapStyle, label: string }[] = [
    { key: 'default', label: 'Padrão' },
    { key: 'night', label: 'Noturno' },
    { key: 'logistics', label: 'Logística' },
];

export default function AppHeader({ onLocateClick, children, searchBox, onMapStyleChange, currentMapStyle }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-10">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="relative flex-1">
        {searchBox}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onLocateClick} aria-label="A minha localização">
              <LocateFixed className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>A minha localização</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <MapIcon className="h-4 w-4" />
                    <span className="sr-only">Estilo do Mapa</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {mapStyleOptions.map(option => (
                    <DropdownMenuItem key={option.key} onClick={() => onMapStyleChange(option.key)}>
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        {children}
      </div>
    </header>
  );
}
