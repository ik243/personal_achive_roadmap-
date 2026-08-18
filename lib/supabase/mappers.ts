import type {
  Project,
  Section,
  Step,
  StepStatus,
  TimeLog,
  AppData,
} from "@/lib/domain/types";

type ProjectRow = {
  id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type SectionRow = {
  id: string;
  project_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type StepRow = {
  id: string;
  project_id: string;
  section_id: string | null;
  title: string;
  status: StepStatus;
  weight: number;
  position: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type TimeLogRow = {
  id: string;
  step_id: string;
  duration_minutes: number;
  logged_at: string;
  created_at: string;
  updated_at: string;
};

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSection(row: SectionRow): Section {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapStep(row: StepRow): Step {
  return {
    id: row.id,
    projectId: row.project_id,
    sectionId: row.section_id,
    title: row.title,
    status: row.status,
    weight: row.weight,
    position: row.position,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTimeLog(row: TimeLogRow): TimeLog {
  return {
    id: row.id,
    stepId: row.step_id,
    durationMinutes: row.duration_minutes,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectToRow(project: Project): ProjectRow {
  return {
    id: project.id,
    title: project.title,
    position: project.position,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

export function sectionToRow(section: Section): SectionRow {
  return {
    id: section.id,
    project_id: section.projectId,
    title: section.title,
    position: section.position,
    created_at: section.createdAt,
    updated_at: section.updatedAt,
  };
}

export function stepToRow(step: Step): StepRow {
  return {
    id: step.id,
    project_id: step.projectId,
    section_id: step.sectionId,
    title: step.title,
    status: step.status,
    weight: step.weight,
    position: step.position,
    completed_at: step.completedAt,
    created_at: step.createdAt,
    updated_at: step.updatedAt,
  };
}

export function timeLogToRow(log: TimeLog): TimeLogRow {
  return {
    id: log.id,
    step_id: log.stepId,
    duration_minutes: log.durationMinutes,
    logged_at: log.loggedAt,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
  };
}

export type { ProjectRow, SectionRow, StepRow, TimeLogRow };
