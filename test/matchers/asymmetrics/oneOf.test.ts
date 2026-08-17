import { describe, it, expect } from 'vitest'
import { isOneOfMatcher, oneOf, OneOfMatcher } from '../../../src/matchers/asymmetrics/oneOf'

describe('OneOfMatcher', () => {
    describe('asymmetricMatch', () => {
        it('should match when the actual string is contained in the sample array', () => {
            const matcher = new OneOfMatcher('apple', 'banana', 'orange')

            expect(matcher.asymmetricMatch('banana')).toBe(true)
            expect(matcher.asymmetricMatch('grape')).toBe(false)
        })

        it('should return false if the actual value is not a string', () => {
            const matcher = new OneOfMatcher('apple', 'banana')

            expect(matcher.asymmetricMatch(123)).toBe(false)
            expect(matcher.asymmetricMatch(null)).toBe(false)
            expect(matcher.asymmetricMatch(undefined)).toBe(false)
        })

        it('should support null', () => {
            const matcher = new OneOfMatcher('apple', 'banana', null)

            expect(matcher.asymmetricMatch(123)).toBe(false)
            expect(matcher.asymmetricMatch(null)).toBe(true)
            expect(matcher.asymmetricMatch(undefined)).toBe(false)
        })
    })

    describe('toAsymmetricMatcher', () => {
        it('should format default oneOf with string array properly', () => {
            const matcher = new OneOfMatcher('apple', 'banana')
            expect(matcher.toAsymmetricMatcher()).toBe('oneOf<"apple", "banana">')
        })

        it('should format when sample is a single non-array value', () => {
            const matcher = new OneOfMatcher('apple')
            expect(matcher.toAsymmetricMatcher()).toBe('oneOf<"apple">')
        })

        it('should handle regex patterns in the sample and format them correctly', () => {
            const matcher = new OneOfMatcher(/^app/i, 'banana')
            expect(matcher.toAsymmetricMatcher()).toBe('oneOf</^app/i, "banana">')
        })

        it('should format with containing prefix', () => {
            const matcher = new OneOfMatcher('apple', 'banana').withOptions({ containing: true })

            expect(matcher.toAsymmetricMatcher()).toBe('containingOneOf<"apple", "banana">')
        })

        it('should format with startingWith prefix', () => {
            const matcher = new OneOfMatcher('apple', 'banana').withOptions({ atStart: true })

            expect(matcher.toAsymmetricMatcher()).toBe('startingWithOneOf<"apple", "banana">')
        })

        it('should format with endingWith prefix', () => {
            const matcher = new OneOfMatcher('apple', 'banana').withOptions({ atEnd: true })

            expect(matcher.toAsymmetricMatcher()).toBe('endingWithOneOf<"apple", "banana">')
        })

        it('should format with matchingAtIndex prefix when atIndex is a number', () => {
            const matcher = new OneOfMatcher('apple', 'banana').withOptions({ atIndex: 0 })

            expect(matcher.toAsymmetricMatcher()).toBe('matchingAtIndex<0>OneOf<"apple", "banana">')
        })

        it('should format with matchingAtIndex prefix and a single sample value', () => {
            const matcher = new OneOfMatcher('apple').withOptions({ atIndex: 1 })

            expect(matcher.toAsymmetricMatcher()).toBe('matchingAtIndex<1>OneOf<"apple">')
        })
    })

    describe('isOneOfMatcher', () => {
        it('should return true for a OneOfMatcher instance', () => {
            const matcher = new OneOfMatcher('apple', 'banana')
            expect(isOneOfMatcher(matcher)).toBe(true)
        })

        it('should return true for a OneOfMatcher created via oneOf()', () => {
            expect(isOneOfMatcher(oneOf('apple', 'banana'))).toBe(true)
        })

        it('should return true for an object with the ONE_OF_SYMBOL set to true (cross-module scenario)', () => {
            const fakeFromAnotherModule = {
                [Symbol.for('expect-webdriverio.oneOf')]: true,
            }
            expect(isOneOfMatcher(fakeFromAnotherModule)).toBe(true)
        })

        it('should return false for null', () => {
            expect(isOneOfMatcher(null)).toBe(false)
        })

        it('should return false for undefined', () => {
            expect(isOneOfMatcher(undefined)).toBe(false)
        })

        it('should return false for a plain object without the symbol', () => {
            expect(isOneOfMatcher({ sample: ['apple'] })).toBe(false)
        })

        it('should return false for a primitive', () => {
            expect(isOneOfMatcher('apple')).toBe(false)
            expect(isOneOfMatcher(42)).toBe(false)
        })

        it('should return false for an object with the symbol set to false', () => {
            const obj = { [Symbol.for('expect-webdriverio.oneOf')]: false }
            expect(isOneOfMatcher(obj)).toBe(false)
        })
    })
})
