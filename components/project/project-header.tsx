"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { DurationText } from "@/components/shared/duration-text";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                className="text-xl font-semibold"
              />
              <Button size="sm" onClick={save}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
              <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Edit title">
                <Pencil className="size-4" />
              </Button>
            </div>
          )}
          <div className="mt-4 max-w-xl">
            <ProgressBar value={project.metrics.progress} showLabel />
          </div>
        </div>
        <div className="flex gap-6 text-sm tabular-nums">
          <div>
            <p className="text-muted-foreground">Progress</p>
            <p className="text-lg font-semibold">{project.metrics.progress}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Steps</p>
            <p className="text-lg font-semibold">
              {project.metrics.completedStepCount} / {project.metrics.stepCount}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Time</p>
            <p className="text-lg font-semibold">
              <DurationText minutes={project.metrics.totalSpentMinutes} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
