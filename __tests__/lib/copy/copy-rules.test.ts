import { describe, it, expect } from "vitest";
import type { CopyEntry, TemplateCopyEntry } from "@/lib/copy/types";

function wordCount(s: string): number {
  return s
    .replace(/\[[^\]]+\]/g, "X")
    .split(/\s+/)
    .filter(Boolean).length;
}

const PROHIBITED_WORDS = [
  "objetivo",
  "meta",
  "progreso",
  "productividad",
  "recordatorio",
  "completar",
  "logro",
  "achievement",
  "check-in",
  "hábito",
];

function containsProhibitedWord(s: string): string | null {
  const lower = s.toLowerCase();
  for (const word of PROHIBITED_WORDS) {
    if (lower.includes(word)) return word;
  }
  return null;
}

function isValidCopyEntry(
  entry: CopyEntry | TemplateCopyEntry
): entry is CopyEntry | TemplateCopyEntry {
  return (
    typeof entry.A === "string" &&
    typeof entry.B === "string" &&
    typeof entry.C === "string" &&
    ["A", "B", "C"].includes(entry.recommended)
  );
}

export { wordCount, containsProhibitedWord, isValidCopyEntry };

describe("copy rule helpers", () => {
  it("counts words correctly", () => {
    expect(wordCount("El mundo escuchó.")).toBe(3);
    expect(wordCount("¿Qué decide [nombre] hoy?")).toBe(4);
    expect(wordCount("[nombre]. [ritual]. [lugar], [hora].")).toBe(4);
  });

  it("detects prohibited words", () => {
    expect(containsProhibitedWord("Tu objetivo mensual")).toBe("objetivo");
    expect(containsProhibitedWord("El mundo escuchó.")).toBeNull();
    expect(containsProhibitedWord("Completar tu hábito")).toBe("completar");
  });
});
