# GitHub Copilot — expect-webdriverio

Follow [AGENTS.md](../../AGENTS.md). That file is the canonical agent guide.
Do not add policy here.

- Package manager: **pnpm** (the `packageManager` version). Node: `.nvmrc`.
- Compile before the playgrounds: `pnpm run compile`. Unit tests do not need it.
- Smallest tests: `pnpm exec vitest --run --coverage.enabled=false <file>`.
- Do not hand-edit `lib/`, `coverage/`, or snapshot files.
