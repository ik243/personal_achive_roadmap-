"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NotebookSection } from "@/components/layout/notebook-section";
import { DurationText } from "@/components/shared/duration-text";
import { TimeByDayChart } from "@/components/shared/time-by-day-chart";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { buildActivityFeed, getGlobalMetrics } from "@/lib/domain/aggregate";
import { groupMinutesByDay } from "@/lib/domain/time";
import { useAppData } from "@/providers/app-data-provider";

type Filter = "7" | "30" | "all";

export default function ActivityPage() {
  const { data, isReady } = useAppData();
  const [filter, setFilter] = useState<Filter>("30");

  if (!isReady) return null;

  const global = getGlobalMetrics(data);
  const days = filter === "7" ? 7 : filter === "30" ? 30 : 365;
  const chart = groupMinutesByDay(data.timeLogs, days);
  const filteredLogs = data.timeLogs
    .filter((log) => {
      if (filter === "all") return true;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return new Date(log.loggedAt) >= cutoff;
    })
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  const activity = buildActivityFeed(data, 15);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity"
        actions={
          <div className="flex gap-1">
            {(["7", "30", "all"] as Filter[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : `${f}d`}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-x-8 sm:grid-cols-3">
        <StatCard label="Logged" value={<DurationText minutes={global.totalSpentMinutes} />} />
        <StatCard label="Steps done" value={String(global.completedStepCount)} />
        <StatCard label="In progress" value={String(global.inProgressStepCount)} />
      </div>

      <NotebookSection title="Time by day">
        <TimeByDayChart data={chart} heightClass="h-32 sm:h-40" />
      </NotebookSection>

      <NotebookSection title="Time log">
        {filteredLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged in this period.</p>
        ) : (
          <div className="space-y-0">
            {filteredLogs.map((log) => {
              const step = data.steps.find((s) => s.id === log.stepId);
              const project = step
                ? data.projects.find((p) => p.id === step.projectId)
                : null;
              const section = step?.sectionId
                ? data.sections.find((s) => s.id === step.sectionId)
                : null;
              return (
                <div
                  key={log.id}
                  className="flex justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0"
                >
                  <div>
                    <p>{step?.title ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {[project?.title, section?.title].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <DurationText minutes={log.durationMinutes} />
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.loggedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </NotebookSection>

      {activity.length > 0 && (
        <NotebookSection title="Progress">
          <div className="space-y-2 text-sm">
            {activity.map((item) => (
              <p key={item.id}>{item.title}</p>
            ))}
          </div>
        </NotebookSection>
      )}
    </div>
  );
}
