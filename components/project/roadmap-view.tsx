"use client";

import {
  enrichSection,
  getProjectSections,
  getUngroupedSteps,
} from "@/lib/domain/aggregate";
import { useAppData } from "@/providers/app-data-provider";
import { RoadmapChain } from "./roadmap-chain";
import { RoadmapSection } from "./roadmap-section";

export function RoadmapView({
  projectId,
  onSelectStep,
}: {
  projectId: string;
  onSelectStep: (stepId: string) => void;
}) {
  const { data } = useAppData();
  const sections = getProjectSections(data, projectId);
  const ungrouped = getUngroupedSteps(data, projectId);

  const hasContent = sections.length > 0 || ungrouped.length > 0;

  if (!hasContent) {
    return (
      <p className="border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
        No steps yet. Add steps or create a section to build your chain.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {ungrouped.length > 0 && (
        <section className="border-l-2 border-dashed border-border pl-5 sm:pl-6">
          <h3 className="mb-4 text-sm text-muted-foreground">Ungrouped</h3>
          <RoadmapChain steps={ungrouped} onSelectStep={onSelectStep} />
        </section>
      )}

      {sections.map((section) => {
        const enriched = enrichSection(data, section.id)!;
        return (
          <RoadmapSection
            key={section.id}
            section={enriched}
            onSelectStep={onSelectStep}
          />
        );
      })}
    </div>
  );
}
