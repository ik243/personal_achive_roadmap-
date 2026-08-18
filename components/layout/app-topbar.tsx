"use client";

import { Menu } from "lucide-react";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { Button } from "@/components/ui/button";

export function AppTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden shrink-0"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <AppBreadcrumbs />
      </div>
    </header>
  );
}
