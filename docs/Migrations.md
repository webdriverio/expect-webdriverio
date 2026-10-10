# Migration Guide: v7 to v8

## Node.js 22.19

v8.0.0 requires Node.js `22.19.0` or higher, the same as WebdriverIO v10. Node.js 20 is no longer supported.

## Peer dependencies

v8.0.0 requires WebdriverIO v10: `webdriverio` `10.0.0` or higher. For WebdriverIO v9.31.5 or higher, use expect-webdriverio v7.

The types need TypeScript `6.0.3` or higher, the same as WebdriverIO v10.

`@wdio/globals` and `@wdio/logger` are no longer peer dependencies: only `webdriverio` and `@wdio/types` are. You can remove them from your `package.json` if you do not use them yourself. `webdriverio` installs `@wdio/types`, so our types use the same copy as WebdriverIO. With Yarn Plug'n'Play, also add `@wdio/types` to your `package.json` (Yarn warns with `YN0002`). If you do not, the types of `SnapshotService` and `SoftAssertionService` become `any`. When `toHaveClipboardText` cannot set the clipboard permissions, its warning now goes to `console.warn`, not to the WebdriverIO logger.

## Strict `$()`

In WebdriverIO v10, `$()` rejects with a `StrictSelectorError` when the selector matches several elements. An assertion on that `$()` rejects with this error, not with a failed assertion, also with `.not`:

```ts
// The page has 2 `h1`
await expect($('h1')).toBeDisplayed()   // rejects: strict mode violation: `$("h1")` resolved to 2 elements, expected 1.

await expect($$('h1')).toBeDisplayed()  // every `h1`
await expect($('h1', { strict: false })).toBeDisplayed()  // the first `h1`
```

## Matcher names in `beforeAssertion` and `afterAssertion`

The `matcherName` given to the `beforeAssertion` and `afterAssertion` hooks is now the name of the matcher that you called. Before, some aliases sent the name of the matcher that they use:

| Matcher | Before | Now |
| ------- | ------ | --- |
| `toBeExisting`, `toBePresent` | `toExist` | its own name |
| `toHaveLink` | `toHaveHref` | `toHaveLink` |
| `toHaveValue` | `toHaveElementProperty` | `toHaveValue` |
| `toBeRequested` | `toBeRequestedTimes` | `toBeRequested` |

The `expectedValue` given to `afterAssertion` is now the value that you gave, the same as for `beforeAssertion`. Before, `toHaveText`, `toHaveComputedLabel`, `toHaveComputedRole` and `toHaveElementProperty` gave it after the string options changed it, e.g. `ignoringCaseOneOf<"a", "b">` for `expect.oneOf('a', 'b')` with `ignoreCase`.

The hooks also get no internal argument of the matcher anymore:

| Assertion | `expectedValue` before | Now |
| --------- | ---------------------- | --- |
| `toHaveValue('Hello')` | `['value', 'Hello']` | `'Hello'`, as `toHaveId('main')` gives `'main'` |
| `toHaveElementProperty('checked')` | `['checked', Anything]` | `['checked', undefined]`, as `toHaveAttribute('checked')` |
| `toHaveLocalStorageItem('key')` | `'key'` | `['key', undefined]`, as `toHaveAttribute('key')` |
| `toHaveLocalStorageItem('key', '')` | `'key'` | `['key', '']` |

## `toHaveText` on multiple elements

The strict strategy of the `useToHaveTextStrictMultiElementsCompareStrategy` feature flag is now the only one. The flag, `setFeatureFlags()`, the `featureFlags` option and the `ExpectWebdriverIO.FeatureFlags` type are removed. The internal `utils.compareTextWithArray()` and `utils.getFeatureFlagValue()` are also removed.

With `$$()`, an array of expected values is index-based: its length must equal the element count, and each element must match the value at its index, as with every other matcher. Before, each element could match any value of the array.

