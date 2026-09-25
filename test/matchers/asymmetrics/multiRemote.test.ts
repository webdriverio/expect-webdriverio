import { describe, it, expect } from 'vitest'
import { expect as wdioExpect } from '../../../src/index.js'
import { multiRemote as apiMultiRemote } from '../../../src/api/index.js'
import { multiRemote, MultiRemoteMatcher } from '../../../src/matchers/asymmetrics/multiRemote.js'
import { isMultiRemoteMatcher } from '../../../src/util/multiRemoteUtils.js'

describe('MultiRemoteMatcher', () => {
    it('is registered as expect.multiRemote() and exported by the api', () => {
        expect(isMultiRemoteMatcher(wdioExpect.multiRemote({ chrome: 'a' }))).toBe(true)
        expect(isMultiRemoteMatcher(apiMultiRemote({ chrome: 'a' }))).toBe(true)
    })

    it.each([undefined, 'a', ['a'], {}, /a/])('throws when not given per-instance values: %s', (value) => {
        expect(() => multiRemote(value as unknown as MultiRemoteValues<string>)).toThrow('expect.multiRemote() expects an object with one expected value per multi-remote instance')
    })

    describe('asymmetricMatch', () => {
        it('matches an object with exactly the same instances whose values match', () => {
            const matcher = multiRemote({ chrome: 'a', firefox: expect.stringContaining('b') })

            expect(matcher.asymmetricMatch({ firefox: 'abc', chrome: 'a' })).toBe(true)
            expect(matcher.asymmetricMatch({ chrome: 'a', firefox: 'c' })).toBe(false)
        })

        it.each([
            { name: 'a missing instance', actual: { chrome: 'a' } },
            { name: 'an extra instance', actual: { chrome: 'a', firefox: 'b', safari: 'c' } },
            { name: 'a non per-instance value', actual: 'a' },
            { name: 'undefined', actual: undefined },
        ])('does not match $name', ({ actual }) => {
            expect(multiRemote({ chrome: 'a', firefox: 'b' }).asymmetricMatch(actual)).toBe(false)
        })

        it('works with the equality of the expect library', () => {
            expect({ chrome: 'a', firefox: 'b' }).toEqual(multiRemote({ chrome: 'a', firefox: 'b' }))
            expect({ chrome: 'a', firefox: 'c' }).not.toEqual(multiRemote({ chrome: 'a', firefox: 'b' }))
        })
    })

    describe('withOptions', () => {
        it('forwards the options to the per-instance asymmetric matchers without mutating the original', () => {
            const original = multiRemote({ chrome: wdioExpect.oneOf('valid'), firefox: 'b' })

            const withOptions = original.withOptions({ ignoreCase: true })

            expect(withOptions).toBeInstanceOf(MultiRemoteMatcher)
            expect(withOptions).not.toBe(original)
            expect((withOptions.values.chrome as ReturnType<typeof wdioExpect.oneOf> & { options: object }).options).toEqual({ ignoreCase: true })
            expect((original.values.chrome as ReturnType<typeof wdioExpect.oneOf> & { options: object }).options).toEqual({})
            expect(withOptions.values.firefox).toBe('b')
        })
    })

    it('prints every instance expected value', () => {
        const matcher = multiRemote({ chrome: 'a', firefox: /b/, edge: wdioExpect.oneOf('c', 'd'), safari: { width: 1 } })

        expect(matcher.toAsymmetricMatcher()).toBe('multiRemote<chrome: "a", firefox: /b/, edge: oneOf<"c", "d">, safari: {"width":1}>')
    })
})
