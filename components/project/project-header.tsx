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
    <div className="border-b border-border pb-6">
      <div className="flex flex-col gap-4">
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="max-w-md"
            />
            <Button size="sm" onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <h1 className="text-xl font-medium sm:text-2xl">{project.title}</h1>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing(true)}
              aria-label="Edit title"
              className="shrink-0 opacity-50 hover:opacity-100"
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        )}

        <ProgressBar value={project.metrics.progress} showLabel />

        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm tabular-nums text-muted-foreground">
          <span>{project.metrics.progress}% done</span>
          <span>
            {project.metrics.completedStepCount}/{project.metrics.stepCount} steps
          </span>
          <span>
            <DurationText minutes={project.metrics.totalSpentMinutes} />
          </span>
        </div>
      </div>
    </div>
  );
}
