# Multi-remote Support

With [multi-remote](https://webdriver.io/docs/multiremote), a single assertion checks every browser instance of the multi-remote browser (`multiRemoteBrowser`).

```ts
import { multiRemoteBrowser } from '@wdio/globals'

await expect(multiRemoteBrowser).toHaveTitle('WebdriverIO')
```

**Note:** Only browser matchers support multi-remote for now. Element matchers on multi-remote elements (`$()` and `$$()`) are not yet supported.

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

## Requirements

WebdriverIO `v9.31.5` or higher is required.

## Expected Values

Assertions are strict: every browser instance must pass.

- **A single expected value** applies to every instance.
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

A plain object is a shorthand for `expect.multiRemote()`, since it can't be a valid expected value of a browser matcher:

```ts
await expect(multiRemoteBrowser).toHaveTitle({ chrome: 'WebdriverIO', firefox: 'WebdriverIO' })
```

Per-instance values are only allowed on the multi-remote browser: on a regular browser they fail the assertion (and are rejected by TypeScript).

## Browser Matchers

`toHaveUrl`, `toHaveTitle`, `toHaveClipboardText` and `toHaveLocalStorageItem` support the multi-remote browser, including a `select()` subset.

```ts
await expect(multiRemoteBrowser).toHaveUrl('https://webdriver.io/')
await expect(multiRemoteBrowser.select('firefox')).toHaveTitle('WebdriverIO')
await expect(multiRemoteBrowser).toHaveLocalStorageItem('token', expect.multiRemote({ chrome: 'abc', firefox: 'def' }))
```

An array expected value is not supported: use `expect.oneOf()` instead.

## Error Messages

Failure messages show the actual and expected values per instance:

```
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 1

  Object {
    "chrome": "WebdriverIO",
-   "firefox": "WebdriverIO",
+   "firefox": "Error",
  }
```

## Limitations

- Element matchers on multi-remote elements are not yet supported.
- Network (mock) and snapshot matchers are not multi-remote aware.

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
