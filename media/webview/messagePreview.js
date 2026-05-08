// media/webview/messagePreview.js
// Pure formatter — produces a structured preview object for chat-list and noti-tab rows.
// Renderers compose Codicon + thumbnail + text; this helper does NOT produce emoji.
(function (root) {
  var FORWARD_PREFIX_RE = /^(?:>\s+)?Forwarded from @([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))(?:(?:\r?\n)+|$)/;

  // Legacy backend "slim" preview format: the conversation-list endpoint
  // ships `last_message.body` as a literal `"📷 Photo"` / `"🎥 Video"` /
  // `"🎞 GIF"` / `"🎙 Voice message"` / `"📎 <filename>"` string when
  // structured attachments aren't included. Detect it so we can render a
  // Codicon (no emoji in UI per design system) instead of leaking the raw
  // emoji into the chat-list row.
  var LEGACY_LABEL_RE = /^(📷|🎥|🎞|🎙|📎)\s+(.+?)\s*$/;
  function matchLegacyEmojiLabel(s) {
    var m = s.match(LEGACY_LABEL_RE);
    if (!m) { return null; }
    switch (m[1]) {
      case "📷": return { type: "image", label: "Photo" };
      case "🎥": return { type: "video", label: "Video" };
      case "🎞": return { type: "gif", label: "GIF" };
      case "🎙": return { type: "voice", label: "Voice message" };
      case "📎": return { type: "file", label: m[2] || "File" };
      default:   return null;
    }
  }

  function parseLegacyForward(raw) {
    var m = (raw || "").match(FORWARD_PREFIX_RE);
    if (!m) { return { author: null, rest: raw || "" }; }
    var consumed = m[0].length;
    return { author: m[1], rest: (raw || "").slice(consumed) };
  }

  /**
   * @param {object} message — { body|content|preview, attachments?, forwarded_from_original_author?, sender_login? }
   * @param {object} opts — { isGroup?: boolean, senderLogin?: string }
   * @returns {{ text: string, attachmentType: 'image'|'video'|'gif'|'file'|'voice'|null, thumbUrl: string|null, forwardedFromOriginalAuthor: string|null }}
   */
  function gsMessagePreview(message, opts) {
    opts = opts || {};
    var raw = (message && (message.body || message.content || message.preview)) || "";

    var forwardedFromOriginalAuthor = (message && message.forwarded_from_original_author) || null;
    var bodyAfterForward = raw;
    if (forwardedFromOriginalAuthor) {
      bodyAfterForward = parseLegacyForward(raw).rest;
    } else {
      var legacy = parseLegacyForward(raw);
      if (legacy.author) {
        forwardedFromOriginalAuthor = legacy.author;
        bodyAfterForward = legacy.rest;
      }
    }

    var attachments = (message && message.attachments) || [];
    var first = attachments[0] || null;
    var attachmentType = null;
    if (first) {
      switch (first.type) {
        case "image": attachmentType = "image"; break;
        case "video": attachmentType = "video"; break;
        case "gif":   attachmentType = "gif"; break;
        case "voice": attachmentType = "voice"; break;
        case "file":  attachmentType = "file"; break;
        default: attachmentType = null;
      }
    }
    var thumbUrl = null;
    if (first && (attachmentType === "image" || attachmentType === "video" || attachmentType === "gif")) {
      // The conversation-list endpoint returns slim attachments (`type` only,
      // no url) alongside a parallel singular `attachment_url` field — same
      // legacy pattern handled in sidebar-chat.js. Try the array entry first,
      // fall back to message.attachment_url.
      var rawThumb = first.thumbnail_url
        || first.thumbnailUrl
        || first.url
        || (message && message.attachment_url)
        || null;
      if (rawThumb && /^https?:\/\//i.test(rawThumb)) { thumbUrl = rawThumb; }
    }

    // Body text rule: empty body + attachment → label-only ("Photo" / "Video" / "Voice message" / filename).
    var trimmed = (bodyAfterForward || "").trim();
    var text = trimmed;
    if (!trimmed && attachmentType) {
      switch (attachmentType) {
        case "image": text = "Photo"; break;
        case "video": text = "Video"; break;
        case "gif":   text = "GIF"; break;
        case "voice": text = "Voice message"; break;
        case "file":  text = (first && first.filename) ? first.filename : "File"; break;
      }
    } else if (!attachmentType && trimmed) {
      // Slim-payload fallback: derive attachmentType from a legacy emoji prefix
      // when no structured attachment is attached.
      var legacy = matchLegacyEmojiLabel(trimmed);
      if (legacy) {
        attachmentType = legacy.type;
        text = legacy.label;
      }
    }

    if (forwardedFromOriginalAuthor) {
      text = "↪ @" + forwardedFromOriginalAuthor + ": " + text;
    }
    if (opts.isGroup && opts.senderLogin) {
      text = opts.senderLogin + ": " + text;
    }

    return {
      text: text,
      attachmentType: attachmentType,
      thumbUrl: thumbUrl,
      forwardedFromOriginalAuthor: forwardedFromOriginalAuthor,
    };
  }

  root.gsMessagePreview = gsMessagePreview;
})(typeof window !== "undefined" ? window : globalThis);
