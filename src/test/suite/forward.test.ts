import * as assert from "assert";

// Mirror of the forwarded-prefix parser in `media/webview/sidebar-chat.js`
// (the webview is plain JS, so we replicate the spec here for unit testing).
//
// Two formats must be recognised:
//   1. Server-stamped (POST /messages/:id/forward, since webapp PR #71):
//        `> Forwarded from @<login>\n\n<body>`
//      `<login>` matches GitHub's username rules — start with alphanumeric,
//      up to 39 chars total, alphanumerics + hyphens.
//   2. Legacy client-stamped (older extension versions did this in
//      `chat-handlers.ts` before adopting the backend endpoint):
//        `↪ Forwarded\n<body>` or `↪ Forwarded from @<login>\n<body>`
//      Kept for backwards compatibility with already-sent messages.
function parseForwardedPrefix(text: string): { isForwarded: boolean; sender?: string; body: string } {
  const serverMatch = text.match(/^> Forwarded from @([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))(?:\n+|$)/);
  const legacyMatch = serverMatch ? null : text.match(/^↪ Forwarded(?:\s+from\s+@(\S+))?\n/);
  const match = serverMatch || legacyMatch;
  if (!match) return { isForwarded: false, body: text };
  return { isForwarded: true, sender: match[1] || undefined, body: text.slice(match[0].length) };
}

suite("parseForwardedPrefix", () => {
  suite("server-stamped format", () => {
    test("strips '> Forwarded from @user\\n\\n' and keeps body + extracts sender", () => {
      const result = parseForwardedPrefix("> Forwarded from @ethanmiller0x\n\nKem anh");
      assert.strictEqual(result.isForwarded, true);
      assert.strictEqual(result.sender, "ethanmiller0x");
      assert.strictEqual(result.body, "Kem anh");
    });

    test("handles empty body (prefix-only message, e.g. attachments-only forward)", () => {
      const result = parseForwardedPrefix("> Forwarded from @hieuna1111\n\n");
      assert.strictEqual(result.isForwarded, true);
      assert.strictEqual(result.sender, "hieuna1111");
      assert.strictEqual(result.body, "");
    });

    test("accepts hyphenated login + extracts it", () => {
      const result = parseForwardedPrefix("> Forwarded from @nakamoto-hiru\n\nhi");
      assert.strictEqual(result.isForwarded, true);
      assert.strictEqual(result.sender, "nakamoto-hiru");
      assert.strictEqual(result.body, "hi");
    });

    test("does not match without the leading '@'", () => {
      const result = parseForwardedPrefix("> Forwarded from ethanmiller0x\n\nbody");
      assert.strictEqual(result.isForwarded, false);
      assert.strictEqual(result.body, "> Forwarded from ethanmiller0x\n\nbody");
    });

    test("does not match when '> Forwarded' appears mid-message", () => {
      const result = parseForwardedPrefix("hello\n> Forwarded from @user\n\nbody");
      assert.strictEqual(result.isForwarded, false);
    });
  });

  suite("legacy client-stamped format", () => {
    test("strips '↪ Forwarded\\n' — no sender, badge falls back to plain 'Forwarded'", () => {
      const result = parseForwardedPrefix("↪ Forwarded\nawesome");
      assert.strictEqual(result.isForwarded, true);
      assert.strictEqual(result.sender, undefined);
      assert.strictEqual(result.body, "awesome");
    });

    test("strips '↪ Forwarded from @user\\n' + extracts sender", () => {
      const result = parseForwardedPrefix("↪ Forwarded from @ethanmiller0x\nKem anh");
      assert.strictEqual(result.isForwarded, true);
      assert.strictEqual(result.sender, "ethanmiller0x");
      assert.strictEqual(result.body, "Kem anh");
    });
  });

  suite("nested / chain forwards", () => {
    test("server prefix wins when both formats appear (legacy body wrapped by server forward)", () => {
      // A user previously forwarded via legacy client (body = "↪ Forwarded\nhi"),
      // then someone forwarded that message via the new server endpoint —
      // backend stamps `>` on top. The outer (server) badge should render with
      // the outer sender, and the inner legacy prefix is preserved as part of
      // the displayed body.
      const text = "> Forwarded from @ethanmiller0x\n\n↪ Forwarded\nhi";
      const result = parseForwardedPrefix(text);
      assert.strictEqual(result.isForwarded, true);
      assert.strictEqual(result.sender, "ethanmiller0x");
      assert.strictEqual(result.body, "↪ Forwarded\nhi");
    });
  });

  suite("non-forwarded messages", () => {
    test("plain text passes through untouched", () => {
      const result = parseForwardedPrefix("just a normal message");
      assert.strictEqual(result.isForwarded, false);
      assert.strictEqual(result.body, "just a normal message");
    });

    test("blockquote that isn't a forward prefix passes through", () => {
      const result = parseForwardedPrefix("> some quoted line\nrest");
      assert.strictEqual(result.isForwarded, false);
      assert.strictEqual(result.body, "> some quoted line\nrest");
    });
  });
});
