"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { DurationText } from "@/components/shared/duration-text";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProjectWithMetrics } from "@/lib/domain/types";
import { useAppData } from "@/providers/app-data-provider";

export function ProjectHeader({ project }: { project: ProjectWithMetrics }) {
  const { updateProject } = useAppData();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);

  const save = () => {
    if (title.trim()) {
      updateProject(project.id, title);
      setEditing(false);
    }
  };

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            {editing ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  className="max-w-md text-lg font-semibold sm:text-xl"
                />
                <Button size="sm" onClick={save}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {project.title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  aria-label="Edit title"
                  className="shrink-0"
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            )}
            <div className="max-w-xl">
              <ProgressBar value={project.metrics.progress} showLabel />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <Stat label="Progress" value={`${project.metrics.progress}%`} />
            <Stat
              label="Steps"
              value={`${project.metrics.completedStepCount}/${project.metrics.stepCount}`}
            />
            <Stat
              label="Time"
              value={<DurationText minutes={project.metrics.totalSpentMinutes} />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-center sm:px-4 sm:py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">{value}</p>
    </div>
  );
}
