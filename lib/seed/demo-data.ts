import type { AppData } from "../domain/types";
import { createCurriculumData } from "./curriculum-data";

export function createEmptyData(): AppData {
  return {
    projects: [],
    sections: [],
    steps: [],
    timeLogs: [],
  };
}

/** Loads the RabbitMQ, Redis, and System Design curriculum (385 topics). */
export function createDemoData(): AppData {
  return createCurriculumData();
}
