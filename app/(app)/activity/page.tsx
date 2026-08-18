"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DurationText } from "@/components/shared/duration-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        title="Study Activity"
        description="Time history and progress events."
        actions={
          <div className="flex gap-2">
            {(["7", "30", "all"] as Filter[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All time" : `${f} days`}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              <DurationText minutes={global.totalSpentMinutes} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {global.completedStepCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {global.inProgressStepCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time by day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {chart.map((day) => {
              const max = Math.max(...chart.map((d) => d.minutes), 1);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80 min-h-[2px]"
                    style={{ height: `${(day.minutes / max) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No time logged in this period.</p>
          ) : (
            filteredLogs.map((log) => {
              const step = data.steps.find((s) => s.id === log.stepId);
              const project = step
                ? data.projects.find((p) => p.id === step.projectId)
                : null;
              const section = step?.sectionId
                ? data.sections.find((s) => s.id === step.sectionId)
                : null;
              return (
                <div key={log.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{step?.title ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {[project?.title, section?.title].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <DurationText minutes={log.durationMinutes} />
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.loggedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activity.map((item) => (
            <p key={item.id} className="text-sm">{item.title}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
