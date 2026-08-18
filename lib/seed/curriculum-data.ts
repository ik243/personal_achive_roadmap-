import type { AppData } from "../domain/types";
import { createId, nowIso } from "../storage/local";
import curriculum from "./curriculum-topics.json";

interface CurriculumTopic {
  title: string;
  weight: number;
}

interface CurriculumSection {
  title: string;
  topics: CurriculumTopic[];
}

interface CurriculumProject {
  title: string;
  sections: CurriculumSection[];
}

function buildCurriculumData(): AppData {
  const timestamp = nowIso();
  const projects: AppData["projects"] = [];
  const sections: AppData["sections"] = [];
  const steps: AppData["steps"] = [];

  (curriculum.projects as CurriculumProject[]).forEach((projectSpec, projectIndex) => {
    const projectId = createId();
    projects.push({
      id: projectId,
      title: projectSpec.title,
      position: projectIndex,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    projectSpec.sections.forEach((sectionSpec, sectionIndex) => {
      const sectionId = createId();
      sections.push({
        id: sectionId,
        projectId,
        title: sectionSpec.title,
        position: sectionIndex,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      sectionSpec.topics.forEach((topic, stepIndex) => {
        steps.push({
          id: createId(),
          projectId,
          sectionId,
          title: topic.title,
          status: "NOT_STARTED",
          weight: topic.weight,
          position: stepIndex,
          createdAt: timestamp,
          updatedAt: timestamp,
          completedAt: null,
        });
      });
    });
  });

  return {
    projects,
    sections,
    steps,
    timeLogs: [],
  };
}

export function createCurriculumData(): AppData {
  return buildCurriculumData();
}

export function getCurriculumStats() {
  const projects = curriculum.projects as CurriculumProject[];
  const stepCount = projects.reduce(
    (sum, project) =>
      sum + project.sections.reduce((secSum, section) => secSum + section.topics.length, 0),
    0,
  );
  return {
    projectCount: projects.length,
    stepCount,
    sectionCount: projects.reduce((sum, p) => sum + p.sections.length, 0),
  };
}
