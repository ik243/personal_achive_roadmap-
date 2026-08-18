"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NotebookSection } from "@/components/layout/notebook-section";
import { DurationText } from "@/components/shared/duration-text";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import {
  buildActivityFeed,
  getAllProjectsWithMetrics,
  getGlobalMetrics,
  getStudyTimeByProject,
} from "@/lib/domain/aggregate";
import { groupMinutesByDay } from "@/lib/domain/time";
import { useAppData } from "@/providers/app-data-provider";

export default function DashboardPage() {
  const { data, isReady } = useAppData();

  if (!isReady) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 border-b border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const global = getGlobalMetrics(data);
  const projects = getAllProjectsWithMetrics(data);
  const activity = buildActivityFeed(data, 8);
  const studyByProject = getStudyTimeByProject(data).filter((p) => p.minutes > 0);
  const last7Days = groupMinutesByDay(data.timeLogs, 7);
  const weekMinutes = last7Days.reduce((sum, day) => sum + day.minutes, 0);

  if (projects.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          title="Nothing here yet."
          description="Create a project and start logging progress."
          action={
            <Link href="/projects/new" className={buttonVariants({ variant: "outline" })}>
              Create project
            </Link>
          }
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        actions={
          <Link href="/projects/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
            New project
          </Link>
        }
      />

      <div className="grid gap-x-8 sm:grid-cols-2">
        <StatCard label="Projects" value={String(global.activeProjectCount)} />
        <StatCard label="Progress" value={`${global.progress}%`} hint={`${global.completedWeight}/${global.activeWeight} pts`} />
        <StatCard label="Steps done" value={String(global.completedStepCount)} hint={`${global.stepCount} total`} />
        <StatCard
          label="Study time"
          value={<DurationText minutes={global.totalSpentMinutes} />}
          hint={formatWeek(weekMinutes) + " this week"}
        />
      </div>

      <NotebookSection title="Projects">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <Link href={`/projects/${project.id}`} className="hover:underline">
                  {project.title}
                </Link>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {project.metrics.progress}%
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar value={project.metrics.progress} />
              </div>
              <div className="mt-2 flex gap-4 font-mono text-xs text-muted-foreground tabular-nums">
                <span>{project.metrics.completedStepCount}/{project.metrics.stepCount} steps</span>
                <span><DurationText minutes={project.metrics.totalSpentMinutes} /></span>
              </div>
            </div>
          ))}
        </div>
      </NotebookSection>

      {global.inProgressSteps.length > 0 && (
        <NotebookSection title="In progress">
          <div className="space-y-3">
            {global.inProgressSteps.slice(0, 5).map((step) => {
              const project = data.projects.find((p) => p.id === step.projectId);
              const section = step.sectionId
                ? data.sections.find((s) => s.id === step.sectionId)
                : null;
              return (
                <div key={step.id} className="text-sm">
                  <p>{step.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[project?.title, section?.title].filter(Boolean).join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        </NotebookSection>
      )}

      {activity.length > 0 && (
        <NotebookSection title="Recent">
          <div className="space-y-2 text-sm">
            {activity.map((item) => (
              <div key={item.id}>
                <p>{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        </NotebookSection>
      )}

      {studyByProject.length > 0 && (
        <NotebookSection title="Time by project">
          <div className="space-y-2 text-sm">
            {studyByProject.map((entry) => (
              <div key={entry.projectId} className="flex justify-between gap-4">
                <span>{entry.title}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  <DurationText minutes={entry.minutes} />
                </span>
              </div>
            ))}
          </div>
        </NotebookSection>
      )}
    </div>
  );
}

function formatWeek(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
