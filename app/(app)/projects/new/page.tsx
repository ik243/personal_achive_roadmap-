"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProjectSchema } from "@/lib/domain/validation";
import { useAppData } from "@/providers/app-data-provider";

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useAppData();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = createProjectSchema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid title");
      return;
    }
    const project = createProject(parsed.data.title);
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader
        title="Create Project"
        description="Start with a title. Structure comes next."
      />
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Project title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            placeholder="Become Middle Full Stack Developer"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full">Create Project</Button>
      </form>
    </div>
  );
}
