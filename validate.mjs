#!/usr/bin/env node
// SPDX-License-Identifier: MIT OR Apache-2.0
// Validate .persona files (bankML .persona v1), with no dependency:
//   · JSON, an object; "persona" (an id) and "name" are text; "system_prompt" is text and present
//   · "behavioral_traits", when present, a list of text; "awareness.facts", when present, a list of {fact}
//   · the prompt's size: every token of it is read by the visitor's CPU before the first answer (and warmed once, then
//     kept), so a budget is enforced — estimated as words × 1.35, the model's tokenizer being near that on English
//   · browseML's own rules: no claim that a server answers, no promise of what is not there ("coming soon")
//   node validate.mjs [file …]      (default: every personas/*.persona)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const BUDGET = 600;  // estimated tokens
export function validate(text) {
  const errors = [], warnings = [];
  let p;
  try { p = JSON.parse(text); } catch { return { errors: ["not JSON"], warnings, tokens: 0 }; }
  if (!p || typeof p !== "object" || Array.isArray(p)) return { errors: ["not a JSON object"], warnings, tokens: 0 };
  for (const k of ["persona", "name", "system_prompt"]) if (typeof p[k] !== "string" || !p[k].trim()) errors.push(`"${k}" must be non-empty text`);
  if (p.behavioral_traits !== undefined && !(Array.isArray(p.behavioral_traits) && p.behavioral_traits.every((t) => typeof t === "string"))) errors.push('"behavioral_traits" must be a list of text');
  const facts = p.awareness?.facts;
  if (facts !== undefined && !(Array.isArray(facts) && facts.every((f) => f && typeof f.fact === "string"))) errors.push('"awareness.facts" must be a list of {fact}');
  const prompt = String(p.system_prompt ?? "");
  const tokens = Math.round(prompt.split(/\s+/).filter(Boolean).length * 1.35);
  if (tokens > BUDGET) errors.push(`the prompt is about ${tokens} tokens, over the ${BUDGET}-token budget (each is read on the visitor's CPU)`);
  if (/\b(coming soon|soon available|not live yet)\b/i.test(prompt)) errors.push("the prompt promises what is not there");
  if (/\b(our servers?|the server answers|cloud answers)\b/i.test(prompt)) errors.push("the prompt says a server answers: browseML answers in the browser");
  if (!/browser/i.test(prompt)) warnings.push("the prompt does not say it runs in the browser");
  return { errors, warnings, tokens };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = new URL("./personas/", import.meta.url).pathname;
  const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(root).filter((f) => f.endsWith(".persona")).map((f) => join(root, f));
  let bad = 0;
  for (const f of files) {
    const r = validate(readFileSync(f, "utf8"));
    console.log(`${r.errors.length ? "FAIL" : "ok  "} ${f.split("/").pop()} — about ${r.tokens} tokens${r.errors.length ? ": " + r.errors.join("; ") : ""}${r.warnings.length ? " (" + r.warnings.join("; ") + ")" : ""}`);
    bad += r.errors.length > 0;
  }
  process.exit(bad ? 1 : 0);
}
