"use client";

import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { DurationText } from "@/components/shared/duration-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enrichStep } from "@/lib/domain/aggregate";
import { STATUS_LABELS, WEIGHT_LABELS } from "@/lib/domain/status";
import { getStepContext } from "@/lib/storage/local";
import { STEP_STATUSES, type StepStatus } from "@/lib/domain/types";
import { useAppData } from "@/providers/app-data-provider";
import { TimeLogDialog } from "./time-log-dialog";

export function StepDetailSheet({
  stepId,
  open,
  onOpenChange,
}: {
  stepId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, updateStep, deleteStep, deleteTimeLog } = useAppData();

  const step = stepId ? enrichStep(data, stepId) : null;
  const context = step ? getStepContext(data, step) : null;
  const logs = useMemo(
    () =>
      stepId
        ? data.timeLogs
            .filter((log) => log.stepId === stepId)
            .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
        : [],
    [data.timeLogs, stepId],
  );

  if (!step) return null;

  const handleStatusChange = (status: StepStatus) => {
    const previous = step.status;
    updateStep(step.id, { status });
    if (status === "COMPLETED" && previous !== "COMPLETED") {
      toast.success("Step completed", {
        action: {
          label: "Undo",
          onClick: () => updateStep(step.id, { status: previous }),
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="notebook-page flex max-h-[min(90vh,44rem)] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-sm border p-0 shadow-none ring-0 duration-200 sm:max-w-lg"
        showCloseButton
      >
        <ScrollArea className="max-h-[min(90vh,44rem)]">
          <div className="space-y-6 p-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="pr-6 text-lg font-medium leading-snug">
                {step.title}
              </DialogTitle>
              {context?.project && (
                <DialogDescription>
                  {context.project.title}
                  {context.section ? ` · ${context.section.title}` : ""}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                key={step.id}
                defaultValue={step.title}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== step.title) {
                    updateStep(step.id, { title: value });
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={step.status}
                onValueChange={(v) => handleStatusChange(v as StepStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <StatusBadge status={step.status} />
            </div>

            <div className="space-y-2">
              <Label>Weight</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((w) => (
                  <Button
                    key={w}
                    size="sm"
                    variant={step.weight === w ? "default" : "outline"}
                    onClick={() => updateStep(step.id, { weight: w })}
                  >
                    {w}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{WEIGHT_LABELS[step.weight]}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Time spent</Label>
                <span className="font-mono text-sm tabular-nums">
                  <DurationText minutes={step.totalSpentMinutes} />
                </span>
              </div>
              <TimeLogDialog stepId={step.id} />
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border border-border px-3 py-2 text-sm"
                  >
                    <div>
                      <DurationText minutes={log.durationMinutes} />
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(log.loggedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteTimeLog(log.id)}
                      aria-label="Delete time log"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                deleteStep(step.id);
                onOpenChange(false);
              }}
            >
              Delete step
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
