"use client";

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
import { minutesFromHoursAndMinutes } from "@/lib/domain/time";
import { timeLogSchema } from "@/lib/domain/validation";
import { useAppData } from "@/providers/app-data-provider";

const QUICK_MINUTES = [15, 30, 45, 60, 120];

export function TimeLogDialog({ stepId }: { stepId: string }) {
  const { addTimeLog } = useAppData();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const loggedAt = new Date(`${date}T12:00:00`).toISOString();
    const parsed = timeLogSchema.safeParse({ hours, minutes, loggedAt });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid duration");
      return;
    }
    const duration = minutesFromHoursAndMinutes(hours, minutes);
    addTimeLog(stepId, duration, loggedAt);
    setOpen(false);
    setHours(0);
    setMinutes(30);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        + Log time
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log study time</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_MINUTES.map((m) => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setHours(Math.floor(m / 60));
                  setMinutes(m % 60);
                }}
              >
                {m < 60 ? `${m}m` : m === 60 ? "1h" : "2h"}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                type="number"
                min={0}
                max={24}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Minutes</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit}>
            Log {formatLabel(hours, minutes)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatLabel(hours: number, minutes: number) {
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
