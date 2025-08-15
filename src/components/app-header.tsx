
"use client";

import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

type AppHeaderProps = {
  onLocateClick: () => void;
  children?: React.ReactNode;
  searchBox: React.ReactNode;
};

export default function AppHeader({ onLocateClick, children, searchBox }: AppHeaderProps) {
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
      <div className="flex items-center gap-4">
        {children}
      </div>
    </header>
  );
}
