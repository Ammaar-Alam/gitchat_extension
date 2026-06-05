import * as assert from "assert";
import { apiClient } from "../../api";

// Regression for "attachments.0.property is_video should not exist (400)":
// the message endpoints validate with forbidNonWhitelisted, so sendMessage must
// strip any field that isn't on the server allowlist (is_video, plus anything
// else the upload response / optimistic helpers tack on) before POSTing.
suite("apiClient send attachment sanitization", () => {
  test("sendMessage drops is_video and unknown fields, keeps allowed ones", async () => {
    apiClient.init();
    const originalPost = apiClient.http.post;
    let captured: Record<string, unknown> | undefined;

    apiClient.http.post = (async (_url: string, payload: Record<string, unknown>) => {
      captured = payload;
      return { data: { data: { id: "m1" } } };
    }) as typeof apiClient.http.post;

    try {
      await apiClient.sendMessage("conv-1", "hi", [{
        type: "image",
        url: "https://cdn/x.png",
        storage_path: "messages/conv-1/x.png",
        filename: "x.png",
        mime_type: "image/png",
        size_bytes: 10,
        is_video: false,
        // @ts-expect-error — intentionally simulate an extra leaked field
        _blobUrl: "blob:nope",
      }]);

      const sent = (captured?.attachments as Record<string, unknown>[])[0];
      assert.deepStrictEqual(Object.keys(sent).sort(), ["filename", "mime_type", "size_bytes", "storage_path", "type", "url"]);
      assert.strictEqual("is_video" in sent, false, "is_video must be stripped");
      assert.strictEqual("_blobUrl" in sent, false, "unknown fields must be stripped");
      assert.strictEqual(sent.url, "https://cdn/x.png");
      assert.strictEqual(sent.type, "image");
    } finally {
      apiClient.http.post = originalPost;
    }
  });

  test("sendMessage keeps video metadata fields (duration_seconds, thumbnail_url)", async () => {
    apiClient.init();
    const originalPost = apiClient.http.post;
    let captured: Record<string, unknown> | undefined;

    apiClient.http.post = (async (_url: string, payload: Record<string, unknown>) => {
      captured = payload;
      return { data: { data: { id: "m2" } } };
    }) as typeof apiClient.http.post;

    try {
      await apiClient.sendMessage("conv-1", "", [{
        type: "video",
        url: "https://cdn/v.mp4",
        storage_path: "messages/conv-1/v.mp4",
        duration_seconds: 12,
        thumbnail_url: "https://cdn/v-t.jpg",
        is_video: true,
      }]);

      const sent = (captured?.attachments as Record<string, unknown>[])[0];
      assert.strictEqual(sent.duration_seconds, 12);
      assert.strictEqual(sent.thumbnail_url, "https://cdn/v-t.jpg");
      assert.strictEqual("is_video" in sent, false);
    } finally {
      apiClient.http.post = originalPost;
    }
  });
});
