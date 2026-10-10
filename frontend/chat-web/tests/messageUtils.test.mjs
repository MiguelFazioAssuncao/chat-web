import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/utils/messageUtils.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { mergeIncoming, mergeHistory } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const message = (id, props = {}) => ({
  id,
  content: "Olá",
  senderId: "you",
  senderUsername: "Você",
  receiverUsername: "Ana",
  sentAt: "2026-10-10T10:00:00Z",
  ...props,
});

test("confirms the right optimistic message when identical content is sent twice", () => {
  const result = mergeIncoming(
    [
      message("temp-1", { pending: true }),
      message("temp-2", { pending: true }),
    ],
    message("saved-2", { clientMessageId: "temp-2" }),
  );
  assert.deepEqual(
    result.map((m) => m.id),
    ["temp-1", "saved-2"],
  );
  assert.equal(result[0].pending, true);
  assert.equal(result[1].pending, undefined);
});
test("does not duplicate a redelivered server message", () => {
  assert.equal(mergeIncoming([message("saved")], message("saved")).length, 1);
});
test("removes an optimistic copy even if history already contains its saved ID", () => {
  const result = mergeIncoming(
    [message("temp", { pending: true }), message("saved")],
    message("saved", { clientMessageId: "temp" }),
  );
  assert.deepEqual(
    result.map((m) => m.id),
    ["saved"],
  );
});
test("history preserves messages received during the request and pending sends", () => {
  const result = mergeHistory(
    [message("existing")],
    [
      message("existing"),
      message("new"),
      message("pending", { pending: true }),
    ],
    new Set(["existing", "pending"]),
  );
  assert.deepEqual(
    result.map((m) => m.id),
    ["existing", "new", "pending"],
  );
});
test("history removes old deleted messages and confirmed optimistic copies", () => {
  const result = mergeHistory(
    [message("saved", { clientMessageId: "temp" })],
    [message("old-deleted"), message("temp", { pending: true })],
    new Set(["old-deleted", "temp"]),
  );
  assert.deepEqual(
    result.map((m) => m.id),
    ["saved"],
  );
});
