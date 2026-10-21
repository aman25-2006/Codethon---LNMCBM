import { OfficialMCQQuestion, CompetitionTrack } from "./types";
import { TRACK_C_QUESTIONS } from "./track-c";
import { TRACK_CPP_QUESTIONS } from "./track-cpp";
import { TRACK_JAVA_QUESTIONS } from "./track-java";
import { TRACK_PYTHON_QUESTIONS } from "./track-python";
import { TRACK_WEB_QUESTIONS } from "./track-web";
import { TRACK_DSA_QUESTIONS } from "./track-dsa";

export * from "./types";
export {
  TRACK_C_QUESTIONS,
  TRACK_CPP_QUESTIONS,
  TRACK_JAVA_QUESTIONS,
  TRACK_PYTHON_QUESTIONS,
  TRACK_WEB_QUESTIONS,
  TRACK_DSA_QUESTIONS,
};

export const VALID_TRACKS: CompetitionTrack[] = [
  "C",
  "C++",
  "Java",
  "Python",
  "Web Development",
  "DSA",
];

export const ALL_OFFICIAL_QUESTIONS: OfficialMCQQuestion[] = [
  ...TRACK_C_QUESTIONS,
  ...TRACK_CPP_QUESTIONS,
  ...TRACK_JAVA_QUESTIONS,
  ...TRACK_PYTHON_QUESTIONS,
  ...TRACK_WEB_QUESTIONS,
  ...TRACK_DSA_QUESTIONS,
];

export function getQuestionsByTrack(track?: string | null): OfficialMCQQuestion[] {
  if (!track) return TRACK_C_QUESTIONS;
  const normalized = track.trim().toLowerCase();
  switch (normalized) {
    case "c":
      return TRACK_C_QUESTIONS;
    case "c++":
    case "cpp":
      return TRACK_CPP_QUESTIONS;
    case "java":
      return TRACK_JAVA_QUESTIONS;
    case "python":
    case "py":
      return TRACK_PYTHON_QUESTIONS;
    case "web":
    case "web development":
    case "web dev":
    case "javascript":
    case "html/css":
      return TRACK_WEB_QUESTIONS;
    case "dsa":
    case "data structures":
    case "data structures & algorithms":
      return TRACK_DSA_QUESTIONS;
    default:
      return TRACK_C_QUESTIONS;
  }
}
