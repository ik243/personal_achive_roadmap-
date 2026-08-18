"use client";

import {
  enrichProject,
  enrichSection,
  getProjectSections,
  getProjectSteps,
} from "@/lib/domain/aggregate";
import { formatDuration, groupMinutesByDay } from "@/lib/domain/time";
import { DurationText } from "@/components/shared/duration-text";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/providers/app-data-provider";

export function StatsView({ projectId }: { projectId: string }) {
  const { data } = useAppData();
  const project = enrichProject(data, projectId)!;
  const sections = getProjectSections(data, projectId);
  const steps = getProjectSteps(data, projectId);
  const completed = steps.filter((s) => s.status === "COMPLETED").length;
  const inProgress = steps.filter((s) => s.status === "IN_PROGRESS").length;
  const paused = steps.filter((s) => s.status === "PAUSED").length;
  const remaining = steps.filter(
    (s) => s.status !== "COMPLETED" && s.status !== "SKIPPED",
  ).length;

  const stepIds = new Set(steps.map((s) => s.id));
  const projectLogs = data.timeLogs.filter((log) => stepIds.has(log.stepId));
  const last30 = groupMinutesByDay(projectLogs, 30);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Progress" value={`${project.metrics.progress}%`} />
        <StatCard
          label="Completed Weight"
          value={`${project.metrics.completedWeight} / ${project.metrics.activeWeight}`}
        />
        <StatCard
          label="Steps"
          value={`${project.metrics.completedStepCount} / ${project.metrics.stepCount}`}
        />
        <StatCard
          label="Study Time"
          value={<DurationText minutes={project.metrics.totalSpentMinutes} />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>Completed: {completed}</div>
          <div>In progress: {inProgress}</div>
          <div>Paused: {paused}</div>
          <div>Remaining: {remaining}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section) => {
            const enriched = enrichSection(data, section.id)!;
            return (
              <div key={section.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{section.title}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {enriched.metrics.progress}% · {formatDuration(enriched.metrics.totalSpentMinutes)}
                  </span>
                </div>
                <ProgressBar value={enriched.metrics.progress} size="sm" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Time — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {last30.map((day) => {
              const max = Math.max(...last30.map((d) => d.minutes), 1);
              const height = (day.minutes / max) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80 min-h-[2px]"
                    style={{ height: `${height}%` }}
                    title={formatDuration(day.minutes)}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
