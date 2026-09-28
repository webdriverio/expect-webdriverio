---
name: verify-expect-webdriverio
description: >-
  Prove an expect-webdriverio change by running it the way a user runs it: a
  playground project (WebdriverIO testrunner and a real headless Chrome), or the
  type tests for public types. Use after a feature or bug fix, before claiming
  the work works, and when verifying matcher behavior, failure messages,
  multi-remote, snapshots, or framework integration. A unit test is not this proof.
---

# Verify expect-webdriverio

A user runs `expect()` in a WebdriverIO spec, with Mocha, Jasmine, Jest or the
Browser Runner. Prove the change by running that same path in a playground.

A unit test does not prove the feature: its browser and elements are mocks.
Do not run `pnpm test`, `pnpm run checks:all`, or `pnpm run playgrounds:checks:all`
as the proof.

## Pick the harness

| The change affects | Run | Not the proof |
|--------------------|-----|---------------|
| A matcher, its options, or its failure message | `mocha` (Jasmine or Jest if the change is framework specific) | A unit test |
| Multi-remote browsers, `$()` or `$$()` | `multi-remote-mocha` | The `mocha` playground |
| Snapshot matchers | `mocha`, `jasmine` and `browser-runner` | One framework only |
| Browser Runner (matcher code in the browser) | `browser-runner` | A local runner playground |
| Framework augmentations (`jest.d.ts`, `jasmine*.d.ts`) | `pnpm run test:types`, then that framework's playground `pnpm run typecheck` | A runtime run |
| Public types in `types/` | `pnpm run test:types` | A runtime run |

If the change is visible in a failure message, add or change a playground spec
that fails on purpose only when you run it by hand, and record the message.
Do not commit a failing spec.

## Launch

The playgrounds use the compiled `lib/` through a symlink. Set them up once:

```sh
pnpm run playgrounds:setup
```

After each change to `src/`, compile again. You do not need to set up again:

```sh
pnpm run compile
```

## Drive

From `playgrounds/`, one workspace package at a time:

```sh
cd playgrounds
pnpm --filter ./mocha test
pnpm --filter ./multi-remote-mocha test
pnpm --filter ./jasmine test
pnpm --filter ./jest test
pnpm --filter ./browser-runner test
```

To run one spec: `pnpm --filter ./mocha test --spec test/specs/basic-matchers.test.ts` (no `--`: pnpm passes it to `wdio`).

`multi-remote-mocha` sets `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY=true` in its
`wdio.conf.ts`. The unit tests cover the flag off (see [AGENTS.md](../../../AGENTS.md)).

Visual snapshots can fail when the test website changes. Update them only when
the change is about snapshots, with `pnpm run snapshots:update` (in `playgrounds/`), and
review the diff.

Exit code 0 is required. It is not sufficient. The spec reporter must show the
specs that exercise the change as passed.

## Evidence

Put the proof in the PR, under "How you tested":

- the exact command
- the spec reporter lines of the specs that exercise the change, and the exit code
- for a failure message change: the message before and after

You can keep the full output in `.agents/verify-artifacts/<topic>/`. That
directory is gitignored.

## Cleanup

A playground run exits on its own. If you started it in the background, kill
that PID only. Do not `pkill`, `killall node`, or `killall chrome`.

Run one playground at a time. Do not attach to a Chrome the user already has
open.
