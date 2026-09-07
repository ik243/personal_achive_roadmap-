"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Info, ListChecks, MoreHorizontal, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NotebookSection } from "@/components/layout/notebook-section";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  findUniversityProject,
  formatDateUk,
  formatScoreBand,
  getAssessmentKey,
  getCurrentAssessmentScore,
  getCurrentPossibleScore,
  getEnteredScore,
  getExamOralScore,
  getExamPracticalScore,
  getKnownMaxScore,
  getUpcomingDeadlines,
  scoreWord,
  SMART_TECH_SUBJECT,
  type UniversityAssessment,
  type UniversityScores,
  type UniversitySubject,
  universitySubjects,
  sumEnteredScores,
} from "@/lib/university/data";
import { readUniversityScores, writeUniversityScores } from "@/lib/university/storage";
import { useAppData } from "@/providers/app-data-provider";

type WorkSelection = {
  subject: UniversitySubject;
  assessment: UniversityAssessment;
};

type SubjectSelection = {
  subject: UniversitySubject;
};

const statusToday = new Date();

export function UniversityTracker({ showHeader = true }: { showHeader?: boolean }) {
  const { data, isReady } = useAppData();
  const [scores, setScores] = useState<UniversityScores>(() => readUniversityScores());
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkSelection | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectSelection | null>(null);

  const project = findUniversityProject(data);
  const knownMax = getKnownMaxScore();
  const enteredTotal = sumEnteredScores(scores);
  const progress = knownMax ? Math.round((enteredTotal / knownMax) * 100) : 0;

  if (!isReady) return null;

  const saveScore = (subject: UniversitySubject, assessment: UniversityAssessment, score: number) => {
    const next = {
      ...scores,
      [getAssessmentKey(subject.name, assessment.title)]: {
        score,
        updatedAt: new Date().toISOString(),
      },
    };
    setScores(next);
    writeUniversityScores(next);
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <PageHeader
          title="University"
          description="Предмети, роботи і бали без зайвого шуму."
          actions={
            project && (
              <Link href={`/projects/${project.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <ListChecks className="size-4" />
                Roadmap
              </Link>
            )
          }
        />
      )}

      <div className="border-b border-border pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-heading text-base font-medium">Мій результат</p>
            <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
              {enteredTotal}/{knownMax} б
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOverviewOpen(true)}>
            <MoreHorizontal className="size-4" />
            More
          </Button>
        </div>
        <div className="mt-3 max-w-xl">
          <ProgressBar value={progress} showLabel size="sm" />
        </div>
      </div>

      <NotebookSection title="Subjects">
        <div className="space-y-5">
          {universitySubjects.map((subject) => (
            <SubjectBlock
              key={subject.name}
              subject={subject}
              scores={scores}
              onWorkOpen={(assessment) => setSelectedWork({ subject, assessment })}
              onMoreOpen={() => setSelectedSubject({ subject })}
            />
          ))}
        </div>
      </NotebookSection>

      <OverviewDialog open={overviewOpen} scores={scores} onOpenChange={setOverviewOpen} />

      <WorkDialog
        selection={selectedWork}
        scores={scores}
        onSave={saveScore}
        onOpenChange={(open) => !open && setSelectedWork(null)}
      />

      <SubjectTotalsDialog
        selection={selectedSubject}
        scores={scores}
        onOpenChange={(open) => !open && setSelectedSubject(null)}
      />
    </div>
  );
}

function SubjectBlock({
  subject,
  scores,
  onWorkOpen,
  onMoreOpen,
}: {
  subject: UniversitySubject;
  scores: UniversityScores;
  onWorkOpen: (assessment: UniversityAssessment) => void;
  onMoreOpen: () => void;
}) {
  const maxScore = subject.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
  const enteredScore = subject.assessments.reduce(
    (sum, assessment) => sum + (getEnteredScore(scores, subject.name, assessment.title) ?? 0),
    0,
  );
  const progress = maxScore ? Math.round((enteredScore / maxScore) * 100) : 0;

  return (
    <section className="border-b border-border pb-5 last:border-b-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-medium">{subject.name}</h2>
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
            {maxScore > 0 ? `${enteredScore}/${maxScore} б` : "todo"}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onMoreOpen} aria-label={`More about ${subject.name}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      {maxScore > 0 && (
        <div className="mb-3 max-w-xl">
          <ProgressBar value={progress} size="sm" />
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {subject.assessments.map((assessment) => {
          const entered = getEnteredScore(scores, subject.name, assessment.title);

          return (
            <div key={assessment.title} className="rounded-lg border border-border bg-background px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{assessment.shortTitle}</p>
                  <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                    {assessment.maxScore > 0 ? `max ${assessment.maxScore}` : "уточнити"}
                  </p>
                </div>
                <Badge variant={entered === null ? "outline" : "secondary"}>
                  {entered === null ? "todo" : `${entered} б`}
                </Badge>
              </div>
              <Button className="mt-3 w-full" variant="outline" size="sm" onClick={() => onWorkOpen(assessment)}>
                <Info className="size-3.5" />
                More
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OverviewDialog({
  open,
  scores,
  onOpenChange,
}: {
  open: boolean;
  scores: UniversityScores;
  onOpenChange: (open: boolean) => void;
}) {
  const knownMax = getKnownMaxScore();
  const enteredTotal = sumEnteredScores(scores);
  const currentPossible = getCurrentPossibleScore(statusToday);
  const upcoming = getUpcomingDeadlines(statusToday, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>University overview</DialogTitle>
          <DialogDescription>Загальна оцінка і найближчі дедлайни.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <Metric label="Мій результат" value={`${enteredTotal}/${knownMax}`} hint="введені реальні бали" />
            <Metric label="Можливо зараз" value={`${currentPossible}/${knownMax}`} hint="автоматично по дедлайнах" />
            <Metric label="ПЧ" value={`${getExamPracticalScore()} б`} hint="практична частина екзамену" />
            <Metric label="УЧ" value={`${getExamOralScore()} б`} hint="усна частина екзамену" />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Найближчі дедлайни</p>
            <div className="space-y-2">
              {upcoming.map(({ assessment, band }) => (
                <div key={`${assessment.shortTitle}-${band.score}-${band.date}`} className="border-b border-border pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{assessment.shortTitle}</p>
                      <p className="text-xs text-muted-foreground">{SMART_TECH_SUBJECT}</p>
                    </div>
                    <Badge variant="outline">{band.score} б</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    до {formatDateUk(band.date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WorkDialog({
  selection,
  scores,
  onSave,
  onOpenChange,
}: {
  selection: WorkSelection | null;
  scores: UniversityScores;
  onSave: (subject: UniversitySubject, assessment: UniversityAssessment, score: number) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const assessment = selection?.assessment;
  const subject = selection?.subject;
  const currentMax = assessment ? getCurrentAssessmentScore(assessment, statusToday) : 0;
  const firstBand = assessment?.bands?.[0] ?? null;
  const secondBand = assessment?.bands?.[1] ?? null;

  return (
    <Dialog open={Boolean(selection)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        {selection && assessment && subject && (
          <>
            <DialogHeader>
              <DialogTitle>{assessment.title}</DialogTitle>
              <DialogDescription>{subject.name}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
                <Metric label="Максимум" value={`${assessment.maxScore} б`} hint="за роботу" />
                <Metric label="Доступно зараз" value={`${currentMax} б`} hint="по дедлайнах" />
                <Metric
                  label="Мій бал"
                  value={`${getEnteredScore(scores, subject.name, assessment.title) ?? 0} б`}
                  hint="збережено"
                />
              </div>

              {assessment.bands && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {firstBand && <DeadlineNote title="Перший дедлайн" band={firstBand} />}
                  {secondBand && <DeadlineNote title="Другий дедлайн" band={secondBand} />}
                </div>
              )}

              {assessment.bands ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Таблиця дедлайнів</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {assessment.bands.map((band) => (
                      <span
                        key={`${band.score}-${band.date}`}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                      >
                        {formatScoreBand(band)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  Для цієї роботи в наданих файлах немає окремого дедлайну.
                </p>
              )}

              <ScoreForm
                key={getAssessmentKey(subject.name, assessment.title)}
                subject={subject}
                assessment={assessment}
                scores={scores}
                currentMax={currentMax}
                onSave={onSave}
                onOpenChange={onOpenChange}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ScoreForm({
  subject,
  assessment,
  scores,
  currentMax,
  onSave,
  onOpenChange,
}: {
  subject: UniversitySubject;
  assessment: UniversityAssessment;
  scores: UniversityScores;
  currentMax: number;
  onSave: (subject: UniversitySubject, assessment: UniversityAssessment, score: number) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const entered = getEnteredScore(scores, subject.name, assessment.title);
  const [input, setInput] = useState(entered === null ? "" : String(entered));
  const enteredScore = Number(input);
  const inputIsValid =
    assessment.type !== "pending" &&
    Number.isFinite(enteredScore) &&
    enteredScore >= 0 &&
    enteredScore <= assessment.maxScore;

  if (assessment.type === "pending") {
    return (
      <p className="text-sm text-muted-foreground">
        Для цього предмету ще треба додати конкретні роботи, дедлайни та бали.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="university-score">Реальний бал</Label>
        <Input
          id="university-score"
          type="number"
          min={0}
          max={assessment.maxScore}
          step={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`0-${assessment.maxScore}`}
        />
        <p className="text-xs text-muted-foreground">
          Автоматичний максимум на сьогодні: {currentMax} {scoreWord(currentMax)}.
        </p>
      </div>

      <DialogFooter>
        <Button
          disabled={!inputIsValid}
          onClick={() => {
            onSave(subject, assessment, enteredScore);
            onOpenChange(false);
          }}
        >
          <Save className="size-4" />
          Save
        </Button>
      </DialogFooter>
    </>
  );
}

function SubjectTotalsDialog({
  selection,
  scores,
  onOpenChange,
}: {
  selection: SubjectSelection | null;
  scores: UniversityScores;
  onOpenChange: (open: boolean) => void;
}) {
  const subject = selection?.subject;

  const totals = useMemo(() => {
    if (!subject) return { labs: 0, labsMax: 0, practical: 0, practicalMax: 0, oral: 0, oralMax: 0 };

    return subject.assessments.reduce(
      (acc, assessment) => {
        const score = getEnteredScore(scores, subject.name, assessment.title) ?? 0;
        if (assessment.type === "lab") {
          acc.labs += score;
          acc.labsMax += assessment.maxScore;
        }
        if (assessment.type === "exam-practical") {
          acc.practical += score;
          acc.practicalMax += assessment.maxScore;
        }
        if (assessment.type === "exam-oral") {
          acc.oral += score;
          acc.oralMax += assessment.maxScore;
        }
        return acc;
      },
      { labs: 0, labsMax: 0, practical: 0, practicalMax: 0, oral: 0, oralMax: 0 },
    );
  }, [scores, subject]);

  const total = totals.labs + totals.practical + totals.oral;
  const maxTotal = totals.labsMax + totals.practicalMax + totals.oralMax;

  return (
    <Dialog open={Boolean(selection)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto">
        {subject && (
          <>
            <DialogHeader>
              <DialogTitle>{subject.name}</DialogTitle>
              <DialogDescription>Сумарний бал по роботах предмету.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <TotalRow label="ЛР" value={totals.labs} max={totals.labsMax} />
              <TotalRow label="ПЧ" value={totals.practical} max={totals.practicalMax} />
              <TotalRow label="УЧ" value={totals.oral} max={totals.oralMax} />
              <div className="border-t border-border pt-3">
                <TotalRow label="Разом" value={total} max={maxTotal} strong />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeadlineNote({ title, band }: { title: string; band: { score: number; date: string } }) {
  return (
    <div className="border-b border-border pb-2">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 font-mono text-sm tabular-nums">
        {band.score} б до {formatDateUk(band.date)}
      </p>
    </div>
  );
}

function TotalRow({
  label,
  value,
  max,
  strong,
}: {
  label: string;
  value: number;
  max: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className="font-mono tabular-nums">
        {value}/{max}
      </span>
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
