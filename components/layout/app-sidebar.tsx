"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  LayoutDashboard,
  Map,
  Settings,
} from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { enrichProject, isProjectComplete } from "@/lib/domain/aggregate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Map },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { data } = useAppData();

  const projects = data.projects
    .map((project) => enrichProject(data, project.id)!)
    .sort((a, b) => a.position - b.position);

  const activeProjects = projects.filter((p) => !isProjectComplete(p.metrics));
  const completedProjects = projects.filter((p) => isProjectComplete(p.metrics));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && (
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Roadmap
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <>
            <Separator className="my-4" />
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Projects
            </p>
            <div className="mt-2 space-y-3">
              {activeProjects.length > 0 && (
                <div className="space-y-1">
                  {activeProjects.map((project) => {
                    const href = `/projects/${project.id}`;
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={project.id}
                        href={href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60",
                        )}
                      >
                        <span className="line-clamp-1">{project.title}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {project.metrics.progress}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {completedProjects.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-xs text-muted-foreground">Completed</p>
                  {completedProjects.map((project) => {
                    const href = `/projects/${project.id}`;
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={project.id}
                        href={href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60",
                        )}
                      >
                        <span className="line-clamp-1">{project.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </ScrollArea>

      <div className="border-t p-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60",
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
