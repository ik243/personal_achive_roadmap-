export const STEP_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "SKIPPED",
] as const;

export type StepStatus = (typeof STEP_STATUSES)[number];

export interface Project {
  id: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  projectId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  id: string;
  projectId: string;
  sectionId: string | null;
  title: string;
  status: StepStatus;
  weight: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TimeLog {
  id: string;
  stepId: string;
  durationMinutes: number;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];
  sections: Section[];
  steps: Step[];
  timeLogs: TimeLog[];
}

export interface ProgressMetrics {
  progress: number;
  totalWeight: number;
  completedWeight: number;
  activeWeight: number;
  stepCount: number;
  completedStepCount: number;
  totalSpentMinutes: number;
}

export interface ProjectWithMetrics extends Project {
  metrics: ProgressMetrics;
}

export interface SectionWithMetrics extends Section {
  metrics: ProgressMetrics;
}

export interface StepWithMetrics extends Step {
  totalSpentMinutes: number;
}

export interface ActivityItem {
  id: string;
  type: "completed" | "time_logged" | "started" | "status_changed";
  title: string;
  subtitle?: string;
  minutes?: number;
  timestamp: string;
}

export type ThemePreference = "light" | "dark" | "system";

export interface AppSettings {
  theme: ThemePreference;
}
