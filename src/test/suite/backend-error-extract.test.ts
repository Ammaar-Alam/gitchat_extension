import * as assert from "assert";
import { extractBackendError } from "../../webviews/chat-handlers";

// Regression for the "[object Object]400" toast: the backend nests its error as
// data.message = { message, error, statusCode }, so `${data.message}` rendered
// "[object Object]". extractBackendError must dig out the human string from
// every shape the API uses.
suite("extractBackendError", () => {
  test("nested NestJS shape: data.message is an object", () => {
    const err = { response: { status: 400, data: { message: { message: "Attachment storage_path is required", error: "Bad Request", statusCode: 400 } } } };
    assert.strictEqual(extractBackendError(err), "Attachment storage_path is required");
  });

  test("data.error.message shape", () => {
    const err = { response: { status: 403, data: { error: { message: "You must follow this user on GitHub" } } } };
    assert.strictEqual(extractBackendError(err), "You must follow this user on GitHub");
  });

  test("validation array under data.message", () => {
    const err = { response: { status: 400, data: { message: ["body should not be empty", "attachments must be an array"] } } };
    assert.strictEqual(extractBackendError(err), "body should not be empty; attachments must be an array");
  });

  test("plain string data.message", () => {
    const err = { response: { status: 400, data: { message: "Conversation not found" } } };
    assert.strictEqual(extractBackendError(err), "Conversation not found");
  });

  test("never returns [object Object] for an unrecognized object", () => {
    const err = { response: { status: 500, data: { weird: { nested: true } } } };
    const out = extractBackendError(err);
    assert.ok(!out.includes("[object Object]"), `got: ${out}`);
    assert.ok(out.length > 0);
  });

  test("falls back to error.message when no response body", () => {
    assert.strictEqual(extractBackendError(new Error("Network Error")), "Network Error");
  });
});
