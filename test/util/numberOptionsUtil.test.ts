import { test, describe, expect, vi } from 'vitest'
import {
    isNumber,
    NumberMatcher,
    validateNumberMatcher,
    validateNumberMatcherArray
} from '../../src/util/numberOptionsUtil.js'
import { multiRemote } from '../../src/api/index.js'

/**
 * Restore real values for those tests.
 */
vi.mock('../../src/constants.js', async (importOriginal) => (
    await importOriginal<typeof import('../../src/constants.js')>()
))

describe('numberOptionsUtil', () => {
    describe(isNumber, () => {
        test('returns true for numbers', () => {
            expect(isNumber(0)).toBe(true)
            expect(isNumber(1)).toBe(true)
            expect(isNumber(-1)).toBe(true)
            expect(isNumber(3.14)).toBe(true)
            expect(isNumber(Number.MAX_VALUE)).toBe(true)
            expect(isNumber(Number.MIN_VALUE)).toBe(true)
            expect(isNumber(Infinity)).toBe(true)
            expect(isNumber(-Infinity)).toBe(true)
            expect(isNumber(NaN)).toBe(false)
        })

        test('returns false for non-numbers', () => {
            expect(isNumber('5')).toBe(false)
            expect(isNumber(null)).toBe(false)
            expect(isNumber(undefined)).toBe(false)
            expect(isNumber(true)).toBe(false)
            expect(isNumber({})).toBe(false)
            expect(isNumber([])).toBe(false)
            expect(isNumber(() => {})).toBe(false)
        })
    })

    describe(NumberMatcher, () => {
        describe('asymmetricMatch', () => {
            test('returns false for undefined actual value', () => {
                const matcher = new NumberMatcher(5)
                expect(matcher.asymmetricMatch(undefined)).toBe(false)
            })

            describe('with exact number sample', () => {
                const matcher = new NumberMatcher(5)

                test('returns true for matching number', () => {
                    expect(matcher.asymmetricMatch(5)).toBe(true)
                })

                test('returns false for non-matching number', () => {
                    expect(matcher.asymmetricMatch(4)).toBe(false)
                    expect(matcher.asymmetricMatch(6)).toBe(false)
                })
            })

            describe('with NumberMatcher options object (eq, gte, lte)', () => {
                test('works with eq option', () => {
                    const matcher = new NumberMatcher({ eq: 10 } as any)
                    expect(matcher.asymmetricMatch(10)).toBe(true)
                    expect(matcher.asymmetricMatch(9)).toBe(false)
                })

                test('works with gte and lte range options', () => {
                    const matcher = new NumberMatcher({ gte: 5, lte: 10 } as any)
                    expect(matcher.asymmetricMatch(5)).toBe(true)
                    expect(matcher.asymmetricMatch(7)).toBe(true)
                    expect(matcher.asymmetricMatch(10)).toBe(true)
                    expect(matcher.asymmetricMatch(4)).toBe(false)
                    expect(matcher.asymmetricMatch(11)).toBe(false)
                })

                test('works with gte only option', () => {
                    const matcher = new NumberMatcher({ gte: 5 } as any)
                    expect(matcher.asymmetricMatch(5)).toBe(true)
                    expect(matcher.asymmetricMatch(100)).toBe(true)
                    expect(matcher.asymmetricMatch(4)).toBe(false)
                })

                test('works with lte only option', () => {
                    const matcher = new NumberMatcher({ lte: 10 } as any)
                    expect(matcher.asymmetricMatch(10)).toBe(true)
                    expect(matcher.asymmetricMatch(0)).toBe(true)
                    expect(matcher.asymmetricMatch(11)).toBe(false)
                })

                test('returns false when options are invalid or empty', () => {
                    const matcher = new NumberMatcher({} as any)
                    expect(matcher.asymmetricMatch(5)).toBe(false)
                })
            })
        })

        describe('stringification and formatting methods', () => {
            test('toAsymmetricMatcher formats exact number correctly', () => {
                const matcher = new NumberMatcher(5)
                expect(matcher.toAsymmetricMatcher()).toBe('5')
            })

            test('toAsymmetricMatcher formats eq option correctly', () => {
                const matcher = new NumberMatcher({ eq: 42 } as any)
                expect(matcher.toAsymmetricMatcher()).toBe('42')
            })

            test('toAsymmetricMatcher formats range (gte and lte) correctly', () => {
                const matcher = new NumberMatcher({ gte: 5, lte: 10 } as any)
                expect(matcher.toAsymmetricMatcher()).toBe('>= 5 && <= 10')
            })

            test('toAsymmetricMatcher formats gte only correctly', () => {
                const matcher = new NumberMatcher({ gte: 5 } as any)
                expect(matcher.toAsymmetricMatcher()).toBe('>= 5')
            })

            test('toAsymmetricMatcher formats lte only correctly', () => {
                const matcher = new NumberMatcher({ lte: 10 } as any)
                expect(matcher.toAsymmetricMatcher()).toBe('<= 10')
            })

            test('toAsymmetricMatcher returns fallback for invalid options', () => {
                const matcher = new NumberMatcher({} as any)
                expect(matcher.toAsymmetricMatcher()).toBe('Incorrect number options provided')
            })

            test('toString and jasmineToString proxies work correctly', () => {
                const matcher = new NumberMatcher(5)
                expect(matcher.toString()).toBe('5')
                expect(matcher.jasmineToString()).toBe('5')
            })
        })
    })

    describe(validateNumberMatcher, () => {
        test('turns a number into a NumberMatcher', () => {
            const numberMatcher = validateNumberMatcher(5)
            expect(numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(numberMatcher.asymmetricMatch(5)).toBe(true)
        })

        test('turns 0 into a NumberMatcher', () => {
            expect(validateNumberMatcher(0).asymmetricMatch(0)).toBe(true)
        })

        test('turns gte into a NumberMatcher', () => {
            expect(validateNumberMatcher({ gte: 0 }).asymmetricMatch(0)).toBe(true)
        })

        test('turns lte into a NumberMatcher', () => {
            expect(validateNumberMatcher({ lte: 0 }).asymmetricMatch(0)).toBe(true)
        })

        test('turns a range into a NumberMatcher', () => {
            expect(validateNumberMatcher({ gte: 2, lte: 5 }).asymmetricMatch(3)).toBe(true)
        })

        test('throws error for empty or entirely invalid options objects', () => {
            expect(() => validateNumberMatcher(null as any)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher({} as never)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher(undefined)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher( { invalidkey:'test' } as any)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher( { wait: 0 } as any)).toThrow(/Invalid NumberMatcher/)

            // Wrong types for eq, gte, lte
            expect(() => validateNumberMatcher({ gte: '5' } as any)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher({ lte: '5' } as any)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher({ eq: '5' } as any)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberMatcher({ gte: '5', lte: 10 } as any)).toThrow(/Invalid NumberMatcher/)
        })

        test('throws error for a legacy NumberOptions with command options', () => {
            expect(() => validateNumberMatcher({ gte: 5, wait: 0 } as any)).toThrow('Invalid NumberMatcher. Received: {"gte":5,"wait":0}')
            expect(() => validateNumberMatcher({ wait: 0 } as any, { supportDefaultAsGteThen1: true })).toThrow(/Invalid NumberMatcher/)
        })

        test('throws error when gte option is greater than lte option', () => {
            expect(() => validateNumberMatcher({ gte: 10, lte: 5 })).toThrow(
                "Invalid NumberMatcher range: 'gte' (10) cannot be greater than 'lte' (5)."
            )
        })

        test('does not throw when gte equals lte', () => {
            expect(validateNumberMatcher({ gte: 5, lte: 5 }).asymmetricMatch(5)).toBe(true)
        })

        test('return default gte 1 when undefined is passed and supportDefaultAsGteThen1 is true', () => {
            const numberMatcher = validateNumberMatcher(undefined, { supportDefaultAsGteThen1: true })
            expect(numberMatcher.asymmetricMatch(1)).toBe(true)
            expect(numberMatcher.asymmetricMatch(2)).toBe(true)
            expect(numberMatcher.asymmetricMatch(0)).toBe(false)
        })

        test('throws error when {} is passed and supportDefaultAsGteThen1 is true', () => {
            expect(() => validateNumberMatcher({} as never, { supportDefaultAsGteThen1: true })).toThrow(/Invalid NumberMatcher/)
        })
    })

    describe(validateNumberMatcherArray, () => {
        test('validates one value per instance with expect.multiRemote(), whatever the instance names', () => {
            const numberMatcher = validateNumberMatcherArray(multiRemote({ eq: 2, firefox: [1, { gte: 1 }] }))

            expect(numberMatcher).toEqual({ eq: new NumberMatcher({ eq: 2 }), firefox: [new NumberMatcher({ eq: 1 }), new NumberMatcher({ gte: 1 })] })
        })

        test('reads a plain object as a NumberMatcher, not as per-instance values', () => {
            expect(() => validateNumberMatcherArray({ chrome: 2, firefox: 3 } as never)).toThrow('Invalid NumberMatcher')
        })
    })
})
