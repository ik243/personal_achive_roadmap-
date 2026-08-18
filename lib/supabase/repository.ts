import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppData, Project, Section, Step, TimeLog } from "@/lib/domain/types";
import {
  mapProject,
  mapSection,
  mapStep,
  mapTimeLog,
  projectToRow,
  sectionToRow,
  stepToRow,
  timeLogToRow,
} from "./mappers";

export async function fetchAppData(client: SupabaseClient): Promise<AppData> {
  const [projectsRes, sectionsRes, stepsRes, logsRes] = await Promise.all([
    client.from("projects").select("*").order("position"),
    client.from("sections").select("*").order("position"),
    client.from("steps").select("*").order("position"),
    client.from("time_logs").select("*").order("logged_at", { ascending: false }),
  ]);

  if (projectsRes.error) throw projectsRes.error;
  if (sectionsRes.error) throw sectionsRes.error;
  if (stepsRes.error) throw stepsRes.error;
  if (logsRes.error) throw logsRes.error;

  return {
    projects: (projectsRes.data ?? []).map(mapProject),
    sections: (sectionsRes.data ?? []).map(mapSection),
    steps: (stepsRes.data ?? []).map(mapStep),
    timeLogs: (logsRes.data ?? []).map(mapTimeLog),
  };
}

export async function replaceAllData(client: SupabaseClient, data: AppData): Promise<void> {
  await client.from("time_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (data.projects.length > 0) {
    const { error } = await client.from("projects").insert(data.projects.map(projectToRow));
    if (error) throw error;
  }
  if (data.sections.length > 0) {
    const { error } = await client.from("sections").insert(data.sections.map(sectionToRow));
    if (error) throw error;
  }
  if (data.steps.length > 0) {
    const { error } = await client.from("steps").insert(data.steps.map(stepToRow));
    if (error) throw error;
  }
  if (data.timeLogs.length > 0) {
    const { error } = await client.from("time_logs").insert(data.timeLogs.map(timeLogToRow));
    if (error) throw error;
  }
}

export async function upsertProject(client: SupabaseClient, project: Project) {
  const { error } = await client.from("projects").upsert(projectToRow(project));
  if (error) throw error;
}

export async function deleteProjectRemote(client: SupabaseClient, id: string) {
  const { error } = await client.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertSection(client: SupabaseClient, section: Section) {
  const { error } = await client.from("sections").upsert(sectionToRow(section));
  if (error) throw error;
}

export async function deleteSectionRemote(client: SupabaseClient, id: string) {
  const { error } = await client.from("sections").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertStep(client: SupabaseClient, step: Step) {
  const { error } = await client.from("steps").upsert(stepToRow(step));
  if (error) throw error;
}

export async function deleteStepRemote(client: SupabaseClient, id: string) {
  const { error } = await client.from("steps").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertSteps(client: SupabaseClient, steps: Step[]) {
  if (steps.length === 0) return;
  const { error } = await client.from("steps").upsert(steps.map(stepToRow));
  if (error) throw error;
}

export async function upsertSections(client: SupabaseClient, sections: Section[]) {
  if (sections.length === 0) return;
  const { error } = await client.from("sections").upsert(sections.map(sectionToRow));
  if (error) throw error;
}

export async function upsertTimeLog(client: SupabaseClient, log: TimeLog) {
  const { error } = await client.from("time_logs").upsert(timeLogToRow(log));
  if (error) throw error;
}

export async function deleteTimeLogRemote(client: SupabaseClient, id: string) {
  const { error } = await client.from("time_logs").delete().eq("id", id);
  if (error) throw error;
}
