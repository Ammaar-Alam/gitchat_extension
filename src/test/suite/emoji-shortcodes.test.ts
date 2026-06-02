import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";

const helperPath = path.join(__dirname, "..", "..", "..", "media", "webview", "emojiShortcodes.js");
const helperSrc = fs.readFileSync(helperPath, "utf8");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sandbox: any = {};
new Function("window", "globalThis", helperSrc)(sandbox, sandbox);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emojiShortcodes: any = sandbox.GitChatEmojiShortcodes;

suite("GitChatEmojiShortcodes", () => {
  test("replaces Discord-style shortcodes inside text", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes("ship:rocket: today"),
      "ship🚀 today",
    );
  });

  test("replaces uppercase shortcode names", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes("Nice :SMILE:"),
      "Nice 😊",
    );
  });

  test("supports common Discord aliases", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes("approved :white_check_mark: :thumbsup:"),
      "approved ✅ 👍",
    );
  });

  test("preserves unknown shortcodes", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes("custom :not_real: stays"),
      "custom :not_real: stays",
    );
  });

  test("keeps legacy emoticon replacement", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes("ok :)"),
      "ok 😊",
    );
  });

  test("keeps existing colon aliases", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes(":check: :love: :cry:"),
      "✅ 😍 😭",
    );
  });
});
