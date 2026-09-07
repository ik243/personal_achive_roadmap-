"use client";

import type { UniversityScores } from "./data";

const UNIVERSITY_SCORES_KEY = "roadmap-university-scores-v1";

export function readUniversityScores(): UniversityScores {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(UNIVERSITY_SCORES_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as UniversityScores;
  } catch {
    return {};
  }
}

export function writeUniversityScores(scores: UniversityScores) {
  if (typeof window === "undefined") return;
  localStorage.setItem(UNIVERSITY_SCORES_KEY, JSON.stringify(scores));
}
