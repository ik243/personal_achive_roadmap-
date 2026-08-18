"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, WEIGHT_LABELS } from "@/lib/domain/status";
import { STEP_STATUSES } from "@/lib/domain/types";
import { createStepSchema } from "@/lib/domain/validation";
import { useAppData } from "@/providers/app-data-provider";

export function AddStepDialog({
  projectId,
  sectionId = null,
  variant = "default",
}: {
  projectId: string;
  sectionId?: string | null;
  variant?: "default" | "inline";
}) {
  const { createStep } = useAppData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState(1);
  const [status, setStatus] = useState<"NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "SKIPPED">("NOT_STARTED");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setWeight(1);
    setStatus("NOT_STARTED");
    setError(null);
  };

  const submit = () => {
    const parsed = createStepSchema.safeParse({
      title,
      weight,
      status,
      sectionId,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    createStep({
      projectId,
      sectionId,
      title: parsed.data.title,
      weight: parsed.data.weight,
      status: parsed.data.status,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger
        render={
          <Button
            variant={variant === "inline" ? "ghost" : "outline"}
            size="sm"
            className={variant === "inline" ? "mt-2" : undefined}
          />
        }
      >
        <Plus className="size-4" />
        {variant === "inline" ? "Add step" : "Add Step"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Step</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Redis Pub/Sub"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Weight</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((w) => (
                <Button
                  key={w}
                  type="button"
                  size="sm"
                  variant={weight === w ? "default" : "outline"}
                  onClick={() => setWeight(w)}
                >
                  {w}
                  <span className="ml-1 hidden sm:inline text-xs opacity-70">
                    {WEIGHT_LABELS[w]}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
