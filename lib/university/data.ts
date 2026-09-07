import type { AppData, StepStatus } from "@/lib/domain/types";

export const UNIVERSITY_PROJECT_TITLE = "Університет 2026-2027";
export const SMART_TECH_SUBJECT = "Основи смарт-технологій і систем";

export interface ScoreBand {
  score: number;
  date: string;
  kind: "until" | "from";
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

export const universitySubjects: UniversitySubject[] = [
  {
    name: SMART_TECH_SUBJECT,
    practical: "",
    labs: "ЛР: 5 шт по 8 балів з дедлайнами",
    writtenExam: "ПЧ: 40 балів",
    oralExam: "УЧ: 20 балів",
    assessments: [
      {
        title: "Лабораторна №1",
        shortTitle: "ЛР1",
        maxScore: 8,
        type: "lab",
        bands: [
          { score: 8, date: "2026-09-26", kind: "until" },
          { score: 7, date: "2026-10-03", kind: "until" },
          { score: 6, date: "2026-10-10", kind: "until" },
          { score: 5, date: "2026-10-17", kind: "until" },
          { score: 4, date: "2026-10-24", kind: "until" },
          { score: 3, date: "2026-10-31", kind: "until" },
          { score: 2, date: "2026-11-07", kind: "until" },
          { score: 1, date: "2026-11-14", kind: "until" },
          { score: 0, date: "2026-11-21", kind: "from" },
        ],
      },
      {
        title: "Лабораторна №2",
        shortTitle: "ЛР2",
        maxScore: 8,
        type: "lab",
        bands: [
          { score: 8, date: "2026-10-10", kind: "until" },
          { score: 7, date: "2026-10-17", kind: "until" },
          { score: 6, date: "2026-10-24", kind: "until" },
          { score: 5, date: "2026-10-31", kind: "until" },
          { score: 4, date: "2026-11-07", kind: "until" },
          { score: 3, date: "2026-11-14", kind: "until" },
          { score: 2, date: "2026-11-21", kind: "until" },
          { score: 1, date: "2026-11-28", kind: "until" },
          { score: 0, date: "2026-12-05", kind: "from" },
        ],
      },
      {
        title: "Лабораторна №3",
        shortTitle: "ЛР3",
        maxScore: 8,
        type: "lab",
        bands: [
          { score: 8, date: "2026-10-24", kind: "until" },
          { score: 7, date: "2026-10-31", kind: "until" },
          { score: 6, date: "2026-11-07", kind: "until" },
          { score: 5, date: "2026-11-14", kind: "until" },
          { score: 4, date: "2026-11-21", kind: "until" },
          { score: 3, date: "2026-11-28", kind: "until" },
          { score: 2, date: "2026-12-05", kind: "until" },
          { score: 1, date: "2026-12-12", kind: "until" },
        ],
      },
      {
        title: "Лабораторна №4",
        shortTitle: "ЛР4",
        maxScore: 8,
        type: "lab",
        bands: [
          { score: 8, date: "2026-11-14", kind: "until" },
          { score: 7, date: "2026-11-21", kind: "until" },
          { score: 6, date: "2026-11-28", kind: "until" },
          { score: 5, date: "2026-12-05", kind: "until" },
          { score: 4, date: "2026-12-12", kind: "until" },
        ],
      },
      {
        title: "Лабораторна №5",
        shortTitle: "ЛР5",
        maxScore: 8,
        type: "lab",
        bands: [
          { score: 8, date: "2026-11-28", kind: "until" },
          { score: 7, date: "2026-12-05", kind: "until" },
          { score: 6, date: "2026-12-12", kind: "until" },
        ],
      },
      {
        title: "ПЧ - Практична частина екзамену",
        shortTitle: "ПЧ",
        maxScore: 40,
        type: "exam-practical",
      },
      {
        title: "УЧ - Усна частина екзамену",
        shortTitle: "УЧ",
        maxScore: 20,
        type: "exam-oral",
      },
    ],
  },
  {
    name: "Надійний штучний інтелект",
    practical: "ПР",
    labs: "",
    writtenExam: "",
    oralExam: "",
    assessments: [
      {
        title: "Практичні роботи - уточнити теми, дедлайни та бали",
        shortTitle: "ПР",
        maxScore: 0,
        type: "pending",
      },
    ],
  },
  {
    name: "Проектування інформаційних систем",
    practical: "",
    labs: "ЛР",
    writtenExam: "",
    oralExam: "",
    assessments: [
      {
        title: "Лабораторні роботи - уточнити кількість, дедлайни та бали",
        shortTitle: "ЛР",
        maxScore: 0,
        type: "pending",
      },
    ],
  },
  {
    name: "Інтелектуальний аналіз даних",
    practical: "",
    labs: "ЛР",
    writtenExam: "",
    oralExam: "",
    assessments: [
      {
        title: "Лабораторні роботи - уточнити кількість, дедлайни та бали",
        shortTitle: "ЛР",
        maxScore: 0,
        type: "pending",
      },
    ],
  },
  {
    name: "Основи управління і прийняття рішень",
    practical: "",
    labs: "ЛР",
    writtenExam: "",
    oralExam: "",
    assessments: [
      {
        title: "Лабораторні роботи - уточнити кількість, дедлайни та бали",
        shortTitle: "ЛР",
        maxScore: 0,
        type: "pending",
      },
    ],
  },
  {
    name: "Технології цифрової обробки сигналів",
    practical: "",
    labs: "ЛР",
    writtenExam: "",
    oralExam: "",
    assessments: [
      {
        title: "Лабораторні роботи - уточнити кількість, дедлайни та бали",
        shortTitle: "ЛР",
        maxScore: 0,
        type: "pending",
      },
    ],
  },
  {
    name: "Філософія",
    practical: "ПР",
    labs: "",
    writtenExam: "",
    oralExam: "",
    assessments: [
      {
        title: "Практичні роботи - уточнити теми, дедлайни та бали",
        shortTitle: "ПР",
        maxScore: 0,
        type: "pending",
      },
    ],
  },
];

export function findUniversityProject(data: AppData) {
  return data.projects.find((project) => project.title === UNIVERSITY_PROJECT_TITLE);
}

export function findStepStatus(
  data: AppData,
  subjectName: string,
  assessmentTitle: string,
): StepStatus | null {
  const project = findUniversityProject(data);
  if (!project) return null;
  const section = data.sections.find(
    (item) => item.projectId === project.id && item.title === subjectName,
  );
  if (!section) return null;
  return (
    data.steps.find(
      (step) => step.sectionId === section.id && step.title.startsWith(assessmentTitle),
    )?.status ?? null
  );
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
