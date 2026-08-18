"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DurationText } from "@/components/shared/duration-text";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  enrichSection,
  getProjectSections,
  getUngroupedSteps,
} from "@/lib/domain/aggregate";
import type { Step } from "@/lib/domain/types";
import { useAppData } from "@/providers/app-data-provider";
import { cn } from "@/lib/utils";
import { AddStepDialog } from "./add-step-dialog";

export function ManageView({
  projectId,
  onSelectStep,
}: {
  projectId: string;
  onSelectStep: (stepId: string) => void;
}) {
  const {
    data,
    createSection,
    reorderSections,
    reorderSteps,
    moveStep,
    deleteSection,
  } = useAppData();
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sections = getProjectSections(data, projectId);
  const ungrouped = getUngroupedSteps(data, projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("section:")) {
      reorderSections(projectId, activeId.replace("section:", ""), overId.replace("section:", ""));
      return;
    }

    if (activeId.startsWith("step:")) {
      const stepId = activeId.replace("step:", "");
      const step = data.steps.find((s) => s.id === stepId);
      if (!step) return;

      if (overId.startsWith("step:")) {
        const overStepId = overId.replace("step:", "");
        const overStep = data.steps.find((s) => s.id === overStepId);
        if (!overStep) return;
        reorderSteps(projectId, overStep.sectionId, stepId, overStepId);
        if (step.sectionId !== overStep.sectionId) {
          moveStep(stepId, overStep.sectionId, overStep.position);
        }
      } else if (overId.startsWith("container:")) {
        const sectionId = overId === "container:ungrouped" ? null : overId.replace("container:section:", "");
        const targetSteps = data.steps.filter(
          (s) => s.projectId === projectId && s.sectionId === sectionId && s.id !== stepId,
        );
        moveStep(stepId, sectionId, targetSteps.length);
      }
    }
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    createSection(projectId, newSectionTitle);
    setNewSectionTitle("");
  };

  const activeStep = activeDragId?.startsWith("step:")
    ? data.steps.find((s) => s.id === activeDragId.replace("step:", ""))
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <AddStepDialog projectId={projectId} />
          <div className="flex gap-2">
            <Input
              placeholder="Section title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
              className="w-48"
            />
            <Button variant="outline" onClick={addSection}>
              <Plus className="size-4" />
              Add Section
            </Button>
          </div>
        </div>

        <SortableContext
          items={sections.map((s) => `section:${s.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => {
            const enriched = enrichSection(data, section.id)!;
            const steps = data.steps
              .filter((s) => s.sectionId === section.id)
              .sort((a, b) => a.position - b.position);

            return (
              <SortableSectionBlock
                key={section.id}
                sectionId={section.id}
                title={section.title}
                metrics={enriched.metrics}
                onDelete={() => deleteSection(section.id)}
              >
                <StepList
                  sectionId={section.id}
                  steps={steps}
                  onSelectStep={onSelectStep}
                />
                <AddStepDialog projectId={projectId} sectionId={section.id} variant="inline" />
              </SortableSectionBlock>
            );
          })}
        </SortableContext>

        <div
          id="container:ungrouped"
          className="rounded-xl border p-4"
          data-container="ungrouped"
        >
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Ungrouped</h3>
          <StepList
            sectionId={null}
            steps={ungrouped}
            onSelectStep={onSelectStep}
          />
          <AddStepDialog projectId={projectId} variant="inline" />
        </div>
      </div>

      <DragOverlay>
        {activeStep && (
          <div className="rounded-lg border bg-card p-3 shadow-lg">
            {activeStep.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function SortableSectionBlock({
  sectionId,
  title,
  metrics,
  onDelete,
  children,
}: {
  sectionId: string;
  title: string;
  metrics: { progress: number; totalSpentMinutes: number };
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `section:${sectionId}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-xl border p-4", isDragging && "opacity-50")}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
            aria-label="Drag section"
          >
            <GripVertical className="size-4" />
          </button>
          <h3 className="font-medium truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm tabular-nums">
          <ProgressBar value={metrics.progress} className="w-24" size="sm" />
          <DurationText minutes={metrics.totalSpentMinutes} className="text-muted-foreground" />
          <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete section">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

function StepList({
  sectionId,
  steps,
  onSelectStep,
}: {
  sectionId: string | null;
  steps: Step[];
  onSelectStep: (id: string) => void;
}) {
  const containerId =
    sectionId === null ? "container:ungrouped" : `container:section:${sectionId}`;

  return (
    <SortableContext
      items={steps.map((s) => `step:${s.id}`)}
      strategy={verticalListSortingStrategy}
      id={containerId}
    >
      <div className="space-y-2" data-container={containerId}>
        {steps.map((step) => (
          <SortableStepRow key={step.id} step={step} onSelect={() => onSelectStep(step.id)} />
        ))}
      </div>
    </SortableContext>
  );
}

function SortableStepRow({
  step,
  onSelect,
}: {
  step: Step;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `step:${step.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background px-3 py-2",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        className="touch-none text-muted-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag step"
      >
        <GripVertical className="size-4" />
      </button>
      <button type="button" className="flex-1 text-left text-sm" onClick={onSelect}>
        {step.title}
      </button>
      <span className="text-xs text-muted-foreground tabular-nums">{step.weight} pts</span>
      <StatusBadge status={step.status} />
    </div>
  );
}
