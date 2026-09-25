# Multi-remote Support

With [multi-remote](https://webdriver.io/docs/multiremote), a single assertion checks every browser instance: the multi-remote browser (`multiRemoteBrowser`), its elements `$()` (`MultiRemoteElement`) and element arrays `$$()` (`MultiRemoteElement[]`).

```ts
import { multiRemoteBrowser } from '@wdio/globals'

await expect(multiRemoteBrowser).toHaveTitle('WebdriverIO')
await expect(multiRemoteBrowser.$('h1')).toHaveText('Welcome')
await expect(multiRemoteBrowser.$$('li')).toBeDisplayed()
```

**Note:** `multiremotebrowser` from `@wdio/globals` is deprecated in favor of `multiRemoteBrowser`.

## Instance Names

The instance names are the keys of the `capabilities` object of your [multi-remote configuration](https://webdriver.io/docs/multiremote). The examples below assume the following configuration, with the `chrome` and `firefox` instances:

```ts
export const config: WebdriverIO.MultiremoteConfig = {
    // ...
    capabilities: {
        chrome: {
            capabilities: { browserName: 'chrome' }
        },
        firefox: {
            capabilities: { browserName: 'firefox' }
        }
    },
}
```

## Requirements & Configuration

WebdriverIO `v9.31.5` or higher is required.

| Flag | Kind | Default | Details |
| ---- | ---- | ------- | ------- |
| `useToHaveTextStrictMultiElementsCompareStrategy` | expect-webdriverio [feature flag](API.md#feature-flags--environment-variables) | `false` | **Required** for `toHaveText` on multi-remote elements, see [Limitations](#limitations). |
| `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY` | WebdriverIO environment variable | unset | **Recommended.** `$$()` returns an array knowing how it was fetched (parent, selector, selected instances), so it is reliably re-fetched between retries, even when initially empty. Without it, see the [limitations](#without-wdio_enable_multi_remote_element_array). |
| `WDIO_ENABLE_MULTI_REMOTE_SELECT` | WebdriverIO environment variable | unset | **Recommended** when using `select()`: elements queried from a selected multi-remote browser or element stay scoped to the selected instances. It is read when the multi-remote browser is created, so set it before the session starts. |

```ts
// wdio.conf.ts
import { setFeatureFlags } from 'expect-webdriverio'

process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
process.env.WDIO_ENABLE_MULTI_REMOTE_SELECT = 'true'

export const config: WebdriverIO.MultiremoteConfig = {
    // ...
    before() {
        setFeatureFlags({ useToHaveTextStrictMultiElementsCompareStrategy: true })
    },
}
```

## Expected Values

Assertions are strict: every browser instance must pass.

- **A single expected value** applies to every instance (and to every element of every instance with `$$()`).
- **`.not`** is strict too: no instance may match, e.g. `.not.toHaveTitle('WebdriverIO')` fails if any browser has that title.
- **One expected value per instance** is passed with `expect.multiRemote()`, keyed by instance name, in any order. It must name **exactly** the instances: a missing, unknown or misspelled instance name fails the assertion, also with `.not`, without retrying.
- Matcher options (e.g. `ignoreCase`, `containing`) apply to every instance, including `expect.oneOf()` nested in per-instance values.

```ts
// Same title on every browser
await expect(multiRemoteBrowser).toHaveTitle('WebdriverIO')

// One title per browser
await expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({ chrome: 'WebdriverIO', firefox: expect.stringContaining('WebdriverIO') }))

// ❌ Fails: `firefox` is missing
await expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({ chrome: 'WebdriverIO' }))

// To assert only some instances, select them
await expect(multiRemoteBrowser.select('chrome')).toHaveTitle('WebdriverIO')
```

`expect.multiRemote()` is also exported as `multiRemote` from `expect-webdriverio/api`, e.g. for the Browser Runner where `expect.*` helpers are not available.

**Note:** There is no default value for the instances not listed, and an array of expected values is not one value per instance in configuration order: use `expect.multiRemote()` instead.

### Plain Object Shorthand

Except for the matchers below, a plain object is a shorthand for `expect.multiRemote()`, since it can't be a valid expected value:

```ts
await expect(multiRemoteBrowser).toHaveTitle({ chrome: 'WebdriverIO', firefox: 'WebdriverIO' })
await expect(multiRemoteBrowser.$('h1')).toHaveWidth({ chrome: 100, firefox: { gte: 90 } })
```

`toHaveStyle`, `toHaveSize` and `toHaveElementProperty` accept an object as expected value (e.g. `{ color: 'red' }`): for them, a plain object is always that value, and per-instance values require `expect.multiRemote()`.

```ts
await expect(multiRemoteBrowser.$('h1')).toHaveStyle({ color: 'red' }) // same style on every browser
await expect(multiRemoteBrowser.$('h1')).toHaveStyle(expect.multiRemote({ chrome: { color: 'red' }, firefox: { color: 'blue' } }))
```

Per-instance values are only allowed on multi-remote subjects: on a regular element they fail the assertion (and are rejected by TypeScript).

## Browser Matchers

`toHaveUrl`, `toHaveTitle`, `toHaveClipboardText` and `toHaveLocalStorageItem` support the multi-remote browser, including a `select()` subset.

```ts
await expect(multiRemoteBrowser).toHaveUrl('https://webdriver.io/')
await expect(multiRemoteBrowser.select('firefox')).toHaveTitle('WebdriverIO')
await expect(multiRemoteBrowser).toHaveLocalStorageItem('token', expect.multiRemote({ chrome: 'abc', firefox: 'def' }))
```

An array expected value is not supported: use `expect.oneOf()` instead.

## Element Matchers

### Single Element `$()`

Each instance's element is compared against its expected value.

```ts
const title = multiRemoteBrowser.$('h1')

await expect(title).toBeDisplayed()
await expect(title).toHaveText(expect.multiRemote({ chrome: 'Welcome', firefox: 'Bienvenue' }))
await expect(title).toHaveWidth(expect.multiRemote({ chrome: 100, firefox: { gte: 90 } }))
```

An array expected value is only supported by the matchers accepting one for a single element (e.g. `toHaveElementClass(['btn', 'btn-large'])`); otherwise it fails the assertion.

### Multiple Elements `$$()`

Every instance is compared on **its own** elements: browsers may find a different number of elements. The [multiple elements](MultipleElements.md) rules apply per instance:

- A single expected value: every element of every instance must match it.
- An array of expected values: index-based, per instance. Its length must equal the element count of each instance.
- Per-instance values, each being a single value or an index-based array.
- `.not`: every element of every instance must **not** match.
- `some()`: at least one element must match in **every** instance.
- `expect.arrayContaining()`: each instance's collection of values must satisfy it.
- An instance without any element fails the assertion. When no instance has any element, the regular empty rules apply (e.g. `.not.toExist()` passes).

```ts
import { some } from 'expect-webdriverio/api'

const items = multiRemoteBrowser.$$('li')

await expect(items).toHaveText('Item') // every element of every browser
await expect(items).toHaveText(['Coffee', 'Tea']) // index-based, on every browser
await expect(items).toHaveText(expect.multiRemote({ chrome: ['Coffee', 'Tea'], firefox: ['Coffee', 'Tea', 'Milk'] }))
await expect(some(items)).toHaveText('Tea') // at least one match in every browser
await expect(items).toHaveText(expect.arrayContaining(['Tea'])) // in every browser's collection
```

`toBeElementsArrayOfSize` counts the elements per instance, against a single size shared by every instance or one size per instance:

```ts
await expect(items).toBeElementsArrayOfSize(3)
await expect(items).toBeElementsArrayOfSize(expect.multiRemote({ chrome: 3, firefox: { gte: 2 } }))
```

## Retries & Re-fetching Elements

As with regular elements, failing assertions are retried until they pass or time out, re-fetching `$$()` elements in between.

- **With `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY=true`** (recommended), elements are re-fetched from their real scope (parent element, `select()` subset) with their original selector, even when the first result is empty.
- **Without it**, re-fetching is best effort, see below.

## Without `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY`

Both `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY` and `WDIO_ENABLE_MULTI_REMOTE_SELECT` are opt-in WebdriverIO environment variables, not enabled by default. Without the former, `$$()` returns a plain `MultiRemoteElement[]` that knows nothing about how it was fetched: no parent element, no `select()` subset, and, when empty, not even its selector or instance names. Multi-remote `$$()` assertions are then **best effort**:

- **Re-fetching uses the global `multiRemoteBrowser`** with the elements' selector, ignoring any parent element or `select()` subset, and a one-time warning is logged. A retry may therefore assert on elements outside the original scope, e.g. `multiRemoteBrowser.select('firefox').$$('li')` is re-fetched on every instance, and `multiRemoteBrowser.$('form').$$('input')` from the whole page.
- **Without injected WebdriverIO globals** (e.g. `injectGlobals: false` or standalone mode), elements are not re-fetched: every retry compares the same elements.
- **An initially empty result cannot be re-fetched**, having no element to get the selector from: the assertion fails immediately instead of waiting for elements to appear, and the failure message shows `[]` instead of the selector.
- **`toBeElementsArrayOfSize` with per-instance sizes on an empty result** cannot know the queried instances:
  - They are taken from the global `multiRemoteBrowser`, ignoring any `select()` subset, so `expect(multiRemoteBrowser.select('firefox').$$('li')).toBeElementsArrayOfSize({ firefox: 0 })` fails since every instance is expected.
  - Without injected globals, per-instance sizes are only checked against their own instance names, so a missing or misspelled instance name is not detected.
  - A single size shared by every instance, e.g. `toBeElementsArrayOfSize(0)`, is not affected.

Browser matchers, single elements `$()`, and `$$()` assertions passing on the first attempt are not affected.

## Error Messages

Failure messages show the actual and expected values per instance:

```
Expect multi-remote<chrome, firefox>.$(`h1`) to have text

- Expected  - 1
+ Received  + 1

  Object {
    "chrome": "Welcome",
-   "firefox": "Welcome",
+   "firefox": "Error",
  }
```

## Limitations

- `toHaveText` requires the `useToHaveTextStrictMultiElementsCompareStrategy` feature flag: its legacy strategy does not support multi-remote elements and fails the assertion.
- Network (mock) and snapshot matchers are not multi-remote aware.
- Without `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY`, multi-remote `$$()` assertions are best effort, see [its limitations](#without-wdio_enable_multi_remote_element_array).

## Alternatives

Since multi-remote instances are standard browsers, you can also assert on each instance separately.

### Parameterized Tests

Using the parameterized feature of your test framework, iterate over the multi-remote instances. Mocha example:

```ts
describe('Multi-remote test', () => {
    multiRemoteBrowser.instances.forEach((instance) => {
        it(`should have title "My Site Title" on ${instance}`, async () => {
            const browser = multiRemoteBrowser.getInstance(instance)
            await browser.url('https://mysite.com')

            await expect(browser).toHaveTitle('My Site Title')
        })
    })
})
```

### Direct Instance Access (TypeScript)

By [extending the WebdriverIO namespace](https://webdriver.io/docs/multiremote/#extending-typescript-types), you can directly access each instance and use `expect` on it:

```ts
// type.d.ts, included in your tsconfig.json
declare namespace WebdriverIO {
    interface MultiRemoteBrowser {
        chrome: WebdriverIO.Browser
        firefox: WebdriverIO.Browser
    }
}
```

```ts
await expect(multiRemoteBrowser.chrome).toHaveTitle('My Chrome Site Title')
await expect(multiRemoteBrowser.firefox).toHaveTitle('My Firefox Site Title')
```
