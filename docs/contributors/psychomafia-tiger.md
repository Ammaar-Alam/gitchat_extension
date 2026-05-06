# psychomafia-tiger

## Current
- **Role:** Growth
- **Branch:** psychomafia-tiger-readme-topics-ios
- **Working on:** Refresh README — replace Friends card with Topics, add App Store badge + install link for the iPhone/Mac native app, mark Repo community channels as live in the comparison table, refresh Roadmap (promote Communities / Wave / Team Channels to Live, add Topics as a Live row), drop the obsolete hero-demo.gif TODO.
- **Blockers:** None
- **Last updated:** 2026-05-06

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
