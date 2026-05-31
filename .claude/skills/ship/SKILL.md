---
name: ship
description: Commit the current work and open a pull request following this project's git workflow (branch off main, conventional commit, push, open PR). Use when the user says to ship, commit + PR, "open a PR", or push the current changes for review.
---

# Ship: branch → commit → push → PR

This project's rules (from CLAUDE.md): **never commit directly to `main`**; all work goes on
`feature/<name>` or `fix/<name>` branches; commits use a conventional prefix
(`feat:`, `fix:`, `chore:`, `style:`); Vercel auto-deploys on push to `main`, so PRs are the
gate. Only run this when the user has asked to commit/push/PR.

## Steps

1. **Review what's changing** — `git status` and `git diff` (read-only, pre-allowed). Confirm
   the diff is what the user expects; don't sweep in unrelated files.

2. **Branch.** If currently on `main`, create a topic branch before committing. Pick `feature/`
   for new work, `fix/` for bug fixes; derive a short kebab-case name from the change:
   ```powershell
   git checkout -b feature/<short-name>
   ```
   If already on a non-main branch, stay on it.

3. **Stage + commit** with a conventional message. End the message with the attribution trailer:
   ```powershell
   git add -A
   git commit -m @'
   feat: <concise summary>

   <optional body>

   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   '@
   ```
   (Use a single-quoted here-string; the closing `'@` must be at column 0.)

4. **Push.** This environment's proxy injects a self-signed cert, so a normal push to GitHub
   fails with `SSL certificate problem`. Push with verification disabled **for this command only**:
   ```powershell
   git -c http.sslVerify=false push -u origin HEAD
   ```

5. **Open the PR** via the GitHub CLI:
   ```powershell
   gh pr create --base main --head (git rev-parse --abbrev-ref HEAD) --title "<title>" --body @'
   <what changed and why>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   '@
   ```
   If `gh` fails on the same SSL issue, fall back to printing the compare URL for the user to open:
   `https://github.com/yonidev0101/yonidev/compare/main...<branch>?expand=1`

6. Report the branch name and PR URL (or the compare URL fallback).

## Guardrails
- Never push to `main` directly. If asked to, push the branch and open a PR instead.
- Confirm with the user before pushing if the diff includes secrets, `.env*`, or large unrelated changes.
- `npm run build` is blocked here (it kills the dev server). Verify with `npm run lint` / `npx tsc --noEmit` instead before shipping.
