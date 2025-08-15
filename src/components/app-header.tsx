"use client";

import { Search, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type AppHeaderProps = {
  onLocateClick: () => void;
};

export default function AppHeader({ onLocateClick }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-10">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar endereço ou ponto de interesse..."
          className="w-full pl-10"
        />
      </div>
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
    </header>
  );
}
