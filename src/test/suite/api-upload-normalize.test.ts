import * as assert from "assert";
import { apiClient } from "../../api";

// Regression for the "image uploads but sends blank / fails" bug: the upload
// endpoint has shipped the public URL under different field names across
// deploys. uploadAttachment must normalize whatever it gets so the returned
// attachment always carries a usable `url` (and `storage_path`), otherwise the
// optimistic bubble renders blank AND the follow-up send POST is rejected.
suite("apiClient.uploadAttachment normalization", () => {
  test("populates url/storage_path from aliased response fields", async () => {
    apiClient.init();
    const originalPost = apiClient.http.post;

    apiClient.http.post = (async () => ({
      data: {
        data: {
          // Backend used `file_url` + `key` on this deploy, not url/storage_path.
          file_url: "https://cdn.gitchat.sh/u/abc.png",
          key: "messages/conv-9/abc.png",
          mime_type: "image/png",
          size_bytes: 1234,
        },
      },
    })) as typeof apiClient.http.post;

    try {
      const result = await apiClient.uploadAttachment(
        "conv-9",
        Buffer.from("x"),
        "abc.png",
        "image/png",
      );
      assert.strictEqual(result.url, "https://cdn.gitchat.sh/u/abc.png");
      assert.strictEqual(result.storage_path, "messages/conv-9/abc.png");
      assert.strictEqual(result.mime_type, "image/png");
      assert.strictEqual(result.size_bytes, 1234);
    } finally {
      apiClient.http.post = originalPost;
    }
  });

  test("falls back to a non-empty url even when the response has no recognizable url field", async () => {
    apiClient.init();
    const originalPost = apiClient.http.post;

    apiClient.http.post = (async () => ({
      data: { data: { storage_path: "messages/conv-1/only-path.png" } },
    })) as typeof apiClient.http.post;

    try {
      const result = await apiClient.uploadAttachment(
        "conv-1",
        Buffer.from("xyz"),
        "only-path.png",
        "image/png",
      );
      // No url field anywhere → url stays empty string (the warn log fires),
      // but storage_path still resolves and the call does not throw.
      assert.strictEqual(result.storage_path, "messages/conv-1/only-path.png");
      assert.strictEqual(typeof result.url, "string");
      assert.strictEqual(result.size_bytes, 3);
    } finally {
      apiClient.http.post = originalPost;
    }
  });
});
