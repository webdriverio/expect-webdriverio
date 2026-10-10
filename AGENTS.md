# AGENTS.md

This is the agent entry point for expect-webdriverio, the assertion library of
WebdriverIO. Humans should start with [README.md](README.md). Agents should
read this file first.

Do not copy policy into tool-specific files. Cursor, Claude Code, Copilot, and
Codex should follow this document. Tool adapters stay thin and point here.

## Repo map

Single npm package. Source lives in `src/`. The package and the playgrounds
consume the compiled `lib/`.

```
src/matchers/browser     browser matchers (toHaveUrl, toHaveTitle, ...)
src/matchers/element     element matchers, for $() and $$()
src/matchers/elements    toBeElementsArrayOfSize
src/matchers/mock        network matchers (toBeRequested, ...)
src/matchers/asymmetrics expect.multiRemote(), oneOf
src/matchers/modifiers   some
src/matchers/snapshot.ts toMatchSnapshot, toMatchInlineSnapshot
src/matchers.ts          the list of registered matchers
src/matchers/descriptors.ts    the matchers made from a WebdriverIO getter, as data (the string and boolean getters)
src/matchers/getterMatcher.ts  the factories that make these matchers from their descriptors
src/util/                wait strategy, element and multi-remote helpers, failure messages
src/utils.ts             the public `utils` export, which imports src/util/: modules of src/util/ must not import it
                         (oxlint `import/no-cycle` fails on a circular import)
src/softExpect.ts        soft assertions (and softAssert*.ts)
src/publicTypes/         public types and the global `ExpectWebdriverIO` namespace; `tsc` emits them to lib/**/*.d.ts
types/expect-global.d.ts the global `expect` (hand-written)
jest.d.ts, jasmine*.d.ts framework augmentations of the public types
test/                    Vitest unit tests, mirror src/ (browser mocked in test/__mocks__)
test-types/              type tests, one project per framework augmentation; declarations/ and package/ check the published files;
                         wdio-testrunner/ checks the global and the exported `expect` with the WebdriverIO testrunner types
playgrounds/             real-browser WebdriverIO projects (a pnpm workspace)
docs/                    user docs, also published on webdriver.io
```

## Setup

Use the Node version in [`.nvmrc`](.nvmrc) and pnpm: the `packageManager`
version of `package.json`, which Corepack or pnpm 9.7+ selects. Do not switch
the package manager.

```sh
pnpm install
pnpm run build          # clean + compile src/ to lib/
```

Edits to `src/` are invisible to the playgrounds until you compile again
(`pnpm run compile`, or `pnpm run watch`). Unit tests run from `src/` and do not
need a build.

pnpm passes `--` to the script, so do not write it: `pnpm run test --spec x`,
not `pnpm run test -- --spec x`.

## Do not hand-edit

| Path | Owner |
|------|-------|
| `lib/` | `pnpm run compile` |
| `coverage/`, `types/coverage/` | Vitest coverage |
| `**/__snapshots__/*.snap`, `test/*.snap` | the test run (`--updateSnapshots`), then review the diff |
| `test/characterization/__golden__/` | the test run (`--updateSnapshots`). A diff is a change of behavior of the getter matchers: a refactor must keep these files the same |
| `pnpm-lock.yaml`, `playgrounds/pnpm-lock.yaml` | pnpm |

## Test selection

Prefer the smallest proof that covers the touched contract. Do not start with
`pnpm test` or `pnpm run checks:all`: they run lint, tsc, all unit tests and all
type tests.

Coverage is on by default, with global thresholds. When you run one file, add
`--coverage.enabled=false`, or the thresholds report errors.

| Change | Minimum local proof |
|--------|---------------------|
| One matcher or util | its test file: `pnpm exec vitest --run --coverage.enabled=false <test file>` |
| A getter matcher (string or boolean), the strategy, `waitUntil` or the messages | also the golden master: `pnpm exec vitest --run --coverage.enabled=false test/characterization/` |
| Public types (`src/publicTypes/`, `src/api/`, `types/`, `jest.d.ts`, `jasmine*.d.ts`) | `pnpm run build && pnpm run test:types` (`ts:package` installs the packed build) |
| Failure messages | the unit tests that assert the message, and one playground run |
| Multi-remote | the unit tests, and `pnpm run test:multi-remote` in `playgrounds/mocha` |
| Snapshot matchers | `test/snapshot.test.ts`, and the Mocha, Jasmine and Browser Runner playgrounds |
| Docs only (`docs/`, `README.md`) | the multi-remote naming check, and check the links |
| Before you push | `pnpm run checks:all` |

