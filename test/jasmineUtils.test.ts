import { describe, test, expect } from 'vitest'
import jestExpect from 'expect'
import { equals } from '../src/jasmineUtils.js'
import { jasmine } from './__mocks__/jasmine.js'
import jasmineRequire from 'jasmine-core'
import { oneOf } from '../src/matchers/asymmetrics/oneOf.js'

describe('jasmineUtils', () => {
    describe(equals, () => {
        // Each library reads the second argument of `asymmetricMatch` in a different way
        describe.each([
            { library: 'Vitest', asymmetric: expect },
            { library: 'Jest', asymmetric: jestExpect },
            { library: 'Jasmine', asymmetric: jasmine },
        ])('with $library asymmetric matchers', ({ asymmetric }) => {
            test('should match with objectContaining', () => {
                expect(equals({ a: 1, b: 2 }, asymmetric.objectContaining({ a: 1 }))).toBe(true)
                expect(equals({ a: 1, b: 2 }, asymmetric.objectContaining({ a: 2 }))).toBe(false)
            })

            test('should match with arrayContaining', () => {
                expect(equals([1, 2, 3], asymmetric.arrayContaining([3, 1]))).toBe(true)
                expect(equals([1, 2, 3], asymmetric.arrayContaining([4]))).toBe(false)
            })

            test('should match when the asymmetric matcher is the actual value', () => {
                expect(equals(asymmetric.objectContaining({ a: 1 }), { a: 1, b: 2 })).toBe(true)
            })

            test('should match with a nested asymmetric matcher', () => {
                expect(equals({ a: { b: [1, 2] } }, asymmetric.objectContaining({ a: asymmetric.objectContaining({ b: asymmetric.arrayContaining([2]) }) }))).toBe(true)
            })
        })
    })
})

