# Multi-remote Support

With [multi-remote](https://webdriver.io/docs/multiremote), a single assertion checks every browser instance: the multi-remote browser (`multiRemoteBrowser`), its elements `$()` (`MultiRemoteElement`) and element arrays `$$()` (`MultiRemoteElementArray`).

```ts
import { multiRemoteBrowser } from '@wdio/globals'

await expect(multiRemoteBrowser).toHaveTitle('WebdriverIO')
await expect(multiRemoteBrowser.$('h1')).toHaveText('Welcome')
await expect(multiRemoteBrowser.$$('li')).toBeDisplayed()
```

## Instance Names

The instance names are the keys of the `capabilities` object of your [multi-remote configuration](https://webdriver.io/docs/multiremote). The examples below assume the following configuration, with the `chrome` and `firefox` instances:

```ts
export const config: WebdriverIO.MultiRemoteConfig = {
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

WebdriverIO `v10` or higher is required.

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

`expect.multiRemote()` is also exported as `multiRemote` from `expect-webdriverio/api`, e.g. when using another `expect` than the one from `expect-webdriverio`. With Jasmine, the global `expect` has `expect.multiRemote()` since `@wdio/jasmine-framework` 10.0.2.

**Note:** There is no default value for the instances not listed, and an array of expected values is not one value per instance in configuration order: use `expect.multiRemote()` instead.

### Plain Object Shorthand

Except for the matchers below, a plain object is a shorthand for `expect.multiRemote()`, since it can't be a valid expected value:

```ts
await expect(multiRemoteBrowser).toHaveTitle({ chrome: 'WebdriverIO', firefox: 'WebdriverIO' })
await expect(multiRemoteBrowser.$('h1')).toHaveText({ chrome: 'Welcome', firefox: 'Bienvenue' })
```

Number matchers (`toHaveWidth`, `toHaveHeight`, `toHaveChildren` and `toBeElementsArrayOfSize`) have no shorthand, since a plain object is a `NumberMatcher` (e.g. `{ gte: 1 }`): per-instance values require `expect.multiRemote()`.

```ts
await expect(multiRemoteBrowser.$('h1')).toHaveWidth(expect.multiRemote({ chrome: 100, firefox: { gte: 90 } }))
```

`toHaveStyle`, `toHaveSize` and `toHaveElementProperty` accept an object as expected value (e.g. `{ color: 'red' }`): for them, a plain object is always that value, and per-instance values require `expect.multiRemote()`.

```ts
await expect(multiRemoteBrowser.$('h1')).toHaveStyle({ color: 'red' }) // same style on every browser
await expect(multiRemoteBrowser.$('h1')).toHaveStyle(expect.multiRemote({ chrome: { color: 'red' }, firefox: { color: 'blue' } }))
```

Per-instance values are only allowed on multi-remote subjects: on a regular element they fail the assertion (and are rejected by TypeScript).

## Browser Matchers

`toHaveUrl`, `toHaveTitle`, `toHaveClipboardText`, `toHaveCookie`, `toHaveLocalStorageItem` and `toHaveSessionStorageItem` support the multi-remote browser, including a `select()` subset.

```ts
await expect(multiRemoteBrowser).toHaveUrl('https://webdriver.io/')
await expect(multiRemoteBrowser.select('firefox')).toHaveTitle('WebdriverIO')
await expect(multiRemoteBrowser).toHaveLocalStorageItem('token', expect.multiRemote({ chrome: 'abc', firefox: 'def' }))
```

An array expected value is not supported: use `expect.oneOf()` instead.

`toHaveWindowCount` counts the windows of each instance. Per-instance counts require `expect.multiRemote()`, because a plain object is a number range, e.g. `{ gte: 2 }`:

```ts
await expect(multiRemoteBrowser).toHaveWindowCount(expect.multiRemote({ chrome: 2, firefox: 1 }))
```

## Element Matchers

### Single Element `$()`

Each instance's element is compared against its expected value.

```ts
const title = multiRemoteBrowser.$('h1')

await expect(title).toBeDisplayed()
await expect(title).toHaveText(expect.multiRemote({ chrome: 'Welcome', firefox: 'Bienvenue' }))
await expect(title).toHaveAttribute('data-locale', expect.multiRemote({ chrome: 'en', firefox: 'fr' }))
await expect(title).toHaveWidth(expect.multiRemote({ chrome: 100, firefox: { gte: 90 } }))
```

An array expected value fails the assertion on a multi-remote `$()`, as on a single element of one browser: use `expect.oneOf()` for "one of these values".

### Multiple Elements `$$()`

Every instance is compared on **its own** elements: browsers may find a different number of elements. The [multiple elements](MultipleElements.md) rules apply per instance:

- A single expected value: every element of every instance must match it.
- An array of expected values: index-based, per instance. Its length must equal the element count of each instance.
- Per-instance values, each being a single value, an index-based array, or a list matcher for the collection of that instance.
- `.not`: every element of every instance must **not** match.
- `some()`: at least one element must match in **every** instance.
- `expect.arrayContaining()`, `expect.arrayOf()` and `jasmine.arrayWithExactContents()`: each instance's collection of values must satisfy it.
- An instance without any element fails the assertion. When no instance has any element, the regular empty rules apply (e.g. `.not.toExist()` passes).

```ts
import { some } from 'expect-webdriverio/api'

const items = multiRemoteBrowser.$$('li')

await expect(items).toHaveText('Item') // every element of every browser
await expect(items).toHaveText(['Coffee', 'Tea']) // index-based, on every browser
await expect(items).toHaveText(expect.multiRemote({ chrome: ['Coffee', 'Tea'], firefox: ['Coffee', 'Tea', 'Milk'] }))
await expect(some(items)).toHaveText('Tea') // at least one match in every browser
await expect(items).toHaveText(expect.arrayContaining(['Tea'])) // in every browser's collection
await expect(items).toHaveText(expect.multiRemote({ chrome: expect.arrayContaining(['Tea']), firefox: expect.arrayContaining(['Thé']) })) // one list matcher per browser
```

`toBeElementsArrayOfSize` counts the elements per instance, against a single size shared by every instance or one size per instance:

```ts
await expect(items).toBeElementsArrayOfSize(3)
await expect(items).toBeElementsArrayOfSize(expect.multiRemote({ chrome: 3, firefox: { gte: 2 } }))
```

## Network Matchers

`toBeRequested`, `toBeRequestedTimes` and `toBeRequestedWith` support the mocks of a multi-remote `mock()`, one per instance: every instance's mock must satisfy the assertion, and with `.not`, none may.

```ts
const mocks = await multiRemoteBrowser.mock('**/api/users')
await multiRemoteBrowser.url('https://webdriver.io')

await expect(mocks).toBeRequested()
await expect(mocks).toBeRequestedTimes({ gte: 1 })
await expect(mocks).toBeRequestedWith({ method: 'GET', statusCode: 200 })
```

For one expected value per instance, use `expect.multiRemote()`. A plain object is not per-instance values: for `toBeRequestedTimes` it is a `NumberMatcher`, and for `toBeRequestedWith` it is the expected request.

```ts
await expect(mocks).toBeRequestedTimes(expect.multiRemote({ chrome: 2, firefox: { gte: 1 } }))
await expect(mocks).toBeRequestedWith(expect.multiRemote({
    chrome: { method: 'GET' },
    firefox: { method: 'POST', postData: { name: 'foo' } },
}))
```

As for the other matchers, the values must name exactly the instances of the `MultiRemoteMock`, else the assertion fails at once, without retry, also with `.not`. A single mock with `expect.multiRemote()` fails too.

`mock()` gives a `MultiRemoteMock`, which knows the instance of each mock. Failure messages name each mock after its instance, also after `select()`. An array of mocks is rejected.

## Snapshot Matchers

`toMatchSnapshot` and `toMatchInlineSnapshot` support multi-remote elements, `$()` and `$$()`, taking their outerHTML on every instance:

- When every instance has the same outerHTML, the snapshot is that outerHTML, as for a single element (an array of outerHTML for `$$()`, as for regular elements).
- Otherwise, the snapshot holds the outerHTML of each instance, keyed by instance name (sorted, whatever their order in the configuration).

```ts
// The same on every browser
await expect(multiRemoteBrowser.$('h1')).toMatchInlineSnapshot(`"<h1>Welcome</h1>"`)

// Different per browser
await expect(multiRemoteBrowser.$('h1')).toMatchInlineSnapshot(`
  {
    "chrome": "<h1>Welcome</h1>",
    "firefox": "<h1>Bienvenue</h1>",
  }
`)

// With $$(), the same on every browser
await expect(multiRemoteBrowser.$$('li')).toMatchInlineSnapshot(`
  [
    "<li>Coffee</li>",
    "<li>Tea</li>",
  ]
`)

// With $$(), different per browser
await expect(multiRemoteBrowser.$$('li')).toMatchInlineSnapshot(`
  {
    "chrome": [
      "<li>Coffee</li>",
      "<li>Tea</li>",
    ],
    "firefox": [
      "<li>Café</li>",
    ],
  }
`)
```

So a snapshot turns into one outerHTML per instance when browsers start to differ, which the snapshot diff shows, and needs an update when they are the same again. With `select()`, only the selected instances are part of the snapshot.

## Retries & Re-fetching Elements

As with regular elements, failing assertions are retried until they pass or time out, re-fetching `$$()` elements in between.

Elements are re-fetched from their real scope (parent element, `select()` subset) with their original selector, even when the first result is empty.

## Error Messages

Failure messages show the actual and expected values per instance:

```
Expect multi-remote<chrome, firefox>.$(`h1`) to have text

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "Welcome",
-   "firefox": "Welcome",
+   "firefox": "Error",
  }
```

## Limitations

- A plain `MultiRemoteElement[]` is not supported: it is not recognized as elements, so the assertion fails. Pass the `MultiRemoteElementArray` of `$$()`, `custom$$()` or `react$$()`. You get a plain `MultiRemoteElement[]` from `[...elements]`, `Array.from(elements)` or `elements.concat()` on a `MultiRemoteElementArray`.

  If you need to assert on a `MultiRemoteElement[]`, [open an issue](https://github.com/webdriverio/expect-webdriverio/issues/new) with your use case.
- The Browser Runner (`@wdio/browser-runner`) does not support multi-remote, see [Browser Runner](Framework.md#multiple-elements--multi-remote).

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
