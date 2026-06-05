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

  test("supports the full GitHub shortcode table", () => {
    assert.strictEqual(
      emojiShortcodes.replaceEmojiShortcodes("sad :disappointed:"),
      "sad 😞",
    );
    assert.ok(Object.keys(emojiShortcodes.shortcodes).length > 1000);
  });

  test("search returns ranked shortcode matches", () => {
    const [first] = emojiShortcodes.search(":fire:", 5);
    assert.strictEqual(first.code, "fire");
    assert.strictEqual(first.emoji, "🔥");
    assert.strictEqual(first.score, 0);
  });
});
