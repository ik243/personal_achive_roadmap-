import type { AppData } from "../domain/types";
import { createId, nowIso } from "../storage/local";

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function createDemoData(): AppData {
  const projectId = createId();
  const databasesId = createId();
  const systemDesignId = createId();
  const infrastructureId = createId();

  const createdAt = daysAgoIso(30);
  const updatedAt = nowIso();

  const stepsData: Array<{
    title: string;
    sectionId: string | null;
    status: "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "SKIPPED";
    weight: number;
    position: number;
    completedAt?: string;
  }> = [
    { title: "PostgreSQL Fundamentals", sectionId: databasesId, status: "COMPLETED", weight: 2, position: 0, completedAt: daysAgoIso(12) },
    { title: "Indexes & Query Planning", sectionId: databasesId, status: "COMPLETED", weight: 3, position: 1, completedAt: daysAgoIso(10) },
    { title: "Transactions", sectionId: databasesId, status: "IN_PROGRESS", weight: 3, position: 2 },
    { title: "MongoDB Fundamentals", sectionId: databasesId, status: "NOT_STARTED", weight: 2, position: 3 },
    { title: "Redis Data Types", sectionId: databasesId, status: "COMPLETED", weight: 2, position: 4, completedAt: daysAgoIso(8) },
    { title: "Redis Persistence", sectionId: databasesId, status: "IN_PROGRESS", weight: 3, position: 5 },
    { title: "Redis Pub/Sub", sectionId: databasesId, status: "NOT_STARTED", weight: 3, position: 6 },
    { title: "Vertical vs Horizontal Scaling", sectionId: systemDesignId, status: "COMPLETED", weight: 2, position: 0, completedAt: daysAgoIso(14) },
    { title: "Load Balancing", sectionId: systemDesignId, status: "IN_PROGRESS", weight: 3, position: 1 },
    { title: "Caching", sectionId: systemDesignId, status: "NOT_STARTED", weight: 4, position: 2 },
    { title: "Replication", sectionId: systemDesignId, status: "NOT_STARTED", weight: 3, position: 3 },
    { title: "Partitioning", sectionId: systemDesignId, status: "NOT_STARTED", weight: 3, position: 4 },
    { title: "Message Queues", sectionId: systemDesignId, status: "NOT_STARTED", weight: 4, position: 5 },
    { title: "Docker", sectionId: infrastructureId, status: "COMPLETED", weight: 2, position: 0, completedAt: daysAgoIso(20) },
    { title: "CI/CD", sectionId: infrastructureId, status: "PAUSED", weight: 3, position: 1 },
    { title: "AWS EC2", sectionId: infrastructureId, status: "NOT_STARTED", weight: 3, position: 2 },
    { title: "AWS S3", sectionId: infrastructureId, status: "NOT_STARTED", weight: 2, position: 3 },
    { title: "AWS RDS", sectionId: infrastructureId, status: "NOT_STARTED", weight: 3, position: 4 },
    { title: "Git Workflow", sectionId: null, status: "COMPLETED", weight: 1, position: 0, completedAt: daysAgoIso(25) },
    { title: "TypeScript Deep Dive", sectionId: null, status: "IN_PROGRESS", weight: 3, position: 1 },
  ];

  const steps = stepsData.map((item) => ({
    id: createId(),
    projectId,
    sectionId: item.sectionId,
    title: item.title,
    status: item.status,
    weight: item.weight,
    position: item.position,
    createdAt,
    updatedAt,
    completedAt: item.completedAt ?? null,
  }));

  const timeLogs = [
    { stepTitle: "PostgreSQL Fundamentals", minutes: 90, daysAgo: 12 },
    { stepTitle: "Indexes & Query Planning", minutes: 130, daysAgo: 10 },
    { stepTitle: "Redis Data Types", minutes: 75, daysAgo: 8 },
    { stepTitle: "Redis Persistence", minutes: 45, daysAgo: 3 },
    { stepTitle: "Redis Persistence", minutes: 70, daysAgo: 1 },
    { stepTitle: "Load Balancing", minutes: 55, daysAgo: 2 },
    { stepTitle: "Docker", minutes: 120, daysAgo: 20 },
    { stepTitle: "Git Workflow", minutes: 40, daysAgo: 25 },
    { stepTitle: "TypeScript Deep Dive", minutes: 95, daysAgo: 4 },
    { stepTitle: "Vertical vs Horizontal Scaling", minutes: 80, daysAgo: 14 },
  ].map((entry) => {
    const step = steps.find((s) => s.title === entry.stepTitle);
    return {
      id: createId(),
      stepId: step!.id,
      durationMinutes: entry.minutes,
      loggedAt: daysAgoIso(entry.daysAgo),
      createdAt: daysAgoIso(entry.daysAgo),
      updatedAt: daysAgoIso(entry.daysAgo),
    };
  });

  return {
    projects: [
      {
        id: projectId,
        title: "Become Middle Full Stack Developer",
        position: 0,
        createdAt,
        updatedAt,
      },
    ],
    sections: [
      {
        id: databasesId,
        projectId,
        title: "Databases",
        position: 0,
        createdAt,
        updatedAt,
      },
      {
        id: systemDesignId,
        projectId,
        title: "System Design",
        position: 1,
        createdAt,
        updatedAt,
      },
      {
        id: infrastructureId,
        projectId,
        title: "Infrastructure",
        position: 2,
        createdAt,
        updatedAt,
      },
    ],
    steps,
    timeLogs,
  };
}

export function createEmptyData(): AppData {
  return {
    projects: [],
    sections: [],
    steps: [],
    timeLogs: [],
  };
}
