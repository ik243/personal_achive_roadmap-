import type { AppData, StepStatus } from "@/lib/domain/types";
import catalog from "./university-data.json";

export type ScoreBandKind = "until" | "from";

export interface ScoreBand {
  score: number;
  date: string;
  kind: ScoreBandKind;
}

export interface UniversityAssessment {
  title: string;
  shortTitle: string;
  maxScore: number;
  type: "lab" | "exam-practical" | "exam-oral" | "pending";
  bands?: ScoreBand[];
}

export interface UniversitySubject {
  name: string;
  practical: string;
  labs: string;
  writtenExam: string;
  oralExam: string;
  assessments: UniversityAssessment[];
}

interface UniversityCatalog {
  projectTitle: string;
  primarySubject: string;
  subjects: UniversitySubject[];
}

const universityCatalog = catalog as UniversityCatalog;

export const UNIVERSITY_PROJECT_TITLE = universityCatalog.projectTitle;
export const SMART_TECH_SUBJECT = universityCatalog.primarySubject;
export const universitySubjects = universityCatalog.subjects;

export interface UniversityScoreEntry {
  score: number;
  updatedAt: string;
}

export type UniversityScores = Record<string, UniversityScoreEntry>;

export function findUniversityProject(data: AppData) {
  return data.projects.find((project) => project.title === UNIVERSITY_PROJECT_TITLE);
}

export function findStepStatus(
  data: AppData,
  subjectName: string,
  assessmentTitle: string,
): StepStatus | null {
  const matching = findAssessmentSteps(data, subjectName, assessmentTitle);
  if (matching.length === 0) return null;
  if (matching.some((step) => step.status === "IN_PROGRESS")) return "IN_PROGRESS";
  if (matching.every((step) => step.status === "COMPLETED")) return "COMPLETED";
  if (matching.every((step) => step.status === "SKIPPED")) return "SKIPPED";
  if (matching.some((step) => step.status === "PAUSED")) return "PAUSED";
  return "NOT_STARTED";
}

export function getKnownMaxScore() {
  return universitySubjects.reduce(
    (sum, subject) =>
      sum +
      subject.assessments.reduce(
        (subjectSum, assessment) => subjectSum + assessment.maxScore,
        0,
      ),
    0,
  );
}

export function getLabMaxScore() {
  const subject = universitySubjects.find((item) => item.name === SMART_TECH_SUBJECT);
  if (!subject) return 0;
  return subject.assessments
    .filter((assessment) => assessment.type === "lab")
    .reduce((sum, assessment) => sum + assessment.maxScore, 0);
}

export function getExamPracticalScore() {
  return findAssessment("ПЧ - Практична частина екзамену")?.maxScore ?? 0;
}

export function getExamOralScore() {
  return findAssessment("УЧ - Усна частина екзамену")?.maxScore ?? 0;
}

export function getCurrentPossibleScore(today = new Date()) {
  return universitySubjects.reduce(
    (sum, subject) =>
      sum +
      subject.assessments.reduce((subjectSum, assessment) => {
        if (assessment.type === "pending") return subjectSum;
        if (!assessment.bands) return subjectSum + assessment.maxScore;
        return subjectSum + getCurrentAssessmentScore(assessment, today);
      }, 0),
    0,
  );
}

export function getAssessmentKey(subjectName: string, assessmentTitle: string) {
  return `${subjectName}::${assessmentTitle}`;
}

export function getEnteredScore(
  scores: UniversityScores,
  subjectName: string,
  assessmentTitle: string,
) {
  return scores[getAssessmentKey(subjectName, assessmentTitle)]?.score ?? null;
}

export function sumEnteredScores(scores: UniversityScores, type?: UniversityAssessment["type"]) {
  return universitySubjects.reduce(
    (sum, subject) =>
      sum +
      subject.assessments.reduce((subjectSum, assessment) => {
        if (type && assessment.type !== type) return subjectSum;
        return (
          subjectSum +
          (getEnteredScore(scores, subject.name, assessment.title) ?? 0)
        );
      }, 0),
    0,
  );
}

export function sumMaxScores(type?: UniversityAssessment["type"]) {
  return universitySubjects.reduce(
    (sum, subject) =>
      sum +
      subject.assessments.reduce((subjectSum, assessment) => {
        if (type && assessment.type !== type) return subjectSum;
        return subjectSum + assessment.maxScore;
      }, 0),
    0,
  );
}

export function getCurrentAssessmentScore(
  assessment: UniversityAssessment,
  today = new Date(),
) {
  if (!assessment.bands?.length) return assessment.maxScore;

  const day = startOfLocalDay(today).getTime();
  for (const band of assessment.bands) {
    const bandDay = parseDateOnly(band.date).getTime();
    if (band.kind === "until" && day <= bandDay) return band.score;
    if (band.kind === "from" && day >= bandDay) return band.score;
  }

  return assessment.bands.at(-1)?.score ?? assessment.maxScore;
}

export function getNextBand(assessment: UniversityAssessment, today = new Date()) {
  if (!assessment.bands?.length) return null;
  const day = startOfLocalDay(today).getTime();
  return (
    assessment.bands.find(
      (band) => band.kind === "until" && parseDateOnly(band.date).getTime() >= day,
    ) ?? null
  );
}

export function getUpcomingDeadlines(today = new Date(), limit = 5) {
  const day = startOfLocalDay(today).getTime();
  return universitySubjects
    .flatMap((subject) =>
      subject.assessments.flatMap((assessment) =>
        (assessment.bands ?? [])
          .filter((band) => band.kind === "until")
          .map((band) => ({ subject: subject.name, assessment, band })),
      ),
    )
    .filter((item) => parseDateOnly(item.band.date).getTime() >= day)
    .sort((a, b) => parseDateOnly(a.band.date).getTime() - parseDateOnly(b.band.date).getTime())
    .slice(0, limit);
}

export function formatDateUk(date: string) {
  const parsed = parseDateOnly(date);
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function formatScoreBand(band: ScoreBand) {
  const prefix = band.kind === "until" ? "до" : "з";
  return `${band.score} ${scoreWord(band.score)} ${prefix} ${formatDateUk(band.date)}`;
}

export function scoreWord(score: number) {
  if (score === 1) return "бал";
  if (score >= 2 && score <= 4) return "бали";
  return "балів";
}

function findAssessmentSteps(data: AppData, subjectName: string, assessmentTitle: string) {
  const project = findUniversityProject(data);
  if (!project) return [];

  const subjectSections = data.sections.filter(
    (section) =>
      section.projectId === project.id &&
      (section.title === subjectName || section.title.startsWith(`${subjectName} / `)),
  );
  const sectionIds = new Set(subjectSections.map((section) => section.id));

  return data.steps.filter(
    (step) =>
      step.projectId === project.id &&
      sectionIds.has(step.sectionId ?? "") &&
      step.title.startsWith(assessmentTitle),
  );
}

function findAssessment(title: string) {
  return universitySubjects
    .flatMap((subject) => subject.assessments)
    .find((assessment) => assessment.title === title);
}

function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfLocalDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}
