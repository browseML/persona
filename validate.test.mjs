// SPDX-License-Identifier: MIT OR Apache-2.0
import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, BUDGET } from "./validate.mjs";
const ok = (o) => JSON.stringify({ persona: "x", name: "X", system_prompt: "You run in the visitor's browser.", ...o });
test("a good persona passes", () => assert.deepEqual(validate(ok({})).errors, []));
test("not JSON, missing fields, wrong types", () => {
  assert.deepEqual(validate("nope").errors, ["not JSON"]);
  assert.match(validate(JSON.stringify({ persona: "x" })).errors.join(), /"name"/);
  assert.match(validate(ok({ behavioral_traits: [1] })).errors.join(), /behavioral_traits/);
});
test("the budget: every token is read on the visitor's CPU", () => {
  const long = Array(Math.ceil(BUDGET / 1.35) + 50).fill("browser").join(" ");
  assert.match(validate(ok({ system_prompt: long })).errors.join(), /budget/);
});
test("no promises, no server", () => {
  assert.match(validate(ok({ system_prompt: "In the browser. GPU coming soon." })).errors.join(), /promises/);
  assert.match(validate(ok({ system_prompt: "In the browser; our servers answer." })).errors.join(), /server/);
});
