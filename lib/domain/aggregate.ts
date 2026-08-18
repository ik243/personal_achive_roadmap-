import { buildProgressMetrics } from "./progress";
import type {
  ActivityItem,
  AppData,
  ProjectWithMetrics,
  SectionWithMetrics,
  Step,
  StepWithMetrics,
} from "./types";

export function getProjectSteps(data: AppData, projectId: string): Step[] {
  return data.steps.filter((step) => step.projectId === projectId);
}

export function getSectionSteps(data: AppData, sectionId: string): Step[] {
  return data.steps.filter((step) => step.sectionId === sectionId);
}

export function getProjectSections(data: AppData, projectId: string) {
  return data.sections
    .filter((section) => section.projectId === projectId)
    .sort((a, b) => a.position - b.position);
}

export function getUngroupedSteps(data: AppData, projectId: string): Step[] {
  return data.steps
    .filter((step) => step.projectId === projectId && step.sectionId === null)
    .sort((a, b) => a.position - b.position);
}

export function getStepsForSectionSorted(data: AppData, sectionId: string): Step[] {
  return getSectionSteps(data, sectionId).sort((a, b) => a.position - b.position);
}

export function enrichProject(data: AppData, projectId: string): ProjectWithMetrics | null {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) return null;

  const steps = getProjectSteps(data, projectId);
  const metrics = buildProgressMetrics(steps, data.timeLogs);

  return { ...project, metrics };
}

export function enrichSection(
  data: AppData,
  sectionId: string,
): SectionWithMetrics | null {
  const section = data.sections.find((item) => item.id === sectionId);
  if (!section) return null;

  const steps = getSectionSteps(data, sectionId);
  const metrics = buildProgressMetrics(steps, data.timeLogs);

  return { ...section, metrics };
}

export function enrichStep(data: AppData, stepId: string): StepWithMetrics | null {
  const step = data.steps.find((item) => item.id === stepId);
  if (!step) return null;

  const logs = data.timeLogs.filter((log) => log.stepId === stepId);
  const totalSpentMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);

  return { ...step, totalSpentMinutes };
}

export function getAllProjectsWithMetrics(data: AppData): ProjectWithMetrics[] {
  return data.projects
    .sort((a, b) => a.position - b.position)
    .map((project) => enrichProject(data, project.id)!);
}

export function getGlobalMetrics(data: AppData) {
  const metrics = buildProgressMetrics(data.steps, data.timeLogs);
  const inProgressSteps = data.steps.filter((step) => step.status === "IN_PROGRESS");
  const activeProjects = data.projects.filter((project) => {
    const projectMetrics = enrichProject(data, project.id);
    return projectMetrics && !isProjectComplete(projectMetrics.metrics);
  });

  return {
    ...metrics,
    projectCount: data.projects.length,
    activeProjectCount: activeProjects.length,
    inProgressStepCount: inProgressSteps.length,
    inProgressSteps,
  };
}

export function isProjectComplete(metrics: { activeWeight: number; completedWeight: number }) {
  return metrics.activeWeight > 0 && metrics.completedWeight === metrics.activeWeight;
}

export function buildActivityFeed(data: AppData, limit = 20): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const step of data.steps) {
    if (step.completedAt) {
      const project = data.projects.find((p) => p.id === step.projectId);
      const section = step.sectionId
        ? data.sections.find((s) => s.id === step.sectionId)
        : null;
      items.push({
        id: `completed-${step.id}`,
        type: "completed",
        title: `Completed ${step.title}`,
        subtitle: [project?.title, section?.title].filter(Boolean).join(" · "),
        timestamp: step.completedAt,
      });
    }

    if (step.status === "IN_PROGRESS") {
      const project = data.projects.find((p) => p.id === step.projectId);
      const section = step.sectionId
        ? data.sections.find((s) => s.id === step.sectionId)
        : null;
      items.push({
        id: `started-${step.id}`,
        type: "started",
        title: `Started ${step.title}`,
        subtitle: [project?.title, section?.title].filter(Boolean).join(" · "),
        timestamp: step.updatedAt,
      });
    }
  }

  for (const log of data.timeLogs) {
    const step = data.steps.find((s) => s.id === log.stepId);
    if (!step) continue;
    const project = data.projects.find((p) => p.id === step.projectId);
    const section = step.sectionId
      ? data.sections.find((s) => s.id === step.sectionId)
      : null;
    items.push({
      id: `time-${log.id}`,
      type: "time_logged",
      title: `Logged ${formatMinutes(log.durationMinutes)} on ${step.title}`,
      subtitle: [project?.title, section?.title].filter(Boolean).join(" · "),
      minutes: log.durationMinutes,
      timestamp: log.loggedAt,
    });
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getTimeLogsForProject(data: AppData, projectId: string) {
  const stepIds = new Set(getProjectSteps(data, projectId).map((step) => step.id));
  return data.timeLogs
    .filter((log) => stepIds.has(log.stepId))
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
}

export function getStudyTimeByProject(data: AppData) {
  return data.projects.map((project) => {
    const steps = getProjectSteps(data, project.id);
    const stepIds = steps.map((step) => step.id);
    const minutes = data.timeLogs
      .filter((log) => stepIds.includes(log.stepId))
      .reduce((sum, log) => sum + log.durationMinutes, 0);
    return { projectId: project.id, title: project.title, minutes };
  });
}
