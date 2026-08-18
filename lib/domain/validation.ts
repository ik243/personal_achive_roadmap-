import { z } from "zod";
import { STEP_STATUSES } from "./types";

export const projectTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(120, "Title must be 120 characters or less");

export const sectionTitleSchema = projectTitleSchema;

export const stepTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be 200 characters or less");

export const weightSchema = z
  .number()
  .int()
  .min(1, "Minimum weight is 1")
  .max(5, "Maximum weight is 5");

export const stepStatusSchema = z.enum(STEP_STATUSES);

export const timeLogSchema = z.object({
  hours: z.number().int().min(0).max(24 * 7),
  minutes: z.number().int().min(0).max(59),
  loggedAt: z.string().datetime({ offset: true }).or(z.string().date()),
}).refine((data) => data.hours * 60 + data.minutes > 0, {
  message: "Duration must be greater than zero",
  path: ["minutes"],
}).refine((data) => data.hours * 60 + data.minutes <= 24 * 60, {
  message: "Duration is too large",
  path: ["hours"],
});

export const createProjectSchema = z.object({
  title: projectTitleSchema,
});

export const createSectionSchema = z.object({
  title: sectionTitleSchema,
});

export const createStepSchema = z.object({
  title: stepTitleSchema,
  weight: weightSchema.default(1),
  status: stepStatusSchema.default("NOT_STARTED"),
  sectionId: z.string().uuid().nullable().optional(),
});

export const updateStepSchema = z.object({
  title: stepTitleSchema.optional(),
  weight: weightSchema.optional(),
  status: stepStatusSchema.optional(),
  sectionId: z.string().uuid().nullable().optional(),
});
