"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DurationText } from "@/components/shared/duration-text";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
    ))}</div>;
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
        <PageHeader title="Dashboard" description="Your learning progress at a glance." />
        <EmptyState
          title="Your roadmap starts here."
          description="Create your first goal and begin turning it into measurable progress."
          action={
            <Link href="/projects/new" className={buttonVariants()}>
              <Plus className="size-4" />
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
        description="You are moving. Here is the evidence."
        actions={
          <Link href="/projects/new" className={buttonVariants()}>
            <Plus className="size-4" />
            New project
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={String(global.activeProjectCount)} />
        <StatCard label="Overall Progress" value={`${global.progress}%`} hint={`${global.completedWeight} / ${global.activeWeight} points`} />
        <StatCard label="Completed Steps" value={String(global.completedStepCount)} hint={`${global.stepCount} total`} />
        <StatCard label="Total Study Time" value={<DurationText minutes={global.totalSpentMinutes} />} hint={`${formatWeek(weekMinutes)} this week`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.title}
                    </Link>
                    <div className="mt-3">
                      <ProgressBar value={project.metrics.progress} showLabel />
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground tabular-nums">
                      <span>{project.metrics.completedStepCount} / {project.metrics.stepCount} steps</span>
                      <span><DurationText minutes={project.metrics.totalSpentMinutes} /></span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{project.metrics.progress}%</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently Studying</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {global.inProgressSteps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No steps in progress.</p>
              ) : (
                global.inProgressSteps.slice(0, 5).map((step) => {
                  const project = data.projects.find((p) => p.id === step.projectId);
                  const section = step.sectionId
                    ? data.sections.find((s) => s.id === step.sectionId)
                    : null;
                  return (
                    <div key={step.id} className="text-sm">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {[project?.title, section?.title].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="text-sm">
                    <p>{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {studyByProject.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Time by Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {studyByProject.map((entry) => (
              <div key={entry.projectId} className="flex items-center justify-between text-sm">
                <span>{entry.title}</span>
                <span className="tabular-nums text-muted-foreground">
                  <DurationText minutes={entry.minutes} />
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
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
