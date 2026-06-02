// media/webview/emojiShortcodes.js
// Tiny vanilla helper shared by chat input surfaces.
(function (root) {
  'use strict';

  var DISCORD_SHORTCODES = {
    '+1': '👍',
    '-1': '👎',
    '100': '💯',
    angry: '😡',
    beer: '🍺',
    blue_heart: '💙',
    bomb: '💣',
    bulb: '💡',
    check: '✅',
    clap: '👏',
    coffee: '☕',
    cool: '😎',
    cry: '😭',
    eyes: '👀',
    facepalm: '🤦',
    fire: '🔥',
    grin: '😁',
    heart: '❤️',
    heart_eyes: '😍',
    hug: '🤗',
    joy: '😂',
    laughing: '😆',
    laugh: '😂',
    love: '😍',
    muscle: '💪',
    nerd: '🤓',
    ok: '👌',
    ok_hand: '👌',
    party: '🥳',
    pizza: '🍕',
    pray: '🙏',
    raised_hands: '🙌',
    rocket: '🚀',
    rofl: '🤣',
    skull: '💀',
    smile: '😊',
    smiley: '😃',
    sob: '😭',
    sparkles: '✨',
    star: '⭐',
    sunglasses: '😎',
    tada: '🎉',
    thinking: '🤔',
    thumbsdown: '👎',
    thumbsup: '👍',
    warning: '⚠️',
    wave: '👋',
    white_check_mark: '✅',
    wink: '😉',
    x: '❌',
  };

  var LEGACY_EMOTICONS = {
    ':)': '😊', ':-)': '😊', '=)': '😊',
    ':(': '😞', ':-(': '😞',
    ':D': '😄', ':-D': '😄',
    ':P': '😛', ':-P': '😛', ':p': '😛',
    ';)': '😉', ';-)': '😉',
    '<3': '❤️',
    ':o': '😮', ':O': '😮', ':-O': '😮',
    'B)': '😎', 'B-)': '😎',
    ':/': '😕', ':-/': '😕',
    ':*': '😘', ':-*': '😘',
    '>:(': '😠',
    ":'(": '😢',
  };

  var legacyPattern = null;

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceDiscordShortcodes(text) {
    return text.replace(/:([A-Za-z0-9_+-]+):/g, function (match, name) {
      return DISCORD_SHORTCODES[String(name).toLowerCase()] || match;
    });
  }

  function replaceLegacyEmoticons(text) {
    if (!legacyPattern) {
      var keys = Object.keys(LEGACY_EMOTICONS).sort(function (a, b) { return b.length - a.length; });
      legacyPattern = new RegExp('(^|\\s)(' + keys.map(escapeRegExp).join('|') + ')(?=\\s|$)', 'g');
    }
    return text.replace(legacyPattern, function (_match, prefix, code) {
      return prefix + (LEGACY_EMOTICONS[code] || code);
    });
  }

  function replaceEmojiShortcodes(text) {
    if (text == null || text === '') { return text || ''; }
    var value = String(text);
    return replaceLegacyEmoticons(replaceDiscordShortcodes(value));
  }

  root.GitChatEmojiShortcodes = {
    replaceEmojiShortcodes: replaceEmojiShortcodes,
    shortcodes: DISCORD_SHORTCODES,
  };
})(typeof window !== 'undefined' ? window : globalThis);
