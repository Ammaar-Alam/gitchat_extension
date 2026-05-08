# psychomafia-tiger

## Current
- **Role:** Growth
- **Branch:** psychomafia-tiger-readme-faq-e2ee
- **Working on:** Add a "How are messages encrypted?" FAQ entry to README — discloses HTTPS in transit, server-relayed model similar to Slack/Discord/Telegram cloud chats, not end-to-end encrypted. Phrasing matches industry disclosure conventions.
- **Blockers:** None
- **Last updated:** 2026-05-07

## Decisions
- 2026-04-13: Publish GitChat as new extension (name=gitchat, publisher=Gitchat), accept losing old installs
- 2026-04-13: Rename all command/view/config prefixes from trending.* to gitchat.* in package.json + src/
- 2026-04-13: README restructured chat-first, live features separated from "What's Next" roadmap
- 2026-04-16: Created GitchatSH/brand-assets public repo to host images — private repo causes broken images on marketplace listings
- 2026-04-16: VS Code Marketplace publisher is `GitchatSH` (not `Gitchat` as in package.json) — README links use `GitchatSH.gitchat`; Open VSX keeps `Gitchat/gitchat`
- 2026-04-16: Bumped package.json version 1.0.4 → 1.1.0 to match already-published Marketplace/OpenVSX release (someone published without bumping repo)
- 2026-04-28: Added Star History chart to README (star-history.com) — surfaces community traction directly on the marketplace/Open VSX/GitHub listings, encourages new visitors to star the repo
- 2026-04-28: Added OUTREACH-POLICY.md at repo root — public accountability doc for cold-email outreach, written in response to issues #198/#202. Placed at root (not .github/ or docs/) for top-level visibility alongside LICENSE/CHANGELOG.
- 2026-05-06: README refresh — Topics card replaces Friends in the feature grid (new shipped feature), added App Store badge + install link for the iPhone/Mac native app (`apps.apple.com/app/gitchat/id6762181976`), comparison table marks Repo community channels as Yes, Roadmap promotes Communities / Wave / Team Channels from Soon to Live and adds Topics as a Live row, removed the obsolete hero-demo.gif TODO comment. New screenshot `feature-topics.png` (405x1016) committed to GitchatSH/brand-assets.
- 2026-05-07: Added "How are messages encrypted?" FAQ entry to README — discloses HTTPS in transit, server-relayed model, not E2EE. Triggered by a Reddit comment on r/coolgithubprojects asking about E2E status. Phrasing avoids "backend can read content" (over-disclosure) and avoids roadmap commitment, matching how Telegram/Slack/Discord disclose on their public docs.
