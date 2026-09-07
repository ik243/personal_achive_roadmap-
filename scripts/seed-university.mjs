import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const catalog = JSON.parse(
  readFileSync(join("lib", "university", "university-data.json"), "utf8"),
);

const now = new Date().toISOString();

function scoreWord(score) {
  if (score === 1) return "бал";
  if (score >= 2 && score <= 4) return "бали";
  return "балів";
}

function stepRowsForAssessment(assessment) {
  if (assessment.type === "pending") {
    return [
      {
        title: assessment.title,
        weight: 1,
      },
    ];
  }

  return [
    {
      title: `${assessment.title} — ${assessment.maxScore} ${scoreWord(assessment.maxScore)}`,
      weight: Math.min(5, Math.max(1, Math.ceil(assessment.maxScore / 10))),
    },
  ];
}

async function deleteProjectChildren(projectId) {
  const { data: existingSteps, error: readStepsError } = await client
    .from("steps")
    .select("id")
    .eq("project_id", projectId);
  if (readStepsError) throw readStepsError;

  if (existingSteps.length > 0) {
    const stepIds = existingSteps.map((step) => step.id);
    const { error: logsDeleteError } = await client.from("time_logs").delete().in("step_id", stepIds);
    if (logsDeleteError) throw logsDeleteError;

    const { error: stepsDeleteError } = await client.from("steps").delete().in("id", stepIds);
    if (stepsDeleteError) throw stepsDeleteError;
  }

  const { error: sectionsDeleteError } = await client
    .from("sections")
    .delete()
    .eq("project_id", projectId);
  if (sectionsDeleteError) throw sectionsDeleteError;
}

async function main() {
  const { data: existing, error: existingError } = await client
    .from("projects")
    .select("id,position")
    .eq("title", catalog.projectTitle)
    .maybeSingle();
  if (existingError) throw existingError;

  let projectId = existing?.id;
  let position = existing?.position;
  let mode = "updated";

  if (projectId) {
    await deleteProjectChildren(projectId);
    const { error } = await client
      .from("projects")
      .update({ updated_at: now })
      .eq("id", projectId);
    if (error) throw error;
  } else {
    mode = "created";
    const { data: last, error: lastError } = await client
      .from("projects")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);
    if (lastError) throw lastError;

    projectId = randomUUID();
    position = last?.length ? last[0].position + 1 : 0;
    const { error } = await client.from("projects").insert({
      id: projectId,
      title: catalog.projectTitle,
      position,
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;
  }

  const sections = [];
  const steps = [];

  catalog.subjects.forEach((subject) => {
    const overviewSectionId = randomUUID();
    sections.push({
      id: overviewSectionId,
      project_id: projectId,
      title: subject.name,
      position: sections.length,
      created_at: now,
      updated_at: now,
    });

    subject.assessments.forEach((assessment) => {
      const rows = stepRowsForAssessment(assessment);
      const existingCount = steps.filter((step) => step.section_id === overviewSectionId).length;

      rows.forEach((row, rowIndex) => {
        if (row.title.length > 200) {
          throw new Error(`Step title too long (${row.title.length}): ${row.title}`);
        }

        steps.push({
          id: randomUUID(),
          project_id: projectId,
          section_id: overviewSectionId,
          title: row.title,
          status: "NOT_STARTED",
          weight: row.weight,
          position: existingCount + rowIndex,
          completed_at: null,
          created_at: now,
          updated_at: now,
        });
      });
    });
  });

  const { error: sectionsError } = await client.from("sections").insert(sections);
  if (sectionsError) throw sectionsError;

  const { error: stepsError } = await client.from("steps").insert(steps);
  if (stepsError) throw stepsError;

  console.log(
    JSON.stringify(
      {
        mode,
        projectId,
        title: catalog.projectTitle,
        position,
        sections: sections.length,
        steps: steps.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
