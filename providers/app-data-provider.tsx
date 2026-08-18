"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppData,
  AppSettings,
  Project,
  Section,
  Step,
  StepStatus,
  TimeLog,
  ThemePreference,
} from "@/lib/domain/types";
import {
  createId,
  deleteProjectFromData,
  deleteSectionFromData,
  deleteStepFromData,
  moveStepInData,
  nextPosition,
  nowIso,
  readAppData,
  readSettings,
  reorderItems,
  resetAppData,
  updateStepStatusInData,
  writeAppData,
  writeSettings,
} from "@/lib/storage/local";
import { completedAtForStatus } from "@/lib/domain/status";
import { createDemoData, createEmptyData } from "@/lib/seed/demo-data";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { fetchAppData, replaceAllData } from "@/lib/supabase/repository";
import { toast } from "sonner";

interface AppDataContextValue {
  data: AppData;
  settings: AppSettings;
  isReady: boolean;
  setTheme: (theme: ThemePreference) => void;
  resetDemoData: () => void;
  clearAllData: () => void;
  createProject: (title: string) => Project;
  updateProject: (id: string, title: string) => void;
  deleteProject: (id: string) => void;
  createSection: (projectId: string, title: string) => Section;
  updateSection: (id: string, title: string) => void;
  deleteSection: (id: string) => void;
  reorderSections: (projectId: string, activeId: string, overId: string) => void;
  createStep: (input: {
    projectId: string;
    sectionId?: string | null;
    title: string;
    weight?: number;
    status?: StepStatus;
  }) => Step;
  updateStep: (
    id: string,
    input: Partial<Pick<Step, "title" | "weight" | "status" | "sectionId">>,
  ) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (
    projectId: string,
    sectionId: string | null,
    activeId: string,
    overId: string,
  ) => void;
  moveStep: (stepId: string, sectionId: string | null, position: number) => void;
  addTimeLog: (stepId: string, durationMinutes: number, loggedAt: string) => TimeLog;
  updateTimeLog: (id: string, durationMinutes: number, loggedAt: string) => void;
  deleteTimeLog: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(createEmptyData());
  const [settings, setSettings] = useState<AppSettings>({ theme: "system" });
  const [isReady, setIsReady] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from storage on mount */
  useEffect(() => {
    async function hydrate() {
      if (isSupabaseEnabled()) {
        const client = createClient();
        if (client) {
          try {
            let remote = await fetchAppData(client);
            if (
              remote.projects.length === 0 &&
              remote.steps.length === 0
            ) {
              remote = createDemoData();
              await replaceAllData(client, remote);
            }
            setData(remote);
            writeAppData(remote);
            setSettings(readSettings());
            setIsReady(true);
            return;
          } catch (error) {
            console.error("Supabase load failed", error);
            toast.error("Could not load from Supabase. Using local data.");
          }
        }
      }

      const stored = readAppData();
      if (stored) setData(stored);
      else {
        const demo = createDemoData();
        writeAppData(demo);
        setData(demo);
      }
      setSettings(readSettings());
      setIsReady(true);
    }

    hydrate();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const syncToSupabase = useCallback(async (next: AppData) => {
    if (!isSupabaseEnabled()) return;
    const client = createClient();
    if (!client) return;
    try {
      await replaceAllData(client, next);
    } catch (error) {
      console.error("Supabase sync failed", error);
      toast.error("Failed to sync changes to Supabase.");
    }
  }, []);

  const persist = useCallback(
    (next: AppData) => {
      setData(next);
      writeAppData(next);
      void syncToSupabase(next);
    },
    [syncToSupabase],
  );

  const setTheme = useCallback((theme: ThemePreference) => {
    const next = { ...settings, theme };
    setSettings(next);
    writeSettings(next);
  }, [settings]);

  const resetDemoData = useCallback(() => {
    const curriculum = createDemoData();
    resetAppData(curriculum);
    setData(curriculum);
    void syncToSupabase(curriculum);
    toast.success("Curriculum loaded: RabbitMQ, Redis, System Design.");
  }, [syncToSupabase]);

  const clearAllData = useCallback(() => {
    const empty = createEmptyData();
    resetAppData(empty);
    setData(empty);
    void syncToSupabase(empty);
  }, [syncToSupabase]);

  const createProject = useCallback(
    (title: string): Project => {
      const timestamp = nowIso();
      const project: Project = {
        id: createId(),
        title: title.trim(),
        position: nextPosition(data.projects),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      persist({ ...data, projects: [...data.projects, project] });
      return project;
    },
    [data, persist],
  );

  const updateProject = useCallback(
    (id: string, title: string) => {
      persist({
        ...data,
        projects: data.projects.map((project) =>
          project.id === id
            ? { ...project, title: title.trim(), updatedAt: nowIso() }
            : project,
        ),
      });
    },
    [data, persist],
  );

  const deleteProject = useCallback(
    (id: string) => {
      persist(deleteProjectFromData(data, id));
    },
    [data, persist],
  );

  const createSection = useCallback(
    (projectId: string, title: string): Section => {
      const timestamp = nowIso();
      const siblings = data.sections.filter((section) => section.projectId === projectId);
      const section: Section = {
        id: createId(),
        projectId,
        title: title.trim(),
        position: nextPosition(siblings),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      persist({ ...data, sections: [...data.sections, section] });
      return section;
    },
    [data, persist],
  );

  const updateSection = useCallback(
    (id: string, title: string) => {
      persist({
        ...data,
        sections: data.sections.map((section) =>
          section.id === id
            ? { ...section, title: title.trim(), updatedAt: nowIso() }
            : section,
        ),
      });
    },
    [data, persist],
  );

  const deleteSection = useCallback(
    (id: string) => {
      persist(deleteSectionFromData(data, id));
    },
    [data, persist],
  );

  const reorderSections = useCallback(
    (projectId: string, activeId: string, overId: string) => {
      const siblings = data.sections.filter((section) => section.projectId === projectId);
      const reordered = reorderItems(siblings, activeId, overId);
      const otherSections = data.sections.filter((section) => section.projectId !== projectId);
      persist({
        ...data,
        sections: [...otherSections, ...reordered],
      });
    },
    [data, persist],
  );

  const createStep = useCallback(
    (input: {
      projectId: string;
      sectionId?: string | null;
      title: string;
      weight?: number;
      status?: StepStatus;
    }): Step => {
      const timestamp = nowIso();
      const sectionId = input.sectionId ?? null;
      const siblings = data.steps.filter(
        (step) =>
          step.projectId === input.projectId && step.sectionId === sectionId,
      );
      const step: Step = {
        id: createId(),
        projectId: input.projectId,
        sectionId,
        title: input.title.trim(),
        status: input.status ?? "NOT_STARTED",
        weight: input.weight ?? 1,
        position: nextPosition(siblings),
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null,
      };
      persist({ ...data, steps: [...data.steps, step] });
      return step;
    },
    [data, persist],
  );

  const updateStep = useCallback(
    (
      id: string,
      input: Partial<Pick<Step, "title" | "weight" | "status" | "sectionId">>,
    ) => {
      persist({
        ...data,
        steps: data.steps.map((step) => {
          if (step.id !== id) return step;
          const status = input.status ?? step.status;
          return {
            ...step,
            ...input,
            title: input.title?.trim() ?? step.title,
            completedAt:
              input.status !== undefined
                ? completedAtForStatus(status, step.completedAt)
                : step.completedAt,
            updatedAt: nowIso(),
          };
        }),
      });
    },
    [data, persist],
  );

  const deleteStep = useCallback(
    (id: string) => {
      persist(deleteStepFromData(data, id));
    },
    [data, persist],
  );

  const reorderSteps = useCallback(
    (projectId: string, sectionId: string | null, activeId: string, overId: string) => {
      const siblings = data.steps
        .filter(
          (step) => step.projectId === projectId && step.sectionId === sectionId,
        )
        .sort((a, b) => a.position - b.position);
      const reordered = reorderItems(siblings, activeId, overId);
      const otherSteps = data.steps.filter(
        (step) => step.projectId !== projectId || step.sectionId !== sectionId,
      );
      persist({ ...data, steps: [...otherSteps, ...reordered] });
    },
    [data, persist],
  );

  const moveStep = useCallback(
    (stepId: string, sectionId: string | null, position: number) => {
      persist(moveStepInData(data, stepId, sectionId, position));
    },
    [data, persist],
  );

  const addTimeLog = useCallback(
    (stepId: string, durationMinutes: number, loggedAt: string): TimeLog => {
      const timestamp = nowIso();
      const log: TimeLog = {
        id: createId(),
        stepId,
        durationMinutes,
        loggedAt,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      persist({ ...data, timeLogs: [...data.timeLogs, log] });
      return log;
    },
    [data, persist],
  );

  const updateTimeLog = useCallback(
    (id: string, durationMinutes: number, loggedAt: string) => {
      persist({
        ...data,
        timeLogs: data.timeLogs.map((log) =>
          log.id === id
            ? { ...log, durationMinutes, loggedAt, updatedAt: nowIso() }
            : log,
        ),
      });
    },
    [data, persist],
  );

  const deleteTimeLog = useCallback(
    (id: string) => {
      persist({
        ...data,
        timeLogs: data.timeLogs.filter((log) => log.id !== id),
      });
    },
    [data, persist],
  );

  const value = useMemo(
    () => ({
      data,
      settings,
      isReady,
      setTheme,
      resetDemoData,
      clearAllData,
      createProject,
      updateProject,
      deleteProject,
      createSection,
      updateSection,
      deleteSection,
      reorderSections,
      createStep,
      updateStep,
      deleteStep,
      reorderSteps,
      moveStep,
      addTimeLog,
      updateTimeLog,
      deleteTimeLog,
    }),
    [
      data,
      settings,
      isReady,
      setTheme,
      resetDemoData,
      clearAllData,
      createProject,
      updateProject,
      deleteProject,
      createSection,
      updateSection,
      deleteSection,
      reorderSections,
      createStep,
      updateStep,
      deleteStep,
      reorderSteps,
      moveStep,
      addTimeLog,
      updateTimeLog,
      deleteTimeLog,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}

export function useUpdateStepStatus() {
  const { data, updateStep } = useAppData();
  return (stepId: string, status: StepStatus) => {
    updateStep(stepId, { status });
    return updateStepStatusInData(data, stepId, status);
  };
}
