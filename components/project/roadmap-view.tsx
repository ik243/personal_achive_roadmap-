"use client";

import { motion } from "framer-motion";
import {
  enrichSection,
  getProjectSections,
  getUngroupedSteps,
} from "@/lib/domain/aggregate";
import { useAppData } from "@/providers/app-data-provider";
import { RoadmapSection } from "./roadmap-section";
import { RoadmapStepNode } from "./roadmap-step-node";

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
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        This project has no steps yet. Add a step directly or create a section to structure the roadmap.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {ungrouped.length > 0 && (
        <section>
          <h3 className="mb-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ungrouped
          </h3>
          <div className="mx-auto max-w-md space-y-0">
            {ungrouped.map((step, index) => (
              <RoadmapStepNode
                key={step.id}
                step={step}
                index={index}
                isLast={index === ungrouped.length - 1}
                onSelect={() => onSelectStep(step.id)}
              />
            ))}
          </div>
        </section>
      )}

      {sections.map((section, sectionIndex) => {
        const enriched = enrichSection(data, section.id)!;
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.05 }}
          >
            <RoadmapSection
              section={enriched}
              onSelectStep={onSelectStep}
            />
            {sectionIndex < sections.length - 1 && (
              <div className="my-8 flex justify-center">
                <div className="h-8 w-px bg-border" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
