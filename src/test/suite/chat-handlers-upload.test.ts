import * as assert from "assert";
import * as vscode from "vscode";
import { apiClient } from "../../api";
import { handleChatMessage, type ChatContext } from "../../webviews/chat-handlers";

suite("handleChatMessage upload", () => {
  test("uploads queued draft attachments after promoting the DM on send", async () => {
    const originalCreateConversation = apiClient.createConversation;
    const originalUploadAttachment = apiClient.uploadAttachment;
    const originalSendMessage = apiClient.sendMessage;

    const createCalls: string[] = [];
    const uploadConversationIds: string[] = [];
    type SendAttachments = Parameters<typeof apiClient.sendMessage>[2];
    const sentMessages: { conversationId: string; content: string; attachments: SendAttachments }[] = [];
    const posts: unknown[] = [];

    apiClient.createConversation = (async (username: string) => {
      createCalls.push(username);
      return { id: "real-conv-1" };
    }) as typeof apiClient.createConversation;

    apiClient.uploadAttachment = (async (conversationId: string) => {
      uploadConversationIds.push(conversationId);
      return {
        url: "https://gitchat.sh/uploads/photo.png",
        storage_path: "messages/real-conv-1/photo.png",
        filename: "photo.png",
        mime_type: "image/png",
        size_bytes: 4,
        type: "image",
      };
    }) as typeof apiClient.uploadAttachment;

    apiClient.sendMessage = (async (conversationId: string, content: string, attachments?: SendAttachments) => {
      sentMessages.push({ conversationId, content, attachments });
      return {
        id: "msg-1",
        conversation_id: conversationId,
        sender: "alice",
        sender_avatar: "",
        content,
        created_at: "2026-06-01T00:00:00.000Z",
        edited_at: null,
        reactions: [],
        attachment_url: null,
        attachments: attachments ?? [],
      } as Awaited<ReturnType<typeof apiClient.sendMessage>>;
    }) as typeof apiClient.sendMessage;

    const ctx: ChatContext = {
      conversationId: "draft:bob",
      postToWebview: (msg: unknown) => posts.push(msg),
      recentlySentIds: new Set(),
      extensionUri: vscode.Uri.file(__dirname),
      isGroup: false,
      prefixMessages: true,
      cursorState: {
        cursor: undefined,
        previousCursor: undefined,
        nextCursor: undefined,
        hasMore: true,
        hasMoreBefore: true,
        hasMoreAfter: false,
      },
      reloadConversation: async () => {},
      disposePanel: () => {},
    };

    try {
      const handled = await handleChatMessage({
        type: "send",
        payload: {
          content: "",
          _tempId: "temp-1",
          pendingUploads: [{
            data: Buffer.from("test").toString("base64"),
            filename: "photo.png",
            mimeType: "image/png",
          }],
        },
      }, ctx);

      assert.strictEqual(handled, true);
      assert.deepStrictEqual(createCalls, ["bob"]);
      assert.deepStrictEqual(uploadConversationIds, ["real-conv-1"]);
      assert.deepStrictEqual(sentMessages, [{
        conversationId: "real-conv-1",
        content: "",
        attachments: [{
          url: "https://gitchat.sh/uploads/photo.png",
          storage_path: "messages/real-conv-1/photo.png",
          filename: "photo.png",
          mime_type: "image/png",
          size_bytes: 4,
          type: "image",
        }],
      }]);
      assert.deepStrictEqual(posts, [
        {
          type: "chat:draftPromoted",
          draftId: "draft:bob",
          conversationId: "real-conv-1",
        },
        {
          type: "chat:newMessage",
          payload: {
            id: "msg-1",
            conversation_id: "real-conv-1",
            sender: "alice",
            sender_avatar: "",
            content: "",
            created_at: "2026-06-01T00:00:00.000Z",
            edited_at: null,
            reactions: [],
            attachment_url: null,
            attachments: [{
              url: "https://gitchat.sh/uploads/photo.png",
              storage_path: "messages/real-conv-1/photo.png",
              filename: "photo.png",
              mime_type: "image/png",
              size_bytes: 4,
              type: "image",
            }],
          },
        },
      ]);
    } finally {
      apiClient.createConversation = originalCreateConversation;
      apiClient.uploadAttachment = originalUploadAttachment;
      apiClient.sendMessage = originalSendMessage;
    }
  });
});