Unit tests mostly mirror source: `src/matchers/element/toHaveText.ts` →
`test/matchers/element/toHaveText.test.ts`. Exceptions: most `toBe*` element
matchers are in `test/matchers/beMatchers.test.ts`, and `toHaveUrl` /
`toHaveTitle` in `test/matchers/browserMatchers.test.ts`. To find the tests of
a matcher: `git grep -l <matcherName> -- test`. Use the mocks in
`test/__mocks__/`; do not start a browser in unit tests.

The multi-remote mocks model WebdriverIO v10: `$$()` returns a
`MultiRemoteElementArray`, and instances are only reachable with
`getInstance()`.

The unit tests are the regression check. They are not proof that a change
works the way a user runs it. Before you report a feature or bug fix as done,
follow [verify-expect-webdriverio](.agents/skills/verify-expect-webdriverio/SKILL.md).

## Multi-remote naming

- `multi-remote` in English text, never `multiremote`.
- `Multi-remote` at the start of a sentence, heading or title.
- `multiRemote` / `MultiRemote` in camelCase / PascalCase code, e.g. `multiRemoteBrowser`.
- Never write `multiremote` or `Multiremote` in new names.
- Exceptions: WebdriverIO v9 names that this repo cannot rename
  (`isMultiremote`, `multiremotebrowser`), and the `/docs/multiremote` links.

Must print nothing before committing:

```sh
git grep --untracked -nE "[Mm]ultiremote" -- ':!AGENTS.md' \
  | grep -vE "isMultiremote|multiremotebrowser|/docs/multiremote"
```

## Working agreement

- Inspect `git status -sb` before editing. Do not switch branches or rewrite
  history that another process is using.
- Keep PRs to one topic. Conventional Commits (`fix: ...`, `feat: ...`,
  `docs: ...`, `test: ...`).
- Keep all text concise and terse: docs, issues, commits, PRs, comments and
  replies. Remove each word that adds no fact. Say *why*, not *what*: the diff
  shows the what.
- PR body: 1–3 bullets and "How you tested". Do not list the changed files.
- Default to no code comment. Add one only for a constraint, a workaround, or
  a surprise.
- Smallest scope before a release: fix the regression only. Put other
  improvements in an issue.
- Stage only intended files. Do not commit `lib/`, `coverage/` or
  `node_modules`.
- A test must fail on the original defect before the fix. Do not hide flakes
  with retries, longer timeouts, or weaker assertions. Fix the cause.
- A change to a failure message needs the message before and after in the PR.
- Keep the docs in sync, in the same PR as the code. A change to a matcher, an
  option, a behavior (what passes or fails) or a failure message updates:
  - `docs/API.md`, and the guide of the area (see "Read when relevant");
  - the public types and their type tests;
  - `docs/Migrations.md`, in the section of the next major version, when the
    change can break a user's test or types.

  The WebdriverIO website copies `docs/` as is: no generated docs.
- Fill in "How you tested" in the PR template with the commands you ran.
- American English. Match the existing code style; do not reformat unrelated
  files.

## Read when relevant

Read the matching guide in full before editing that area.

- **Matchers and options:** [docs/API.md](docs/API.md)
- **Multi-remote:** [docs/MultiRemote.md](docs/MultiRemote.md)
- **`$$()` element arrays:** [docs/MultipleElements.md](docs/MultipleElements.md)
- **Framework integration (Jest, Jasmine, Mocha):** [docs/Framework.md](docs/Framework.md)
- **Public types:** [docs/Types.md](docs/Types.md)
- **Custom matchers:** [docs/CustomMatchers.md](docs/CustomMatchers.md)
- **Breaking changes:** [docs/Migrations.md](docs/Migrations.md)
- **Playgrounds:** [playgrounds/README.md](playgrounds/README.md)
- **Verify a change:** [.agents/skills/verify-expect-webdriverio/SKILL.md](.agents/skills/verify-expect-webdriverio/SKILL.md)