describe('equals: the matrix of cases', () => {
    const j = jasmineRequire.core(jasmineRequire)
    const circular = () => {
        const value: Record<string, unknown> = { a: 1 }
        value.self = value
        return value
    }
    const symbolKey = Symbol('key')
    const sameSymbol = Symbol('same')
    const sameFunction = () => 1
    const bytes = (...values: number[]) => new Uint8Array(values).buffer
    const withHole = () => {
        const array = [undefined, 1]
        delete array[0]
        return array
    }

    // [name, a, b, expected]: each case also runs as equals(b, a)
    const cases: [string, unknown, unknown, boolean][] = [
        // primitives
        ['same numbers', 1, 1, true],
        ['different numbers', 1, 2, false],
        ['same strings', 'a', 'a', true],
        ['different strings', 'a', 'b', false],
        ['different booleans', true, false, false],
        ['NaN and NaN', NaN, NaN, true],
        ['+0 and -0 (Object.is)', 0, -0, false],
        ['null and null', null, null, true],
        ['undefined and undefined', undefined, undefined, true],
        ['null and undefined', null, undefined, false],
        ['number and numeric string', 1, '1', false],
        ['same bigints', 1n, 1n, true],
        ['bigint and number', 1n, 1, false],
        ['same symbol', sameSymbol, sameSymbol, true],
        ['2 symbols with the same description', Symbol('a'), Symbol('a'), false],
        ['boxed and plain number', new Number(1), 1, false],
        ['same boxed numbers', new Number(1), new Number(1), true],
        ['different boxed strings', new String('a'), new String('b'), false],
        // objects
        ['same objects', { a: 1 }, { a: 1 }, true],
        ['different values', { a: 1 }, { a: 2 }, false],
        ['a missing key', { a: 1 }, {}, false],
        ['an extra key', { a: 1 }, { a: 1, b: 2 }, false],
        ['an undefined key and a missing key', { a: undefined }, {}, true],
        ['same nested objects', { a: { b: 1 } }, { a: { b: 1 } }, true],
        ['different nested objects', { a: { b: 1 } }, { a: { b: 2 } }, false],
        ['same symbol keys', { [symbolKey]: 1 }, { [symbolKey]: 1 }, true],
        ['different symbol key values', { [symbolKey]: 1 }, { [symbolKey]: 2 }, false],
        ['a non-enumerable key is ignored', Object.defineProperty({}, 'x', { value: 1 }), {}, true],
        ['a class instance and a plain object', new (class A { x = 1 })(), { x: 1 }, true],
        ['a null-prototype object and a plain object', Object.assign(Object.create(null), { a: 1 }), { a: 1 }, true],
        ['same circular objects', circular(), circular(), true],
        ['a circular and a plain object', circular(), { a: 1, self: { a: 1 } }, false],
        // arrays
        ['same arrays', [1, 2], [1, 2], true],
        ['another order', [1, 2], [2, 1], false],
        ['another length', [1], [1, 2], false],
        ['a trailing undefined item', [1], [1, undefined], false],
        ['a hole and an undefined item', withHole(), [undefined, 1], true],
        ['an array and an object', [], {}, false],
        ['an array with an extra property', Object.assign([1], { x: 1 }), [1], false],
        // built-in objects
        ['same dates', new Date(1), new Date(1), true],
        ['different dates', new Date(1), new Date(2), false],
        ['2 invalid dates', new Date(NaN), new Date(NaN), false],
        ['same regular expressions', /a/g, /a/g, true],
        ['regular expressions with other flags', /a/g, /a/i, false],
        ['regular expressions with other sources', /a/, /b/, false],
        ['same URLs', new URL('https://a.test/x'), new URL('https://a.test/x'), true],
        ['different URLs', new URL('https://a.test/'), new URL('https://b.test/'), false],
        ['errors with the same message', new Error('x'), new Error('x'), true],
        ['errors with different messages', new Error('x'), new Error('y'), false],
        ['error classes with the same message', new TypeError('x'), new Error('x'), true],
        ['same functions', sameFunction, sameFunction, true],
        ['different functions', () => 1, () => 1, false],
        // collections
        ['same sets in another order', new Set([1, 2]), new Set([2, 1]), true],
        ['different sets', new Set([1]), new Set([2]), false],
        ['sets of another size', new Set([1]), new Set([1, 2]), false],
        ['sets with equal objects', new Set([{ a: 1 }]), new Set([{ a: 1 }]), true],
        ['sets with different objects', new Set([{ a: 1 }]), new Set([{ a: 2 }]), false],
        ['sets with 2 equal objects and 2 different objects', new Set([{ a: 1 }, { a: 1 }]), new Set([{ a: 1 }, { a: 2 }]), false],
        ['same maps in another order', new Map([['a', 1], ['b', 2]]), new Map([['b', 2], ['a', 1]]), true],
        ['maps with another value', new Map([['a', 1]]), new Map([['a', 2]]), false],
        ['maps with another key', new Map([['a', 1]]), new Map([['b', 1]]), false],
        ['maps of another size', new Map([['a', 1]]), new Map([['a', 1], ['b', 2]]), false],
        ['maps with equal object keys', new Map([[{ k: 1 }, 1]]), new Map([[{ k: 1 }, 1]]), true],
        ['a set and an array', new Set([1]), [1], false],
        ['same typed arrays', new Uint8Array([1, 2]), new Uint8Array([1, 2]), true],
        ['different typed arrays', new Uint8Array([1, 2]), new Uint8Array([1, 3]), false],
        ['typed arrays of another type', new Uint8Array([1]), new Int8Array([1]), false],
        ['same array buffers', bytes(1, 2), bytes(1, 2), true],
        ['different array buffers', bytes(1, 2), bytes(1, 3), false],
        ['same data views', new DataView(bytes(1)), new DataView(bytes(1)), true],
        ['different data views', new DataView(bytes(1)), new DataView(bytes(2)), false],
        // Jest asymmetric matchers
        ['Jest any(Number)', 1, jestExpect.any(Number), true],
        ['Jest any(Number) on a string', 'a', jestExpect.any(Number), false],
        ['Jest anything() on undefined', undefined, jestExpect.anything(), false],
        ['Jest objectContaining', { a: 1, b: 2 }, jestExpect.objectContaining({ a: 1 }), true],
        ['Jest objectContaining, no match', { a: 2 }, jestExpect.objectContaining({ a: 1 }), false],
        ['Jest arrayContaining', [1, 2], jestExpect.arrayContaining([2]), true],
        ['Jest stringMatching', 'abc', jestExpect.stringMatching(/b/), true],
        ['Jest closeTo', 1.001, jestExpect.closeTo(1, 2), true],
        ['Jest not.objectContaining', { a: 1 }, jestExpect.not.objectContaining({ a: 2 }), true],
        ['Jest arrayOf', [1, 2], jestExpect.arrayOf(jestExpect.any(Number)), true],
        ['Jest matcher in a set', new Set([1]), new Set([jestExpect.any(Number)]), true],
        ['Jest matcher in a map value', new Map([['a', 1]]), new Map([['a', jestExpect.any(Number)]]), true],
        ['Vitest objectContaining', { a: 1, b: 2 }, expect.objectContaining({ a: 1 }), true],
        // Jasmine asymmetric matchers, from Jasmine 6
        ['Jasmine any(Number)', 1, j.any(Number), true],
        ['Jasmine anything()', 1, j.anything(), true],
        ['Jasmine objectContaining', { a: 1, b: 2 }, j.objectContaining({ a: 1 }), true],
        ['Jasmine objectContaining, no match', { a: 2 }, j.objectContaining({ a: 1 }), false],
        ['Jasmine arrayContaining', [1, 2], j.arrayContaining([2]), true],
        ['Jasmine arrayWithExactContents', [1, 2], j.arrayWithExactContents([2, 1]), true],
        ['Jasmine arrayWithExactContents, no match', [1, 2], j.arrayWithExactContents([1]), false],
        ['Jasmine setContaining', new Set([1, 2]), j.setContaining(new Set([2])), true],
        ['Jasmine setContaining, no match', new Set([1]), j.setContaining(new Set([2])), false],
        ['Jasmine mapContaining', new Map([['a', 1], ['b', 2]]), j.mapContaining(new Map([['a', 1]])), true],
        ['Jasmine mapContaining, no match', new Map([['a', 1]]), j.mapContaining(new Map([['a', 2]])), false],
        ['Jasmine stringContaining', 'abc', j.stringContaining('b'), true],
        ['Jasmine stringMatching', 'abc', j.stringMatching(/c$/), true],
        ['Jasmine truthy', 'x', j.truthy(), true],
        ['Jasmine falsy', 0, j.falsy(), true],
        ['Jasmine empty', [], j.empty(), true],
        ['Jasmine notEmpty', [1], j.notEmpty(), true],
        ['Jasmine is', sameSymbol, j.is(sameSymbol), true],
        ['Jasmine is, another object', { a: 1 }, j.is({ a: 1 }), false],
        ['Jest any() in Jasmine objectContaining', { a: 1 }, j.objectContaining({ a: jestExpect.any(Number) }), true],
        ['Jasmine any() in Jest objectContaining', { a: 1 }, jestExpect.objectContaining({ a: j.any(Number) }), true],
        ['Jasmine matcher in a set', new Set([{ a: 1, b: 2 }]), new Set([j.objectContaining({ a: 1 })]), true],
        // expect-webdriverio asymmetric matchers
        ['oneOf', 'b', oneOf('a', 'b'), true],
        ['oneOf, no match', 'c', oneOf('a', 'b'), false],
    ]

    test.each(cases)('%s', (_name, a, b, expected) => {
        expect(equals(a, b)).toBe(expected)
        expect(equals(b, a)).toBe(expected)
    })
})
