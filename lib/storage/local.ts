import type { AppData, AppSettings, Step, StepStatus } from "../domain/types";
import { completedAtForStatus } from "../domain/status";

const STORAGE_KEY = "roadmap-app-data-v1";
const SETTINGS_KEY = "roadmap-app-settings-v1";

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function readAppData(): AppData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

export function writeAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readSettings(): AppSettings {
  if (typeof window === "undefined") return { theme: "system" };
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { theme: "system" };
  try {
    return JSON.parse(raw) as AppSettings;
  } catch {
    return { theme: "system" };
  }
}

export function writeSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetAppData(data: AppData): void {
  writeAppData(data);
}

export function updateStepStatusInData(
  data: AppData,
  stepId: string,
  status: StepStatus,
): AppData {
  const steps = data.steps.map((step) => {
    if (step.id !== stepId) return step;
    return {
      ...step,
      status,
      completedAt: completedAtForStatus(status, step.completedAt),
      updatedAt: nowIso(),
    };
  });
  return { ...data, steps };
}

export function reorderItems<T extends { id: string; position: number }>(
  items: T[],
  activeId: string,
  overId: string,
): T[] {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  const oldIndex = sorted.findIndex((item) => item.id === activeId);
  const newIndex = sorted.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1) return items;

  const reordered = [...sorted];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);

  return reordered.map((item, index) => ({ ...item, position: index }));
}

export function nextPosition(items: Array<{ position: number }>): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.position)) + 1;
}

export function deleteProjectFromData(data: AppData, projectId: string): AppData {
  const stepIds = data.steps
    .filter((step) => step.projectId === projectId)
    .map((step) => step.id);

  return {
    projects: data.projects.filter((project) => project.id !== projectId),
    sections: data.sections.filter((section) => section.projectId !== projectId),
    steps: data.steps.filter((step) => step.projectId !== projectId),
    timeLogs: data.timeLogs.filter((log) => !stepIds.includes(log.stepId)),
  };
}

export function deleteSectionFromData(data: AppData, sectionId: string): AppData {
  const sectionSteps = data.steps.filter((step) => step.sectionId === sectionId);
  const stepIds = sectionSteps.map((step) => step.id);

  return {
    ...data,
    sections: data.sections.filter((section) => section.id !== sectionId),
    steps: data.steps.map((step) =>
      step.sectionId === sectionId
        ? { ...step, sectionId: null, updatedAt: nowIso() }
        : step,
    ),
    timeLogs: data.timeLogs.filter((log) => !stepIds.includes(log.stepId)),
  };
}

export function deleteStepFromData(data: AppData, stepId: string): AppData {
  return {
    ...data,
    steps: data.steps.filter((step) => step.id !== stepId),
    timeLogs: data.timeLogs.filter((log) => log.stepId !== stepId),
  };
}

export function moveStepInData(
  data: AppData,
  stepId: string,
  sectionId: string | null,
  position: number,
): AppData {
  const steps = data.steps.map((step) => {
    if (step.id !== stepId) return step;
    return {
      ...step,
      sectionId,
      position,
      updatedAt: nowIso(),
    };
  });
  return { ...data, steps };
}

export function getStepContext(data: AppData, step: Step) {
  const project = data.projects.find((p) => p.id === step.projectId);
  const section = step.sectionId
    ? data.sections.find((s) => s.id === step.sectionId)
    : null;
  return { project, section };
}
