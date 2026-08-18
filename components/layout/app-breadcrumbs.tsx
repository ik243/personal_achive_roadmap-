"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppData } from "@/providers/app-data-provider";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  new: "Create project",
  activity: "Activity",
  settings: "Settings",
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const { data } = useAppData();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: Array<{ href?: string; label: string }> = [];

  if (segments[0] === "projects" && segments.length >= 2 && segments[1] !== "new") {
    const projectId = segments[1];
    const project = data.projects.find((p) => p.id === projectId);

    crumbs.push({ href: "/projects", label: "Projects" });
    crumbs.push({
      label: project?.title ?? "Project",
    });
  } else {
    let path = "";
    for (const segment of segments) {
      path += `/${segment}`;
      const label = routeLabels[segment] ?? segment;
      const isLast = segment === segments[segments.length - 1];
      crumbs.push({
        href: isLast ? undefined : path,
        label,
      });
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <span key={`${crumb.label}-${index}`} className="contents">
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-xs">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
