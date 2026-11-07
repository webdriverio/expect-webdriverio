import { describe, expect, test } from 'vitest'
import type { MatcherContext } from 'expect'
import { expect as wdioExpect } from '../../src/index.js'
import { MatcherUsageError } from '../../src/util/matcherUsageError.js'

type AsymmetricFactory = (...sample: unknown[]) => ExpectWebdriverIO.PartialMatcher<unknown>
type ExpectWithCustom = typeof wdioExpect & Record<string, AsymmetricFactory> & { not: Record<string, AsymmetricFactory> }

const e = wdioExpect as ExpectWithCustom

e.extend({
    toBeWithinRange(this: MatcherContext, actual: number, floor: number, ceiling: number) {
        const pass = actual >= floor && actual <= ceiling
        return {
            pass,
            message: () => `expected ${actual} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`
        }
    },
    toBeEven(this: MatcherContext, actual: number) {
        return {
            pass: actual % 2 === 0,
            message: () => `${this.utils.matcherHint('toBeEven', undefined, '')}\n\nReceived: ${this.utils.printReceived(actual)}`
        }
    },
    toBeQuiet(actual: number) {
        return { pass: actual === 0 } as { pass: boolean, message: () => string }
    },
    toBeBroken(actual: number) {
        return { pass: actual === 0, message: () => { throw new Error('broken message') } }
    },
    async toBeEventually(actual: number, expected: number) {
        return { pass: actual === expected, message: () => `expected ${actual} to be ${expected}` }
    },
    async toRejectLater() {
        throw new Error('rejected')
    },
})

const failureOf = (assertion: () => void) => {
    try {
        assertion()
    } catch (err) {
        return (err as Error).message
    }
    throw new Error('the assertion passed')
}

describe('the asymmetric form of a custom matcher', () => {
    test('passes and fails as the matcher', () => {
        e(5).toEqual(e.toBeWithinRange(1, 10))
        e(15).toEqual(e.not.toBeWithinRange(1, 10))
        expect(() => e(15).toEqual(e.toBeWithinRange(1, 10))).toThrow()
        expect(() => e(5).toEqual(e.not.toBeWithinRange(1, 10))).toThrow()
    })

    test('shows the failure message of the matcher in the diff', () => {
        const message = failureOf(() => e({ id: 1, count: 15 }).toMatchObject({ id: 1, count: e.toBeWithinRange(1, 10) }))

        expect(message).toContain('"count": toBeWithinRange<1, 10> (expected 15 to be within range 1 - 10)')
    })

    test('shows the failure message of the matcher with .not', () => {
        const message = failureOf(() => e([5]).toEqual([e.not.toBeWithinRange(1, 10)]))

        expect(message).toContain('not.toBeWithinRange<1, 10> (expected 5 not to be within range 1 - 10)')
    })

    test('shows the message on one line, without colors', () => {
        const matcher = e.toBeEven()

        expect(matcher.asymmetricMatch(3)).toBe(false)
        expect(matcher.toAsymmetricMatcher?.()).toBe('toBeEven<> (expect(received).toBeEven() Received: 3)')
    })

    test('does not keep the message of an earlier call', () => {
        const matcher = e.toBeWithinRange(1, 10)

        expect(matcher.asymmetricMatch(15)).toBe(false)
        expect(matcher.asymmetricMatch(5)).toBe(true)
        expect(matcher.toAsymmetricMatcher?.()).toBe('toBeWithinRange<1, 10>')
    })

    test('shows the matcher only, when the matcher has no message or its message throws', () => {
        const quiet = e.toBeQuiet()
        const broken = e.toBeBroken()

        expect(quiet.asymmetricMatch(1)).toBe(false)
        expect(broken.asymmetricMatch(1)).toBe(false)
        expect(quiet.toAsymmetricMatcher?.()).toBe('toBeQuiet<>')
        expect(broken.toAsymmetricMatcher?.()).toBe('toBeBroken<>')
    })

    test.each([
        { name: 'expect', matcher: () => e.toBeEventually(1), usage: 'expect.toBeEventually()' },
        { name: 'expect.not', matcher: () => e.not.toBeEventually(1), usage: 'expect.not.toBeEventually()' },
    ])('throws a MatcherUsageError for an async matcher on $name', ({ matcher, usage }) => {
        const assertion = () => e({ count: 1 }).toEqual({ count: matcher() })

        expect(assertion).toThrow(MatcherUsageError)
        expect(assertion).toThrow(`${usage} cannot be used as an asymmetric matcher: toBeEventually is async`)
    })

    test('ignores the rejection of an async matcher', async () => {
        expect(() => e(1).toEqual(e.toRejectLater())).toThrow(MatcherUsageError)
        // An unhandled rejection would fail the test run
        await new Promise((resolve) => setTimeout(resolve, 0))
    })

    test('throws a MatcherUsageError for a WebdriverIO matcher, which is async', () => {
        expect(() => e({ title: 'Home' }).toEqual({ title: e.not.toHaveText('Login') }))
            .toThrow('expect.not.toHaveText() cannot be used as an asymmetric matcher: toHaveText is async. Use await expect(value).not.toHaveText() instead')
    })
})
