"use client";

import { Menu } from "lucide-react";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { Button } from "@/components/ui/button";

export function AppTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-11 items-center gap-3 px-4 sm:px-6">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden shrink-0"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
        )}
        <AppBreadcrumbs />
      </div>
    </header>
  );
}
