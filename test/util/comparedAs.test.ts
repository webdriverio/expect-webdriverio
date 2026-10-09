import { describe, expect, test } from 'vitest'
import { withComparedValues } from '../../src/util/comparedAs.js'

describe(withComparedValues, () => {
    const diff = '+   "  Baz  ",'

    /** A large actual value, e.g. an object property, that records each read of its keys */
    const watchedValue = (value: object) => {
        const reads: PropertyKey[] = []
        const watched = new Proxy(value, {
            ownKeys: (target) => {
                reads.push('ownKeys')
                return Reflect.ownKeys(target)
            },
            get: (target, key, receiver) => {
                reads.push(key)
                return Reflect.get(target, key, receiver)
            },
        })
        return { watched, reads }
    }

    test.each([
        { name: 'no compared value, e.g. an object property', compared: undefined },
        { name: 'no compared value for any element', compared: [undefined, undefined] },
        { name: 'no compared value for any instance', compared: { chrome: undefined, firefox: [undefined] } },
    ])('does not walk the actual value with $name', ({ compared }) => {
        const { watched, reads } = watchedValue({ name: '  Baz  ', items: ['  Baz  ', { deep: '  Baz  ' }] })

        expect(withComparedValues(diff, watched, compared)).toBe(diff)
        expect(reads).toEqual([])
    })

    test('still adds the compared value when one is shown', () => {
        expect(withComparedValues(diff, ['ok', '  Baz  '], [undefined, 'baz'])).toBe('+   "  Baz  ", (compared as "baz")')
    })
})
