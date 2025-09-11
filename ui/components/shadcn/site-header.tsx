"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { Separator } from "@/ui/shadcn/separator";
import { useSidebar } from "@/ui/shadcn/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {/* LOGO */}
        {/* <Image src={STI_LOGO} alt="Logo of STI College" height={20} className="hidden sm:block"/> */}
        <h1 className="text-base font-medium">Automated Class Scheduling System</h1>
      </div>
    </header>
  );
}
