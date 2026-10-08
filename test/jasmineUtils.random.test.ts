import { beforeEach, describe, test, expect } from 'vitest'
import { isDeepStrictEqual } from 'node:util'
import { expect as jestExpect } from 'expect'
import { equals } from '../src/jasmineUtils.js'
import { jasmine } from './__fixtures__/jasmine.js'

/**
 * Random checks of `equals()`, from the reviews of #2317. A seed makes each run check the same cases, so that a
 * failure can be repeated. They protect the set and map matching and the symmetry when `jasmineUtils.ts` changes.
 */
const randomFrom = (seed: number) => () => {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const seed = 2317
let random = randomFrom(seed)
const pick = <T>(values: T[]) => values[Math.floor(random() * values.length)]
const permutations = <T>(values: T[]): T[][] => values.length <= 1
    ? [values]
    : values.flatMap((value, i) => permutations([...values.slice(0, i), ...values.slice(i + 1)]).map((rest) => [value, ...rest]))

// Fresh values for each case: a value equal to another one, but not the same object
const plainValues = () => [1, 2, 'x', null, { a: 1 }, { a: 2 }, [1], [1, 2], new Set([1]), new Map([['k', 1]]), new URL('https://a.test/'), new Uint8Array([1]).buffer]
const matchers = () => [jestExpect.anything(), jestExpect.any(Number), jestExpect.objectContaining({ a: 1 }), jasmine.any(Object), jasmine.anything()]
const anyValues = () => [...plainValues(), ...matchers()]
const randomList = (from: () => unknown[]) => Array.from({ length: 1 + Math.floor(random() * 4) }, () => pick(from()))

// Each entry of `a` with 1 entry of `b`, in any order: the result that the matching of `collectionEquals()` must give
const pairs = (a: unknown[], b: unknown[], same: (x: unknown, y: unknown) => boolean) =>
    a.length === b.length && permutations(b).some((order) => a.every((value, i) => same(value, order[i])))

describe('equals: random checks', () => {
    // Each test starts from the seed, so that it checks the same cases when it runs alone (`vitest -t`)
    beforeEach(() => {
        random = randomFrom(seed)
    })

    test('matches the entries of a set as a check of each permutation does', () => {
        for (let run = 0; run < 2000; run++) {
            const a = new Set(randomList(anyValues)), b = new Set(randomList(anyValues))

            const expected = pairs([...a], [...b], (x, y) => equals(x, y))

            expect(equals(a, b), `${run}: ${[...a]} | ${[...b]}`).toBe(expected)
        }
    })

    test('matches the entries of a map as a check of each permutation does', () => {
        for (let run = 0; run < 2000; run++) {
            const entries = (from: () => unknown[]) => randomList(() => from().map((key): [unknown, unknown] => [key, pick(from())])) as [unknown, unknown][]
            const a = new Map(entries(plainValues)), b = new Map(entries(anyValues))

            const expected = pairs([...a], [...b], ([ka, va]: any, [kb, vb]: any) => equals(ka, kb) && equals(va, vb))

            expect(equals(a, b), `${run}`).toBe(expected)
        }
    })

    test('gives the same result in both directions', () => {
        for (let run = 0; run < 2000; run++) {
            const a = pick([pick(anyValues()), new Set(randomList(anyValues)), randomList(anyValues), { s: new Set(randomList(anyValues)) }])
            const b = pick([pick(anyValues()), new Set(randomList(anyValues)), randomList(anyValues), { s: new Set(randomList(anyValues)) }])

            expect(equals(a, b), `${run}`).toBe(equals(b, a))
        }
    })

    test('agrees with isDeepStrictEqual of Node on values without matchers', () => {
        let skipped = 0
        for (let run = 0; run < 2000; run++) {
            const a = pick([pick(plainValues()), new Set(randomList(plainValues)), randomList(plainValues), { v: pick(plainValues()) }])
            const b = pick([pick(plainValues()), new Set(randomList(plainValues)), randomList(plainValues), { v: pick(plainValues()) }])

            // Node 24.20 `isDeepStrictEqual()` throws for some sets that hold `null` and objects ("Cannot read properties
            // of null (reading 'constructor')"): it gives no answer for these cases
            let expected: boolean
            try {
                expected = isDeepStrictEqual(a, b)
            } catch {
                skipped++
                continue
            }
            expect(equals(a, b), `${run}`).toBe(expected)
        }
        // the check still compares almost all the cases
        expect(skipped).toBeLessThan(20)
    })
})
