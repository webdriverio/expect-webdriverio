import { test, describe, expect, vi } from 'vitest'
import {
    isEmptyOrLegacyNumberOptions,
    isNumber,
    NumberMatcher,
    validateNumberAndExtractOptions
} from '../../src/util/numberOptionsUtil.js'
import { DEFAULT_OPTIONS } from '../../src/constants.js'

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

    describe(validateNumberAndExtractOptions, () => {
        test('successfully extracts number literal configurations', () => {
            const result = validateNumberAndExtractOptions(5, { wait: 1000 })
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(5)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 1000 })
        })

        test('successfully extracts number literal 0', () => {
            const result = validateNumberAndExtractOptions(0, DEFAULT_OPTIONS)
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(0)).toBe(true)
            expect(result.commandOptions).toEqual(DEFAULT_OPTIONS)
        })

        test('successfully extracts number literal as gte', () => {
            const result = validateNumberAndExtractOptions({ gte: 0 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(0)).toBe(true)
            expect(result.commandOptions).toEqual(DEFAULT_OPTIONS)
        })

        test('successfully extracts number literal as lte', () => {
            const result = validateNumberAndExtractOptions({ lte: 0 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(0)).toBe(true)
            expect(result.commandOptions).toEqual(DEFAULT_OPTIONS)
        })

        test('successfully extracts valid interface configurations and returns remaining command options', () => {
            const result = validateNumberAndExtractOptions({ gte: 2, lte: 5, wait: 200 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher.asymmetricMatch(3)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 200, interval: 100, afterAssertion : DEFAULT_OPTIONS.afterAssertion, beforeAssertion: DEFAULT_OPTIONS.beforeAssertion, featureFlags: DEFAULT_OPTIONS.featureFlags })
        })

        test('throws error for empty or entirely invalid options objects', () => {
            expect(() => validateNumberAndExtractOptions(null as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions({}, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions(undefined, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions( { invalidkey:'test' } as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions( { wait: 0 } as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)

            // Wrong types for eq, gte, lte
            expect(() => validateNumberAndExtractOptions({ gte: '5' } as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions({ lte: '5' } as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions({ eq: '5' } as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions({ gte: '5', lte: 10 } as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
        })

        test('throws error when gte option is greater than lte option', () => {
            expect(() => validateNumberAndExtractOptions({ gte: 10, lte: 5 }, DEFAULT_OPTIONS)).toThrow(
                "Invalid NumberMatcher range: 'gte' (10) cannot be greater than 'lte' (5)."
            )
        })

        test('does not throw when gte equals lte', () => {
            expect(() => validateNumberAndExtractOptions({ gte: 5, lte: 5 }, DEFAULT_OPTIONS)).not.toThrow()
            const result = validateNumberAndExtractOptions({ gte: 5, lte: 5 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher.asymmetricMatch(5)).toBe(true)
        })

        test('return default gte 1 when undefined is passed and supportUndefinedAsGteThen1 is true', () => {
            const result = validateNumberAndExtractOptions(undefined, {}, { supportDefaultAsGteThen1: true })
            expect(result.numberMatcher.asymmetricMatch(1)).toBe(true)
            expect(result.numberMatcher.asymmetricMatch(2)).toBe(true)
            expect(result.numberMatcher.asymmetricMatch(0)).toBe(false)
        })

        test('return default gte 1 when {} is passed and supportUndefinedAsGteThen1 is true', () => {
            const result = validateNumberAndExtractOptions({}, {},  { supportDefaultAsGteThen1: true })
            expect(result.numberMatcher.asymmetricMatch(1)).toBe(true)
            expect(result.numberMatcher.asymmetricMatch(2)).toBe(true)
            expect(result.numberMatcher.asymmetricMatch(0)).toBe(false)
        })

        test('merge with DEFAULT_OPTIONS and prioritizes number options over command options - wait only', () => {
            const result = validateNumberAndExtractOptions( { gte: 5, wait: 0 },  DEFAULT_OPTIONS)

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(5)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 0, interval: 100, afterAssertion : DEFAULT_OPTIONS.afterAssertion, beforeAssertion: DEFAULT_OPTIONS.beforeAssertion, featureFlags: DEFAULT_OPTIONS.featureFlags })
        })

        test('merge with DEFAULT_OPTIONS and prioritizes number options over command options - before/after assertions options', () => {
            const beforeAssertion = vi.fn().mockReturnValue(1)
            const afterAssertion = vi.fn().mockReturnValue(2)
            const result = validateNumberAndExtractOptions( { gte: 5, wait: 0, beforeAssertion, afterAssertion },  DEFAULT_OPTIONS)

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(5)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 0, interval: 100, afterAssertion, beforeAssertion, featureFlags: expect.any(Object) })

            expect(result.commandOptions?.beforeAssertion?.({} as any)).toBe(1)
            expect(result.commandOptions?.afterAssertion?.({} as any)).toBe(2)
            expect(beforeAssertion).toHaveBeenCalledTimes(1)
            expect(afterAssertion).toHaveBeenCalledTimes(1)
        })

        test('merge with DEFAULT_OPTIONS and prioritizes number options over command options - useDefault - before/after assertions options', () => {
            const beforeAssertion = vi.fn().mockReturnValue(1)
            const afterAssertion = vi.fn().mockReturnValue(2)
            const result = validateNumberAndExtractOptions( { wait: 0, beforeAssertion, afterAssertion },  DEFAULT_OPTIONS, { supportDefaultAsGteThen1: true })

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.asymmetricMatch(1)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 0, interval: 100, afterAssertion, beforeAssertion, featureFlags: expect.any(Object) })

            expect(result.commandOptions?.beforeAssertion?.({} as any)).toBe(1)
            expect(result.commandOptions?.afterAssertion?.({} as any)).toBe(2)
            expect(beforeAssertion).toHaveBeenCalledTimes(1)
            expect(afterAssertion).toHaveBeenCalledTimes(1)
        })
    })

    describe(isEmptyOrLegacyNumberOptions, () => {
        test('should return true for empty or legacy number options', () => {
            expect(isEmptyOrLegacyNumberOptions({})).toBe(true)
            expect(isEmptyOrLegacyNumberOptions({ wait: 0 })).toBe(true)
            expect(isEmptyOrLegacyNumberOptions({ eq: 0, wait: 0 })).toBe(true)
            expect(isEmptyOrLegacyNumberOptions({ gte: 1, lte: 10, wait: 0 })).toBe(true)
        })

        test('should return false for non-empty number options', () => {
            expect(isEmptyOrLegacyNumberOptions({ eq: 5 })).toBe(false)
            expect(isEmptyOrLegacyNumberOptions({ gte: 1, lte: 10 })).toBe(false)
        })
    })
})
