// `Symbol.for()` gives the symbol of `@wdio/utils` without a dependency on it, also with two copies of `webdriverio`
export const WDIO_KIND = Symbol.for('wdio.kind')

export type WdioKind = 'browser' | 'element' | 'element-array' | 'mock' | 'browsing-context'

const WDIO_KINDS: readonly unknown[] = ['browser', 'element', 'element-array', 'mock', 'browsing-context'] satisfies WdioKind[]

/**
 * The role that WebdriverIO v10 brands its objects with. A copy, such as `[...elements]`, has no brand.
 * Reads the property without `in`: a Proxy with only a `get` trap still gives it.
 */
export const getWdioKind = (value: unknown): WdioKind | undefined => {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
        return undefined
    }
    const kind = (value as { [WDIO_KIND]?: unknown })[WDIO_KIND]
    return WDIO_KINDS.includes(kind) ? kind as WdioKind : undefined
}

/**
 * The brand of a loaded value. A not-awaited `$()` (a Promise) and a not-awaited `$$()` (a list with `then`) have the
 * brand too, but their `then` shows that they are not loaded yet.
 */
export const getLoadedWdioKind = (value: unknown): WdioKind | undefined =>
    typeof (value as { then?: unknown } | null | undefined)?.then === 'function' ? undefined : getWdioKind(value)
