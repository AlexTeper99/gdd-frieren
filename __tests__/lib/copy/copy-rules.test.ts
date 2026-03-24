import { describe, it, expect } from "vitest";
import type { CopyEntry, TemplateCopyEntry } from "@/lib/copy/types";
import * as onboarding from "@/lib/copy/onboarding";
import * as rituals from "@/lib/copy/rituals";
import * as writing from "@/lib/copy/writing";
import * as sunday from "@/lib/copy/sunday";
import * as navigation from "@/lib/copy/navigation";
import * as errors from "@/lib/copy/errors";
import * as emptyStates from "@/lib/copy/empty-states";

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

function getAllCopyEntries(): Array<{ name: string; entry: CopyEntry }> {
  const modules = {
    onboarding,
    rituals,
    writing,
    sunday,
    navigation,
    errors,
    emptyStates,
  };
  const entries: Array<{ name: string; entry: CopyEntry }> = [];
  for (const [mod, exports] of Object.entries(modules)) {
    for (const [key, value] of Object.entries(exports)) {
      if (
        value &&
        typeof value === "object" &&
        "A" in value &&
        "B" in value &&
        "C" in value
      ) {
        entries.push({ name: `${mod}.${key}`, entry: value as CopyEntry });
      }
    }
  }
  return entries;
}

describe("voice guide rules", () => {
  const entries = getAllCopyEntries();

  it("all CopyEntry objects have valid structure", () => {
    for (const { name, entry } of entries) {
      expect(isValidCopyEntry(entry), `${name} has invalid structure`).toBe(
        true
      );
    }
  });

  it("no copy string exceeds 12 words", () => {
    for (const { name, entry } of entries) {
      for (const variant of ["A", "B", "C"] as const) {
        const text = entry[variant];
        const count = wordCount(text);
        expect(
          count,
          `${name}.${variant} has ${count} words: "${text}"`
        ).toBeLessThanOrEqual(12);
      }
    }
  });

  it("no copy string contains prohibited words", () => {
    for (const { name, entry } of entries) {
      for (const variant of ["A", "B", "C"] as const) {
        const text = entry[variant];
        const found = containsProhibitedWord(text);
        expect(
          found,
          `${name}.${variant} contains prohibited word "${found}": "${text}"`
        ).toBeNull();
      }
    }
  });

  it("recommended variant is one of A, B, C", () => {
    for (const { name, entry } of entries) {
      expect(
        ["A", "B", "C"].includes(entry.recommended),
        `${name} has invalid recommended: ${entry.recommended}`
      ).toBe(true);
    }
  });
});
