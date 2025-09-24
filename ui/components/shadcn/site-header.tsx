"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { Separator } from "@/ui/shadcn/separator";
import { useSidebar } from "@/ui/shadcn/sidebar";
import Image from "next/image";
import { ToggleTheme } from "../toggle-theme";

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
        <div className="relative h-full w-15 hidden sm:block">
          <Image
            src="/images/sti_logo.png"
            alt="STI"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-base font-medium hidden sm:block">
          Automated Class Scheduling System
        </h1>
        <h1 className="text-base font-medium block sm:hidden">STI ACSS</h1>
        <div className="ml-auto">
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
}
