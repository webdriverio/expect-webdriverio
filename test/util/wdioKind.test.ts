import { describe, expect, test } from 'vitest'

import { getWdioKind, isChainable } from '../../src/util/wdioKind.js'

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

describe(isChainable, () => {
    test('is true for a not-awaited `$()`', () => {
        expect(isChainable({ [Symbol.for('wdio.chainable')]: true })).toBe(true)
    })

    test.each([
        ['an object without the flag', {}],
        ['null', null],
        ['a flag that is not `true`', { [Symbol.for('wdio.chainable')]: 'true' }],
    ])('is false for %s', (_, value) => {
        expect(isChainable(value)).toBe(false)
    })
})
