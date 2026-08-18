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
import { ProgressBar } from "@/components/shared/progress-bar";
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
  onNavigate,
  className,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { data } = useAppData();

  const projects = data.projects
    .map((project) => enrichProject(data, project.id)!)
    .sort((a, b) => a.position - b.position);

  const activeProjects = projects.filter((p) => !isProjectComplete(p.metrics));
  const completedProjects = projects.filter((p) => isProjectComplete(p.metrics));

  const navLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
        : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
    );

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        {!collapsed && (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              R
            </span>
            <span>Roadmap</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0"
        >
          <ChevronLeft
            className={cn("size-4 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={navLinkClass(active)}
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
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </p>
            <div className="mt-2 space-y-4">
              {activeProjects.length > 0 && (
                <div className="space-y-1">
                  {activeProjects.map((project) => {
                    const href = `/projects/${project.id}`;
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={project.id}
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-lg px-3 py-2.5 transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-sidebar-accent/70",
                        )}
                      >
                        <span className="line-clamp-2 text-sm font-medium leading-snug">
                          {project.title}
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                          <ProgressBar
                            value={project.metrics.progress}
                            size="sm"
                            className="flex-1"
                          />
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {project.metrics.progress}%
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {completedProjects.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-xs font-medium text-muted-foreground">
                    Completed
                  </p>
                  {completedProjects.map((project) => {
                    const href = `/projects/${project.id}`;
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={project.id}
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/70",
                        )}
                      >
                        <span className="line-clamp-2 leading-snug">{project.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {projects.length === 0 && (
                <p className="px-3 text-xs text-muted-foreground">No projects yet.</p>
              )}
            </div>
          </>
        )}
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={navLinkClass(pathname === "/settings")}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