```diff
  // <li>Coffee</li><li>Tea</li>
  // Inverted order
- await expect($$('li')).toHaveText(['Tea', 'Coffee'])
  // Same order as the elements
+ await expect($$('li')).toHaveText(['Coffee', 'Tea'])
  // Each element has one of the texts; a text can be missing (as before)
+ await expect($$('li')).toHaveText(expect.oneOf('Tea', 'Coffee'))
  // Each text is on at least one element; elements with other texts are allowed
+ await expect($$('li')).toHaveText(expect.arrayContaining(['Tea', 'Coffee']))
```

See [Choosing the expected value](MultipleElements.md#choosing-the-expected-value) for the difference between the options.

`some()`, `expect.oneOf()` inside an expected array and multi-remote elements work without the flag. With `.not`, every element must not match.

An array of expected values on a single element fails the assertion with `toHaveText`, `toHaveHTML`, `toHaveComputedLabel` and `toHaveComputedRole`: use `expect.oneOf()`.

```diff
- await expect($('h1')).toHaveText(['Welcome', 'Bienvenue'])
+ await expect($('h1')).toHaveText(expect.oneOf('Welcome', 'Bienvenue'))
```

`expect.oneOf()` now trims the actual value by default (`trim: true`), as a single expected value does. Pass `{ trim: false }` to compare the text as is.

## `toHaveElementClass` compares each class

`toHaveElementClass` compares each class of the element, also with an asymmetric matcher. Before, an asymmetric matcher was compared with the full `class` attribute. To compare the full attribute, use `toHaveAttribute('class', ...)`. The classes are now split on ASCII whitespace (space, tab, new line, form feed and carriage return), as in HTML, and the string options (`ignoreCase`, `trim`, `containing`...) also apply to `expect.oneOf()`.

An array of expected values on a single element fails the assertion, as with the other matchers. Before, it meant "has any of these classes". On `$$()`, an array stays one expected value for each element.

```diff
  // <button class="btn active">
  // Has any of the classes
- await expect($('button')).toHaveElementClass(['btn', 'large'])
+ await expect($('button')).toHaveElementClass(expect.oneOf('btn', 'large'))
  // Has all the classes: 1 assertion for each class
+ await expect($('button')).toHaveElementClass('btn')
+ await expect($('button')).toHaveElementClass('active')
  // The full attribute
- await expect($('button')).toHaveElementClass(expect.stringContaining('btn act'))
+ await expect($('button')).toHaveAttribute('class', expect.stringContaining('btn act'))
```

## `toHaveStyle` trims the actual value only

As in the other string matchers, `trim` changes the actual CSS value only. Before, `toHaveStyle` also trimmed the expected value, so an expected value with spaces matched.

```ts
// CSS value: 'block'
await expect($('#elem')).toHaveStyle({ display: ' block ' }) // passed, now fails
await expect($('#elem')).toHaveStyle({ display: 'block' })   // passes
```

## One position string option

`containing`, `atStart`, `atEnd` and `atIndex` cannot be used together anymore: the matcher throws at once, also with `.not`, and so does `utils.compareText()`. Before, `containing` won and the others were ignored, with no message.

```diff
- await expect($('h1')).toHaveText('Web', { containing: true, atStart: true })
+ await expect($('h1')).toHaveText('Web', { atStart: true })
```

## `toHaveStyle` compares each value as `toHaveText`

- `replace` applies first, then `ignoreCase` and the position option (`containing`, `atStart`…). Before, `replace` was ignored with a position option, and applied after `ignoreCase`, so `replace: ['B', 'X']` did not change `block`.
- A CSS value without unit, which WebdriverIO gives as a number, is compared as its text. Before, `0` became `''`: `toHaveStyle({ opacity: '0' })` always failed, and `{ opacity: '' }` passed.
- A value can be a RegExp, an asymmetric matcher or `expect.oneOf()`.
- The failure message shows each CSS value as is, the value that the matcher compared, and the string options on each expected value: `+   "color": "  RED  ", (compared as "red")`. Before, with a position option or `replace`, it showed the changed value.

## Objects are compared with deep equality in `toHaveSize` and `toHaveElementProperty`

Both matchers now use the deep equality of the other matchers, the one of Jest's `toEqual` (see [Deep Equality](API.md#deep-equality)):

- `toHaveSize`: an asymmetric matcher works, e.g. `toHaveSize(expect.objectContaining({ width: 32 }))`. Before, `toHaveSize` used the `deep-eql` package, which does not know asymmetric matchers: the assertion always failed, and always passed with `.not`. `deep-eql` also counted a property that is `undefined`, which is now ignored, as in `toEqual`.
- `toHaveElementProperty` compares a property that is not a string with deep equality, e.g. `toHaveElementProperty('dataset', { id: '1' })`. Before, it used `===`, so an object never matched: the assertion always failed, and always passed with `.not`. As in `toEqual`, `NaN` now equals `NaN`, and `0` does not equal `-0` (with `===`, it did).
- `toHaveSize`: each field takes the values of `toHaveWidth`: a number, a `NumberMatcher` (`{ width: { gte: 30 }, height: 50 }`), `expect.oneOf()` with numbers, or an asymmetric matcher. Before, a field with a range never matched. An invalid field value (`{ width: {} }`, `gte` greater than `lte`, a string, `NaN`, a list matcher) throws, as in `toHaveWidth`. Before, the assertion failed, and passed with `.not`.
- `utils.compareObject()` uses the same deep equality.

`expect-webdriverio` does not depend on `deep-eql` anymore.

## Asymmetric matchers and `expect.oneOf()` in the number matchers

`toHaveWidth`, `toHaveHeight`, `toHaveChildren`, `toBeElementsArrayOfSize`, `toBeRequestedTimes` and each field of `toHaveSize` accept 2 more expected values. Before, the number matchers threw `Invalid NumberMatcher`, except `toHaveChildren`, which took them as no value (at least 1 child) with a deprecation warning. In a field of `toHaveSize`, these values failed the assertion, and passed with `.not`:

- `expect.oneOf()` with numbers, e.g. `toHaveWidth(expect.oneOf(100, 200))`;
- an asymmetric matcher, compared as in `toEqual`, e.g. `toHaveWidth(expect.closeTo(150.4, 0))` for a size that the browser rounds, `expect.not.closeTo()` or `expect.any(Number)`.

A list matcher (`expect.arrayContaining()`…) throws, also with `.not`, and `expect.multiRemote()` is only for the multi-remote elements and mocks. See [Number Matcher](API.md#number-matcher).

## List matchers on multiple elements

On `$$()`, `expect.arrayOf()` and Jasmine's `jasmine.arrayWithExactContents()` compare the values of all the elements at once, as `expect.arrayContaining()` does. Before, they were compared with the value of each element, so the assertion always failed, and with `.not`, it always passed.

`toHaveSize` now also compares the list of the sizes of `$$()` with a list matcher, as `toHaveText` compares the list of the texts: `toHaveSize(expect.arrayContaining([{ width: 100, height: 50 }]))`. Before, it compared each size with the list matcher, so the assertion always failed, and with `.not`, it always passed.

```ts
await expect($$('li')).toHaveText(expect.arrayOf(expect.stringMatching(/^(Tea|Coffee)$/)))
await expect($$('li')).toHaveText(jasmine.arrayWithExactContents(['Coffee', 'Tea']))
```

On a single element `$()`, a list matcher now throws an error, also with `.not`, in `toHaveHTML`, `toHaveAttribute` (also `toHaveId`, `toHaveHref` and `toHaveLink`), `toHaveElementClass`, `toHaveComputedLabel`, `toHaveComputedRole`, `toHaveValue` and `toHaveSize`, as in `toHaveText`. Before, the assertion always failed, and with `.not`, it always passed. `toHaveElementProperty` still compares it with the property of the element, which can be an array. Use `$$()` to compare the values of a list of elements.

```ts
await expect($('li')).not.toHaveHTML(expect.arrayContaining(['<li>Home</li>']))
// Error: toHaveHTML with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) requires an array of elements
```

`toHaveStyle` throws an error with a list matcher, also on `$$()` and with `.not`: it reads only the CSS properties that the expected value names, and a list matcher names none. Before, it read the keys of the list matcher as CSS properties (`$$typeof`, `sample`…), and the assertion always failed, and with `.not`, it always passed. Give one style, or an array with one style for each element of `$$()`.

With `some()`, a list matcher now throws an error, also with `.not` and in an array or in the values of `expect.multiRemote()`, in the same matchers and in `toHaveText` and `toHaveTagName`: `some()` checks each element alone, and the value of one element is not a list. Before, the assertion always failed, and with `.not`, it always passed. `toHaveElementProperty` still compares it with the property of each element. Remove `some()`: on `$$()`, `expect.arrayContaining()` already passes when one element has the value.

```ts
await expect(some($$('li'))).not.toHaveText(expect.arrayContaining(['Home']))
// Error: toHaveText with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) cannot be used with some(): …
await expect($$('li')).not.toHaveText(expect.arrayContaining(['Home']))
```

A list matcher as the expected value of one element now throws an error too, also with `.not`, in the same matchers: in an array of expected values, and in the values of `expect.multiRemote()` on a multi-remote `$()`. Before, it was compared with the value of one element, so the assertion always failed, and with `.not`, it always passed. `toHaveElementProperty` still compares it with the property of each element.

```ts
await expect($$('li')).not.toHaveText([expect.arrayContaining(['Home']), 'About'])
// Error: toHaveText with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) as the expected value of one element: …
```

On a multi-remote `$$()`, a list matcher in the values of `expect.multiRemote()` now compares the values of all the elements of that instance, as one list matcher for all the instances does. Before, it was compared with the value of each element, so the assertion always failed, and with `.not`, it always passed.

```ts
await expect(multiRemoteBrowser.$$('li')).toHaveText(expect.multiRemote({ chrome: expect.arrayContaining(['Home']), firefox: expect.arrayContaining(['Accueil']) }))
```

## Failure messages with string options

The failure messages of the string matchers changed, see [String Options](API.md#string-options):

- `Expected` names the string options that alter the actual value: in the label for one string value (`Expected (ignoringCase): "Foo"`), and on each value in a list or per-instance values (`ignoringCase<"Foo">`, `containingIgnoringCaseOneOf<"a", "b">`). The default `trim` is named (`trimmed`) only when the actual value had spaces at the start or the end. Before, only the position option of `expect.oneOf()` was named.
- `Received` shows the actual value as is, also in `toHaveAttribute` and `toHaveElementProperty`. Before, these 2 matchers showed it trimmed, lowercased or replaced.
- On `$$()` and multi-remote, an element or instance that passed, also only because of the string options, is a line with no change in the diff.
- When the string options changed the actual value, the message also shows the compared value: after `Received` for one value on one line, `Received: "  Hello World  " (compared as "hello world")`, and after each received value that failed in the diff of `$$()` and multi-remote, `+   "  Baz  ", (compared as "baz")`.
- With `.not` on `$$()`, the elements that matched are highlighted, as the matcher compared them. Before, the elements that matched only because of the string options were not highlighted.
- A Jasmine asymmetric matcher is printed as a matcher (`<jasmine.anything>`), not as a string (`"<jasmine.anything>"`).

If a test checks the exact failure message, update it.

## The expected value of an empty `$$()`

When `$$()` finds no element, the failure message shows the expected value in an array, as for a `$$()` with elements: a `$$()` expects a list of values. Before, only `toHaveText` did it; the other element matchers showed the value alone.

```diff
  Expect $$(`li`) to have HTML

- Expected: "Coffee"
+ Expected: ["Coffee"]
  Received: undefined
```

With a string option, each value names it, as for a `$$()` with elements. Before, the label named it, and `toHaveText` did not name it:

```diff
- Expected (ignoringCase): "Coffee"
- Received:                undefined
+ Expected: [ignoringCase<"Coffee">]
+ Received: undefined
```

## A missing attribute or property

When the attribute or the property does not exist, it never matches, also not a matcher that accepts no value, as a missing cookie or localStorage item: the assertion fails, and waits for the value. Before, a matcher that accepts no value matched it:

```js
// <a> with no `title` attribute
await expect($('a')).toHaveAttribute('title', expect.not.stringContaining('x'))  // passed before, fails now
await expect($('a')).not.toHaveAttribute('title', expect.stringContaining('x'))  // passes: no attribute, or a value without `x`
```

An expected `null` for one element still matches a missing value, e.g. `toHaveElementProperty('p', ['iphone', null])` on `$$()`. The failure message shows `no attribute` or `no property`, not `null`, also in `toHaveId`, `toHaveHref`, `toHaveLink`, `toHaveElementClass` and `toHaveValue`:

```diff
  Expect $(`a`) to have attribute title

  Expected: "Home"
- Received: null
+ Received: no attribute
```

## A missing localStorage item

When the item does not exist, the failure message of `toHaveLocalStorageItem` shows `Received: no item`, not `Received: null`. The result does not change: a missing item never matches, also not a matcher that accepts no value such as `expect.not.stringContaining()`.

## Other failure messages

- `toBeRequestedWith` shows the status code of each call, and the request and response headers by name, as the matcher compares them: `{ "Content-Type": "application/json" }`. Before, it did not show the status code, and it showed the headers as the browser gives them: `[{ name: "Content-Type", value: { type: "string", value: "application/json" } }]`.
- A multi-remote element list names the query that found it, e.g. ``Expect multi-remote<chrome, firefox>.custom$$(`button`) to have text``. Before, it was always `$$()`.
- A list found with `custom$$()` or `react$$()` shows the arguments of the query, e.g. ``Expect custom$$(`byTestId`, "menu-item") to have text``. Before, it showed ``custom$$(`byTestId, <props>`)``.

If a test checks the exact failure message, update it.

## Multi-remote `$$()` and `select()`

Multi-remote `$$()` and `select()` need WebdriverIO v10. Remove `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY` and `WDIO_ENABLE_MULTI_REMOTE_SELECT`: they are not supported anymore.

Pass the `$$()`, `custom$$()` or `react$$()` result as is. A plain `MultiRemoteElement[]` (e.g. `[...elements]`) is not recognized as elements, so the assertion fails. See the [limitations](MultiRemote.md#limitations).

Retries still re-fetch `$$()` elements from their scope. Only the best-effort re-fetch of a plain array from the global `multiRemoteBrowser`, and its warning, are removed.

The network matchers accept the `MultiRemoteMock` of a multi-remote `mock()`, not an array of mocks: an array throws `Expected a mock or a multi-remote mock, received an array`.

The types follow WebdriverIO v10: a multi-remote `$$()` is a `WebdriverIO.MultiRemoteElementArray`, and a multi-remote `mock()` is a `WebdriverIO.MultiRemoteMock`. The matchers do not accept a `MultiRemoteElement[]` or a `Mock[]` anymore, except the snapshot matchers. In a WebdriverIO config, use the v10 name `WebdriverIO.MultiRemoteConfig`.

## WebdriverIO objects are identified by their brand

The matchers find a browser, an element, an element list or a mock by the WebdriverIO v10 brand `Symbol.for('wdio.kind')`, not by its properties or its class name. The objects that WebdriverIO gives have the brand, so tests that pass them need no change.

A hand-made fake without the brand, for example in your own unit tests, is not recognized: the matcher fails with its normal message. Give the fake the brand of the object it replaces, `'browser'`, `'browsing-context'`, `'element'`, `'element-array'` or `'mock'`, and the methods that the matcher calls. A fake element also needs `getElement()`:

```ts
const element = Object.defineProperty({
    selector: 'h1',
    getText: async () => 'Welcome',
    async getElement() { return this },
}, Symbol.for('wdio.kind'), { value: 'element' })
```

A copy of the element list of one browser, such as `[...elements]`, is still an array of elements, because each element keeps its brand. A copy of a multi-remote `$$()` is not recognized (see above).

## Browser matchers on a browsing context

The browser matchers (`toHaveUrl`, `toHaveTitle`, `toHaveLocalStorageItem`, `toHaveClipboardText`) accept a WebdriverIO v10 browsing context: a tab, a window or a frame, see [Browsing contexts](API.md#browsing-contexts-tab-window-frame). Their failure message names the window or the frame and its URL, e.g. `Expect chrome's frame (https://example.com/frame.html) to have title`, not `browser's window`.

## Jasmine types with `@wdio/jasmine-framework`

The `expect-webdriverio/jasmine-wdio-expect-async` entry point is removed. In WebdriverIO v10, `@wdio/jasmine-framework` keeps the Jasmine synchronous matchers synchronous, and has the types of its global `expect`. Use them in `tsconfig.json`:

```diff
  "types": [
-   "expect-webdriverio/jasmine-wdio-expect-async",
    "@types/jasmine",
-   "@wdio/globals/types"
+   "@wdio/globals/types",
+   "@wdio/jasmine-framework"
  ]
```

`expect-webdriverio/jasmine` does not change: it is for Jasmine without `@wdio/jasmine-framework`.

Since `@wdio/jasmine-framework` 10.0.2, the WDIO matchers on `expectAsync` are typed, and the types of `import { expect } from 'expect-webdriverio'` keep the Jest matchers.

## Deep equality of URLs, sets, maps and binary data

The deep equality of the matchers (for example in `expect.multiRemote()`, or in a Jasmine asymmetric matcher such as `jasmine.objectContaining()`) now compares:

- a `URL` by its `href`;
- a `Set` or a `Map` by its entries, in any order, with each entry matched once: `Set{{a: 1}, {a: 1}, {a: 2}}` is not equal to `Set{{a: 1}, {a: 2}, {a: 2}}`. An asymmetric matcher in a set or a map can receive any entry, so it must not throw for a value of another type (as in Jest);
- an `ArrayBuffer` or a `DataView` by its bytes.

```ts
// Jasmine, an element of a frame: `state.tags` is a real `Set`, compared in any order
await expect(frame.$('body')).toHaveElementProperty('state', jasmine.objectContaining({ tags: new Set(['a', 'b']) }))

// Mocha or Jest, multi-remote: a real `Set` from each instance (`tags` is `{ chrome: Set, firefox: Set }`)
expect(tags).toEqual(expect.multiRemote({ chrome: new Set(['a', 'b']), firefox: new Set(['a', 'b']) }))
```

These values keep their content out of their own keys, so before, 2 different ones were equal: an assertion on them passed by mistake, and now fails. With WebdriverIO v10 and BiDi, `browser.execute()` returns real `Set` and `Map` values, and so does `getProperty()` for an element of a frame or of another tab (in the current context, it gives `{}`). A proxy without a handler of one of these values now throws a `TypeError`, as in Jest. An object that has only the type tag (`Symbol.toStringTag`) of one of these types is compared as a plain object, and is not equal to a real value of the type. A detached buffer, or a data view out of the bounds of a resized buffer, has no bytes.

## The public types come from `lib/`

The types are emitted from the source to `lib/**/*.d.ts`, and `types/expect-webdriverio.d.ts` does not exist anymore. Use the entry points of the package: `expect-webdriverio`, `expect-webdriverio/jest`, `expect-webdriverio/jasmine` or `expect-webdriverio/expect-global`, not a file path.

```diff
- /// <reference path="./node_modules/expect-webdriverio/types/expect-webdriverio.d.ts" />
+ /// <reference types="expect-webdriverio" />
```

The types of the `ExpectWebdriverIO` namespace are also named exports of the package. A default import of the types does not compile anymore: import them by name, or use the global namespace.

```diff
- import type ExpectWebdriverIO from 'expect-webdriverio'
- const options: ExpectWebdriverIO.StringOptions = { ignoreCase: true }
+ import type { StringOptions } from 'expect-webdriverio'
+ const options: StringOptions = { ignoreCase: true }
```

## Removed deprecated APIs

v8.0.0 removes the APIs deprecated in v5.6.9 to v6.0.0, listed in [v5 to v6](#migration-guide-v5-to-v6) below.

| Removed | Replacement |
| ------- | ----------- |
| `setOptions()` | `setDefaultOptions()` |
| `getConfig()` | `getDefaultOptions()` |
| `matchers` export | `wdioCustomMatchers` |
| `expect-webdriverio/types` export | `expect-webdriverio/expect-global` |
| `utils.compareNumbers()` | none, internal |
| `toHaveAttr()` | `toHaveAttribute()` |
| `toHaveClass()` | `toHaveElementClass()` |
| `toHaveAttribute(name, undefined \| null, options)`, which checks that the attribute is present | `toHaveAttribute(name)`, or `toHaveAttribute(name, expect.anything(), options)` |
| `toHaveElementProperty(name, undefined \| null, options)` | `toHaveElementProperty(name)`, or `toHaveElementProperty(name, expect.anything(), options)` |
| `toHaveLocalStorageItem(key, undefined, options)` | `toHaveLocalStorageItem(key)`, or `toHaveLocalStorageItem(key, expect.anything(), options)` |
| `toHaveChildren(undefined \| {}, options)` | `toHaveChildren()`, or `toHaveChildren({ gte: 1 }, options)` |
| `NumberOptions` as expected value, e.g. `toHaveChildren({ gte: 1, wait: 0 })` | a `NumberMatcher` and the options apart: `toHaveChildren({ gte: 1 }, { wait: 0 })` |
| `ExpectWebdriverIO.NumberOptions` type | `ExpectWebdriverIO.NumberMatcher` and `ExpectWebdriverIO.CommandOptions` |
| `toBeRequestedWithResponse()`, not typed or documented | `toBeRequestedWith({ response })` |
| `toHaveAttributeAndValue()`, an internal helper registered by mistake | `toHaveAttribute()` |
| `toHaveAttributeAndValue(name, null)` to check for a missing attribute | `not.toHaveAttribute(name)` |

`NumberOptions` applied to `toHaveChildren`, `toHaveWidth`, `toHaveHeight`, `toBeElementsArrayOfSize` and `toBeRequestedTimes`. A number matcher with other keys than `eq`, `gte` and `lte` now throws `Invalid NumberMatcher`, instead of taking them as command options.

`ExpectWebdriverIO.NumberMatcher` is now a type, not an interface: `eq` alone, or a range with `gte`, `lte` or both. The types reject `{}` (the runtime throws `Invalid NumberMatcher`) and `eq` with `gte` or `lte` (the runtime used `eq` and ignored the range). To extend it, write `type MyMatcher = ExpectWebdriverIO.NumberMatcher & { ... }`, not `interface MyMatcher extends ExpectWebdriverIO.NumberMatcher`.

The deprecation warnings are removed.

---

# Migration Guide: v5 to v6

This document covers all deprecations (no breakings) introduced in **v6.0.0** that will be **removed only in v8.0.0**.

---

## Configuration API

### `setOptions` → `setDefaultOptions`

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- import { setOptions } from 'expect-webdriverio'
- setOptions({ wait: 3000 })
+ import { setDefaultOptions } from 'expect-webdriverio'
+ setDefaultOptions({ wait: 3000 })
```

### `getConfig` → `getDefaultOptions`

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- import { getConfig } from 'expect-webdriverio'
- const opts = getConfig()
+ import { getDefaultOptions } from 'expect-webdriverio'
+ const opts = getDefaultOptions()
```

### `matchers` → `wdioCustomMatchers`

**Deprecated since:** v5.6.9 | **Removed in:** v8.0.0

```diff
- import { matchers } from 'expect-webdriverio'
+ import { wdioCustomMatchers } from 'expect-webdriverio'
```

---

## Element Matchers

### `toHaveAttr` → `toHaveAttribute`

**Deprecated since:** v5.7.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveAttr('class', 'active')
+ await expect(el).toHaveAttribute('class', 'active')
```

### `toHaveClass` → `toHaveElementClass`

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveClass('active')
+ await expect(el).toHaveElementClass('active')
```

### `toHaveAttribute` — passing explicit `undefined` as value

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveAttribute('aria-label', undefined)
+ await expect(el).toHaveAttribute('aria-label')
# or, with options:
+ await expect(el).toHaveAttribute('aria-label', expect.anything(), options)
```

### `toHaveElementProperty` — passing `undefined` or `null` as value

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveElementProperty('value', undefined)
+ await expect(el).toHaveElementProperty('value', expect.anything(), options)
```

### `toHaveChildren` — passing `undefined`, `{}`, or `NumberOptions`

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
# Passing undefined or empty object:
- await expect(el).toHaveChildren(undefined)
- await expect(el).toHaveChildren({})
+ await expect(el).toHaveChildren()

# Passing NumberOptions (e.g. { wait: 1 }):
- await expect(el).toHaveChildren({ wait: 1 })
+ await expect(el).toHaveChildren({ gte: 1 }, { wait: 1 })
```

### `toHaveWidth` — passing `NumberOptions` as size

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveWidth({ gte: 100, lte: 200, wait: 0 })
+ await expect(el).toHaveWidth({ gte: 100, lte: 200 },  { wait: 0 })
```

### `toHaveHeight` — passing `NumberOptions` as size

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveHeight({ gte: 100, wait: 0 })
+ await expect(el).toHaveHeight({ gte: 100 }, { wait: 0 })
```

---

## Array Matchers

### `toBeElementsArrayOfSize` — passing `NumberOptions`

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect($$('.item')).toBeElementsArrayOfSize({ gte: 2, wait: 0 })
+ await expect($$('.item')).toBeElementsArrayOfSize({ gte: 2 }, { wait: 0 })
```

---

## Network / Mock Matchers

### `toBeRequestedTimes` — combined `NumberOptions` + `CommandOptions`

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(mock).toBeRequestedTimes({ eq: 3, wait: 1000 })
+ await expect(mock).toBeRequestedTimes(3, { wait: 1000 })
```

---

## Browser Matchers

### `toHaveLocalStorageItem` — passing `undefined` as expected value

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(browser).toHaveLocalStorageItem('key', undefined, { wait: 0 })
+ await expect(browser).toHaveLocalStorageItem('key', expect.anything(), { wait: 0 })
```

---

## Internal / Advanced

### Passing array of expected values to text matchers

**Deprecated since:** v6.0.0 | **Removed in:** v8.0.0

```diff
- await expect(el).toHaveText(['foo', 'bar'])
+ await expect(el).toHaveText(expect.oneOf('foo', 'bar'))
```

> **Note:** The `useToHaveTextStrictMultiElementsCompareStrategy` feature flag is required when using `expect.oneOf()` inside an expected array for strict index-based multi-element comparison.

---

> All deprecated APIs above will be **removed in v8.0.0**. We recommend updating usages as soon as possible after upgrading to v6.

---
