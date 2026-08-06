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
