import { describe, test, expect } from 'vitest'
import jestExpect from 'expect'
import { equals } from '../src/jasmineUtils.js'
import { jasmine } from './__mocks__/jasmine.js'

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
