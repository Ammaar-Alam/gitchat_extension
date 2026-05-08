import * as assert from "assert";
import * as path from "path";
import * as fs from "fs";

// Load the vanilla JS helper into a sandboxed global so we can call it from TS.
// `messagePreview.js` lives in `media/webview/` (not bundled, browser-vanilla),
// so we read the source and run it via `new Function` against a fake `window`.
// `any` is intentional here — the helper is untyped JS and lives outside the TS world.
const helperPath = path.join(__dirname, "..", "..", "..", "media", "webview", "messagePreview.js");
const helperSrc = fs.readFileSync(helperPath, "utf8");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sandbox: any = {};
new Function("window", "globalThis", helperSrc)(sandbox, sandbox);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gsMessagePreview: any = sandbox.gsMessagePreview;

suite("gsMessagePreview", () => {
  test("text-only DM", () => {
    const out = gsMessagePreview({ body: "hello" }, {});
    assert.strictEqual(out.text, "hello");
    assert.strictEqual(out.attachmentType, null);
    assert.strictEqual(out.thumbUrl, null);
  });

  test("image-only DM emits \"Photo\" label", () => {
    const out = gsMessagePreview(
      { body: "", attachments: [{ type: "image", url: "https://x/1.jpg", thumbnail_url: "https://x/1-t.jpg" }] },
      {},
    );
    assert.strictEqual(out.text, "Photo");
    assert.strictEqual(out.attachmentType, "image");
    assert.strictEqual(out.thumbUrl, "https://x/1-t.jpg");
  });

  test("image with caption shows caption", () => {
    const out = gsMessagePreview(
      { body: "look at this", attachments: [{ type: "image", url: "https://x/1.jpg", thumbnail_url: "https://x/1-t.jpg" }] },
      {},
    );
    assert.strictEqual(out.text, "look at this");
  });

  test("forward via structured field", () => {
    const out = gsMessagePreview({ body: "hi", forwarded_from_original_author: "alice" }, {});
    assert.strictEqual(out.text, "↪ @alice: hi");
  });

  test("forward via legacy prefix", () => {
    const out = gsMessagePreview({ body: "> Forwarded from @alice\n\nhi" }, {});
    assert.strictEqual(out.text, "↪ @alice: hi");
    assert.strictEqual(out.forwardedFromOriginalAuthor, "alice");
  });

  test("group adds sender prefix", () => {
    const out = gsMessagePreview({ body: "hi" }, { isGroup: true, senderLogin: "bob" });
    assert.strictEqual(out.text, "bob: hi");
  });

  test("group + forward stacks both", () => {
    const out = gsMessagePreview(
      { body: "hi", forwarded_from_original_author: "carol" },
      { isGroup: true, senderLogin: "bob" },
    );
    assert.strictEqual(out.text, "bob: ↪ @carol: hi");
  });

  test("file attachment uses filename", () => {
    const out = gsMessagePreview(
      { body: "", attachments: [{ type: "file", filename: "report.pdf" }] },
      {},
    );
    assert.strictEqual(out.text, "report.pdf");
    assert.strictEqual(out.attachmentType, "file");
  });

  test("forward via legacy prefix with CRLF", () => {
    const out = gsMessagePreview({ body: "> Forwarded from @alice\r\n\r\nhi" }, {});
    assert.strictEqual(out.text, "↪ @alice: hi");
    assert.strictEqual(out.forwardedFromOriginalAuthor, "alice");
  });

  test("gif-only DM emits 'GIF' label", () => {
    const out = gsMessagePreview(
      { body: "", attachments: [{ type: "gif", url: "https://x/g.gif", thumbnail_url: "https://x/g-t.jpg" }] },
      {},
    );
    assert.strictEqual(out.text, "GIF");
    assert.strictEqual(out.attachmentType, "gif");
    assert.strictEqual(out.thumbUrl, "https://x/g-t.jpg");
  });

  test("file attachment does not return thumbUrl", () => {
    const out = gsMessagePreview(
      { body: "", attachments: [{ type: "file", filename: "report.pdf", url: "https://x/r.pdf" }] },
      {},
    );
    assert.strictEqual(out.text, "report.pdf");
    assert.strictEqual(out.attachmentType, "file");
    assert.strictEqual(out.thumbUrl, null);
  });

  test("rejects non-http URL schemes for thumbUrl", () => {
    const out = gsMessagePreview(
      { body: "", attachments: [{ type: "image", url: "javascript:alert(1)" }] },
      {},
    );
    assert.strictEqual(out.thumbUrl, null);
    assert.strictEqual(out.text, "Photo");
  });

  test("falls back to message.attachment_url when attachments[0] has type but no url", () => {
    const out = gsMessagePreview(
      {
        body: "",
        attachments: [{ type: "image" }],
        attachment_url: "https://x/legacy.jpg",
      },
      {},
    );
    assert.strictEqual(out.thumbUrl, "https://x/legacy.jpg");
    assert.strictEqual(out.text, "Photo");
  });

  test("legacy emoji prefix '📷 Photo' produces image attachmentType", () => {
    const out = gsMessagePreview({ body: "📷 Photo" }, {});
    assert.strictEqual(out.attachmentType, "image");
    assert.strictEqual(out.text, "Photo");
    assert.strictEqual(out.thumbUrl, null);
  });

  test("legacy emoji prefix '🎥 Video' produces video attachmentType", () => {
    const out = gsMessagePreview({ body: "🎥 Video" }, {});
    assert.strictEqual(out.attachmentType, "video");
    assert.strictEqual(out.text, "Video");
  });

  test("legacy emoji prefix '📎 report.pdf' produces file attachmentType + filename", () => {
    const out = gsMessagePreview({ body: "📎 report.pdf" }, {});
    assert.strictEqual(out.attachmentType, "file");
    assert.strictEqual(out.text, "report.pdf");
  });

  test("legacy emoji prefix combines with structured forward field", () => {
    const out = gsMessagePreview(
      { body: "📷 Photo", forwarded_from_original_author: "alice" },
      {},
    );
    assert.strictEqual(out.attachmentType, "image");
    assert.strictEqual(out.text, "↪ @alice: Photo");
  });
});
