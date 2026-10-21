export type CompetitionTrack =
  | "C"
  | "C++"
  | "Java"
  | "Python"
  | "Web Development"
  | "DSA";

export type MCQCategory =
  | "Fundamentals"
  | "Technical Understanding"
  | "Logic and Debugging"
  | "Case Study";

export type DifficultyLevel = "Easy" | "Moderate" | "Tricky";

export interface OfficialMCQQuestion {
  q_number: number;
  track: CompetitionTrack;
  category: MCQCategory;
  difficulty: DifficultyLevel;
  marks: number;
  question_text: string;
  code_snippet?: string | null;
  case_study_passage?: string | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
}

