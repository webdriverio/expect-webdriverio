import { describe, expect, test, vi } from 'vitest'

import { getLoadedWdioKind, getWdioKind } from '../../src/util/wdioKind.js'
import { $Factory, chainableElementArrayFactory, elementFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe(getWdioKind, () => {
    test.each(['browser', 'element', 'element-array', 'mock', 'browsing-context'])('returns the %s kind', (kind) => {
        expect(getWdioKind({ [Symbol.for('wdio.kind')]: kind })).toBe(kind)
    })

    test.each([
        ['undefined', undefined],
        ['null', null],
        ['a string', 'element'],
        ['a number', 42],
        ['an object without brand', {}],
        ['an array without brand', []],
        ['an unknown kind', { [Symbol.for('wdio.kind')]: 'window' }],
        ['a local symbol with the same description', { [Symbol('wdio.kind')]: 'element' }],
    ])('returns undefined for %s', (_, value) => {
        expect(getWdioKind(value)).toBeUndefined()
    })

    test('reads the brand through a Proxy of a function with only a get trap, like the @wdio/globals browser', () => {
        const browser = new Proxy(class Browser {}, { get: (_, prop) => prop === Symbol.for('wdio.kind') ? 'browser' : undefined })

        expect(getWdioKind(browser)).toBe('browser')
    })

    test('reads the brand of an array', () => {
        const elements = Object.defineProperty([], Symbol.for('wdio.kind'), { value: 'element-array' })

        expect(getWdioKind(elements)).toBe('element-array')
    })
})

describe(getLoadedWdioKind, () => {
    const withBrand = <T extends object>(value: T, kind: string): T => Object.defineProperty(value, Symbol.for('wdio.kind'), { value: kind })

    test.each([
        ['an awaited `$()`', withBrand({}, 'element'), 'element'],
        ['an awaited `$$()`', withBrand([], 'element-array'), 'element-array'],
        ['a browser', withBrand({}, 'browser'), 'browser'],
    ])('returns the kind of %s', (_, value, kind) => {
        expect(getLoadedWdioKind(value)).toBe(kind)
    })

    test.each([
        ['a not-awaited `$()`, a Promise of the element', $Factory(elementFactory('a'))],
        ['a not-awaited `$$()`, a list with `then`', chainableElementArrayFactory('a', 1)],
        ['a value without brand', {}],
    ])('returns undefined for %s', (_, value) => {
        expect(getLoadedWdioKind(value)).toBeUndefined()
    })
})
