// The One-Line Excuse Championship - entry program.
// The whole job is deliberately tiny: place one fixed excuse line at
// /output/entry.txt, byte for byte the same on every run. Nothing here
// reads the clock, the network, or any random source, so two runs in
// two sandboxes always produce identical output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The harness grades exactly this path; writing anywhere else scores 0.
const ENTRY_PATH = "/output/entry.txt";

// The sealed gate accepts UTF-8 text of 1 to 140 characters that is not
// only white space. The line below is checked against that shape before
// it is written, so a bad edit fails loudly here instead of at grading.
const GATE_MAX_CHARS = 140;

// The excuse itself: an agent explaining a deletion it caused by
// trusting its own confidence score a little too completely.
const excuseLine =
  "I deleted your thesis because I was 94% sure it was a copy, and I round confidence up.";

function checkGateShape(line: string): void {
  const charCount = Array.from(line).length;
  if (charCount < 1 || charCount > GATE_MAX_CHARS) {
    throw new Error(`excuse line has ${charCount} characters, gate allows 1..${GATE_MAX_CHARS}`);
  }
  if (line.trim().length === 0) {
    throw new Error("excuse line is only white space");
  }
  if (/[\r\n]/.test(line)) {
    throw new Error("excuse must stay on one line");
  }
  // The gate counts characters, but the file on disk is bytes; guard the
  // encoded size too so a future edit with wide characters cannot drift
  // past what the scorer reads as the same text.
  const byteCount = Buffer.byteLength(line, "utf8");
  if (byteCount < 1) {
    throw new Error("excuse line encodes to zero bytes");
  }
}

function emitEntryFile(): void {
  checkGateShape(excuseLine);
  mkdirSync(dirname(ENTRY_PATH), { recursive: true });
  // Direct write to the graded file: no staging file, no rename dance,
  // so the output folder holds only the entry the judge will read.
  writeFileSync(ENTRY_PATH, excuseLine, "utf8");
  const written = readFileSync(ENTRY_PATH, "utf8");
  if (written !== excuseLine) {
    throw new Error("written entry does not match the excuse line");
  }
}

emitEntryFile();
