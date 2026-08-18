"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageView } from "@/components/project/manage-view";
import { ProjectHeader } from "@/components/project/project-header";
import { RoadmapView } from "@/components/project/roadmap-view";
import { StatsView } from "@/components/project/stats-view";
import { StepDetailSheet } from "@/components/project/step-detail-sheet";
import { enrichProject } from "@/lib/domain/aggregate";
import { useAppData } from "@/providers/app-data-provider";

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };
  const { data, isReady } = useAppData();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [view, setView] = useState("roadmap");

  const project = useMemo(
    () => enrichProject(data, projectId),
    [data, projectId],
  );

  if (!isReady) return null;

  if (!project) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="mt-6">
          <RoadmapView
            projectId={projectId}
            onSelectStep={setSelectedStepId}
          />
        </TabsContent>
        <TabsContent value="manage" className="mt-6">
          <ManageView projectId={projectId} onSelectStep={setSelectedStepId} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <StatsView projectId={projectId} />
        </TabsContent>
      </Tabs>

      <StepDetailSheet
        stepId={selectedStepId}
        open={Boolean(selectedStepId)}
        onOpenChange={(open) => !open && setSelectedStepId(null)}
      />
    </div>
  );
}
