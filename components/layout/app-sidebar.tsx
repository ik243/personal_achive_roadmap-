"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { enrichProject, isProjectComplete } from "@/lib/domain/aggregate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const mainNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/activity", label: "Activity" },
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

  const linkClass = (active: boolean) =>
    cn(
      "block py-1.5 text-sm transition-colors",
      active
        ? "font-medium text-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-150",
        collapsed ? "w-14" : "w-52",
        className,
      )}
    >
      <div className="flex h-12 items-center justify-between px-3">
        {!collapsed && (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="font-heading text-base font-medium"
          >
            Roadmap
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
            className={cn("size-4", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-0.5">
          {mainNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={linkClass(active)}
              >
                {!collapsed ? item.label : item.label.charAt(0)}
              </Link>
            );
          })}
        </nav>

        {!collapsed && projects.length > 0 && (
          <div className="mt-6 border-t border-sidebar-border pt-4">
            <p className="mb-2 text-xs text-muted-foreground">Projects</p>
            <div className="space-y-2">
              {activeProjects.map((project) => {
                const href = `/projects/${project.id}`;
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={project.id}
                    href={href}
                    onClick={onNavigate}
                    className={cn(linkClass(active), "line-clamp-2 leading-snug")}
                  >
                    {project.title}
                    <span className="ml-1 tabular-nums text-muted-foreground">
                      {project.metrics.progress}%
                    </span>
                  </Link>
                );
              })}
              {completedProjects.length > 0 && (
                <>
                  <p className="pt-2 text-xs text-muted-foreground">Done</p>
                  {completedProjects.map((project) => {
                    const href = `/projects/${project.id}`;
                    return (
                      <Link
                        key={project.id}
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                          linkClass(pathname.startsWith(href)),
                          "line-clamp-2 leading-snug",
                        )}
                      >
                        {project.title}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-sidebar-border px-3 py-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={linkClass(pathname === "/settings")}
        >
          {!collapsed ? "Settings" : "S"}
        </Link>
      </div>
    </aside>
  );
}
