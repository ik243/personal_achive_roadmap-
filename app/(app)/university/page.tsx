"use client";

import Link from "next/link";
import { CalendarDays, ClipboardCheck, GraduationCap, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NotebookSection } from "@/components/layout/notebook-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/progress-bar";
import {
  findStepStatus,
  findUniversityProject,
  formatDateUk,
  formatScoreBand,
  getCurrentAssessmentScore,
  getCurrentPossibleScore,
  getExamOralScore,
  getExamPracticalScore,
  getKnownMaxScore,
  getLabMaxScore,
  getNextBand,
  getUpcomingDeadlines,
  SMART_TECH_SUBJECT,
  universitySubjects,
} from "@/lib/university/data";
import { cn } from "@/lib/utils";
import { useAppData } from "@/providers/app-data-provider";

const statusLabels = {
  NOT_STARTED: "Не почато",
  IN_PROGRESS: "В роботі",
  PAUSED: "Пауза",
  COMPLETED: "Готово",
  SKIPPED: "Пропущено",
} as const;

export default function UniversityPage() {
  const { data, isReady } = useAppData();

  if (!isReady) return null;

  const project = findUniversityProject(data);
  const smartTech = universitySubjects.find((subject) => subject.name === SMART_TECH_SUBJECT);
  const upcoming = getUpcomingDeadlines(new Date(), 6);
  const knownMaxScore = getKnownMaxScore();
  const currentPossibleScore = getCurrentPossibleScore(new Date());
  const smartTechAssessments = smartTech?.assessments ?? [];
  const completedKnownScore = smartTechAssessments.reduce((sum, assessment) => {
    const status = findStepStatus(data, SMART_TECH_SUBJECT, assessment.title);
    return status === "COMPLETED" ? sum + assessment.maxScore : sum;
  }, 0);
  const completedKnownProgress = knownMaxScore
    ? Math.round((completedKnownScore / knownMaxScore) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="University"
        description="2026-2027 навчальний трек, дедлайни та бали."
        actions={
          project && (
            <Link href={`/projects/${project.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ListChecks className="size-4" />
              Roadmap
            </Link>
          )
        }
      />

      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Відомий максимум" value={`${knownMaxScore} б`} hint="по наявних даних" />
        <Metric label="Можна взяти зараз" value={`${currentPossibleScore} б`} hint="з урахуванням дедлайнів" />
        <Metric label="ПЧ екзамен" value={`${getExamPracticalScore()} б`} hint="практична частина" />
        <Metric label="Усна частина" value={`${getExamOralScore()} б`} hint="константа екзамену" />
      </div>

      <NotebookSection title="Overall score">
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Закрито по відомих балах</p>
              <p className="text-xs text-muted-foreground">
                {completedKnownScore}/{knownMaxScore} балів зараз позначено як виконано.
              </p>
            </div>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {completedKnownProgress}%
            </span>
          </div>
          <ProgressBar value={completedKnownProgress} showLabel />
        </div>
      </NotebookSection>

      {upcoming.length > 0 && (
        <NotebookSection title="Nearest deadlines">
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map(({ assessment, band }) => (
              <div key={`${assessment.shortTitle}-${band.score}-${band.date}`} className="border-b border-border pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{assessment.title}</p>
                    <p className="text-xs text-muted-foreground">{SMART_TECH_SUBJECT}</p>
                  </div>
                  <Badge variant="outline">{band.score} б</Badge>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  до {formatDateUk(band.date)}
                </p>
              </div>
            ))}
          </div>
        </NotebookSection>
      )}

      <NotebookSection title="Subjects">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Предмет</th>
                <th className="py-2 pr-4 font-medium">ПР</th>
                <th className="py-2 pr-4 font-medium">ЛР</th>
                <th className="py-2 pr-4 font-medium">ПЧ</th>
                <th className="py-2 pr-4 font-medium">УЧ</th>
                <th className="py-2 text-right font-medium">Відомі бали</th>
              </tr>
            </thead>
            <tbody>
              {universitySubjects.map((subject) => {
                const score = subject.assessments.reduce((sum, item) => sum + item.maxScore, 0);
                return (
                  <tr key={subject.name} className="border-b border-border last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{subject.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{subject.practical || "-"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{subject.labs || "-"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{subject.writtenExam || "-"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{subject.oralExam || "-"}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{score || "?"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 md:hidden">
          {universitySubjects.map((subject) => {
            const score = subject.assessments.reduce((sum, item) => sum + item.maxScore, 0);
            return (
              <div key={subject.name} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium leading-snug">{subject.name}</p>
                  <span className="font-mono text-sm tabular-nums">{score || "?"} б</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {[subject.practical, subject.labs, subject.writtenExam, subject.oralExam]
                    .filter(Boolean)
                    .join(" · ") || "Дані очікуються"}
                </p>
              </div>
            );
          })}
        </div>
      </NotebookSection>

      {smartTech && (
        <NotebookSection title={SMART_TECH_SUBJECT}>
          <div className="mb-5 grid gap-x-8 gap-y-2 sm:grid-cols-3">
            <Metric label="Лабораторні" value={`${getLabMaxScore()} б`} hint="5 робіт по 8 балів" />
            <Metric label="ПЧ" value={`${getExamPracticalScore()} б`} hint="Практична частина екзамену" />
            <Metric label="УЧ" value={`${getExamOralScore()} б`} hint="Усна частина екзамену" />
          </div>

          <div className="space-y-4">
            {smartTech.assessments.map((assessment) => {
              const status = findStepStatus(data, SMART_TECH_SUBJECT, assessment.title);
              const nextBand = getNextBand(assessment);
              const currentScore =
                assessment.type === "pending" ? 0 : getCurrentAssessmentScore(assessment);
              return (
                <div key={assessment.title} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{assessment.title}</p>
                        <Badge variant={status === "COMPLETED" ? "secondary" : "outline"}>
                          {status ? statusLabels[status] : "Не засіяно"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {assessment.maxScore} max · {currentScore} доступно зараз
                      </p>
                    </div>
                    {nextBand && (
                      <p className="flex shrink-0 items-center gap-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                        <CalendarDays className="size-4" />
                        {nextBand.score} б до {formatDateUk(nextBand.date)}
                      </p>
                    )}
                  </div>

                  {assessment.bands ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {assessment.bands.map((band) => (
                        <span
                          key={`${assessment.title}-${band.score}-${band.date}`}
                          className={cn(
                            "inline-flex rounded-md border px-2 py-1 text-xs text-muted-foreground",
                            band === nextBand && "border-foreground text-foreground",
                          )}
                        >
                          {formatScoreBand(band)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ClipboardCheck className="size-4" />
                      Фіксована екзаменаційна частина без дедлайну в наданих файлах.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </NotebookSection>
      )}

      {!project && (
        <div className="border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
          <GraduationCap className="mb-3 size-5" />
          University roadmap ще не знайдено в завантажених даних.
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="border-b border-border py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
