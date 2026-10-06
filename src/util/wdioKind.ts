// `Symbol.for()` gives the symbols of `@wdio/utils` without a dependency on it, also with two copies of `webdriverio`
export const WDIO_KIND = Symbol.for('wdio.kind')
export const WDIO_CHAINABLE = Symbol.for('wdio.chainable')

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

/** A not-awaited `$()`: the brand says `element`, but it is a Promise of the element */
export const isChainable = (value: unknown): boolean =>
    (value as { [WDIO_CHAINABLE]?: unknown } | null | undefined)?.[WDIO_CHAINABLE] === true
