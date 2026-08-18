"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DurationText } from "@/components/shared/duration-text";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAllProjectsWithMetrics,
  isProjectComplete,
} from "@/lib/domain/aggregate";
import { formatDuration } from "@/lib/domain/time";
import { useAppData } from "@/providers/app-data-provider";

export default function ProjectsPage() {
  const { data, isReady, deleteProject } = useAppData();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isReady) return null;

  const projects = getAllProjectsWithMetrics(data);
  const active = projects.filter((p) => !isProjectComplete(p.metrics));
  const completed = projects.filter((p) => isProjectComplete(p.metrics));
  const toDelete = deleteId ? projects.find((p) => p.id === deleteId) : null;

  return (
    <>
      <PageHeader
        title="Projects"
        description="All your learning roadmaps."
        actions={
          <Link href="/projects/new" className={buttonVariants()}>
            <Plus className="size-4" />
            Create project
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No roadmaps yet."
          description="Create your first goal and start building the path toward it."
          action={
            <Link href="/projects/new" className={buttonVariants()}>Create project</Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <ProjectGrid
              title="Active"
              projects={active}
              onDelete={setDeleteId}
            />
          )}
          {completed.length > 0 && (
            <ProjectGrid
              title="Completed"
              projects={completed}
              onDelete={setDeleteId}
            />
          )}
        </div>
      )}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{toDelete?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {toDelete?.metrics.stepCount} steps and{" "}
              {formatDuration(toDelete?.metrics.totalSpentMinutes ?? 0)} of logged study history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteProject(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProjectGrid({
  title,
  projects,
  onDelete,
}: {
  title: string;
  projects: ReturnType<typeof getAllProjectsWithMetrics>;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                  {project.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => onDelete(project.id)}
                  aria-label="Delete project"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-4">
                <ProgressBar value={project.metrics.progress} showLabel />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{project.metrics.completedStepCount} / {project.metrics.stepCount} steps</span>
                <DurationText minutes={project.metrics.totalSpentMinutes} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
