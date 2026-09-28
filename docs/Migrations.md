# Migration Guide: v7 to v8

## Node.js 22.19

v8.0.0 requires Node.js `22.19.0` or higher, the same as WebdriverIO v10. Node.js 20 is no longer supported.

## Peer dependencies

`@wdio/globals` and `@wdio/logger` are no longer peer dependencies: only `webdriverio` is. You can remove them from your `package.json` if you do not use them yourself. When `toHaveClipboardText` cannot set the clipboard permissions, its warning now goes to `console.warn`, not to the WebdriverIO logger.

## `toHaveText` on multiple elements

The strict strategy of the `useToHaveTextStrictMultiElementsCompareStrategy` feature flag is now the only one. The flag, `setFeatureFlags()` and the `featureFlags` option are removed.

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
| `toHaveAttribute(name, undefined, options)` | `toHaveAttribute(name)`, or `toHaveAttribute(name, expect.anything(), options)` |
| `toHaveElementProperty(name, undefined \| null, options)` | `toHaveElementProperty(name)`, or `toHaveElementProperty(name, expect.anything(), options)` |
| `toHaveLocalStorageItem(key, undefined, options)` | `toHaveLocalStorageItem(key)`, or `toHaveLocalStorageItem(key, expect.anything(), options)` |
| `toHaveChildren(undefined \| {}, options)` | `toHaveChildren()`, or `toHaveChildren({ gte: 1 }, options)` |
| `NumberOptions` as expected value, e.g. `toHaveChildren({ gte: 1, wait: 0 })` | a `NumberMatcher` and the options apart: `toHaveChildren({ gte: 1 }, { wait: 0 })` |
| `ExpectWebdriverIO.NumberOptions` type | `ExpectWebdriverIO.NumberMatcher` and `ExpectWebdriverIO.CommandOptions` |

`NumberOptions` applied to `toHaveChildren`, `toHaveWidth`, `toHaveHeight`, `toBeElementsArrayOfSize` and `toBeRequestedTimes`. A number matcher with other keys than `eq`, `gte` and `lte` now throws `Invalid NumberMatcher`, instead of taking them as command options.

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
