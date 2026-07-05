import { test, describe, expect, vi } from 'vitest'
import {
    isNumber,
    NumberMatcher,
    numberMatcherTester,
    validateNumberAndExtractOptions
} from '../../src/util/numberOptionsUtil.js'
import { DEFAULT_OPTIONS } from '../../src/constants.js'

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
            expect(isNumber(NaN)).toBe(true)
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
        describe('equals', () => {
            test('returns false for undefined on exact matchers', () => {
                const matcher = new NumberMatcher({ eq: 5 })
                expect(matcher.match(undefined)).toBe(false)
            })

            test('returns false for undefined on range matchers', () => {
                const matcher = new NumberMatcher({ gte: 5, lte: 10 })
                expect(matcher.match(undefined)).toBe(false)
            })

            describe('with eq option', () => {
                test('returns true for exact match', () => {
                    const matcher = new NumberMatcher({ eq: 5 })
                    expect(matcher.match(5)).toBe(true)
                })

                test('returns false for non-match', () => {
                    const matcher = new NumberMatcher({ eq: 5 })
                    expect(matcher.match(4)).toBe(false)
                    expect(matcher.match(6)).toBe(false)
                })

                test('works with 0', () => {
                    const matcher = new NumberMatcher({ eq: 0 })
                    expect(matcher.match(0)).toBe(true)
                    expect(matcher.match(1)).toBe(false)
                })
            })

            describe('with gte option', () => {
                test('returns true for values greater than or equal', () => {
                    const matcher = new NumberMatcher({ gte: 5 })
                    expect(matcher.match(5)).toBe(true)
                    expect(matcher.match(6)).toBe(true)
                    expect(matcher.match(100)).toBe(true)
                })

                test('returns false for values less than', () => {
                    const matcher = new NumberMatcher({ gte: 5 })
                    expect(matcher.match(4)).toBe(false)
                    expect(matcher.match(0)).toBe(false)
                })
            })

            describe('with lte option', () => {
                test('returns true for values less than or equal', () => {
                    const matcher = new NumberMatcher({ lte: 10 })
                    expect(matcher.match(10)).toBe(true)
                    expect(matcher.match(9)).toBe(true)
                    expect(matcher.match(0)).toBe(true)
                })

                test('returns false for values greater than', () => {
                    const matcher = new NumberMatcher({ lte: 10 })
                    expect(matcher.match(11)).toBe(false)
                    expect(matcher.match(100)).toBe(false)
                })
            })

            describe('with gte and lte options', () => {
                test('returns true for values in range', () => {
                    const matcher = new NumberMatcher({ gte: 5, lte: 10 })
                    expect(matcher.match(5)).toBe(true)
                    expect(matcher.match(7)).toBe(true)
                    expect(matcher.match(10)).toBe(true)
                })

                test('returns false for values outside range', () => {
                    const matcher = new NumberMatcher({ gte: 5, lte: 10 })
                    expect(matcher.match(4)).toBe(false)
                    expect(matcher.match(11)).toBe(false)
                })
            })

            describe('with no options', () => {
                test('returns false for any value', () => {
                    const matcher = new NumberMatcher({})
                    expect(matcher.match(0)).toBe(false)
                    expect(matcher.match(5)).toBe(false)
                    expect(matcher.match(100)).toBe(false)
                    expect(matcher.match(undefined)).toBe(false)
                })
            })
        })

        describe('toString', () => {
            test('returns string number for eq option', () => {
                expect(new NumberMatcher({ eq: 5 }).toString()).toBe('5')
                expect(new NumberMatcher({ eq: 0 }).toString()).toBe('0')
                expect(new NumberMatcher({ eq: -10 }).toString()).toBe('-10')
            })

            test('returns range string for gte and lte options', () => {
                expect(new NumberMatcher({ gte: 5, lte: 10 }).toString()).toBe('>= 5 && <= 10')
                expect(new NumberMatcher({ gte: 0, lte: 100 }).toString()).toBe('>= 0 && <= 100')
            })

            test('returns gte string for gte option only', () => {
                expect(new NumberMatcher({ gte: 5 }).toString()).toBe('>= 5')
                expect(new NumberMatcher({ gte: 0 }).toString()).toBe('>= 0')
            })

            test('returns lte string for lte option only', () => {
                expect(new NumberMatcher({ lte: 10 }).toString()).toBe('<= 10')
                expect(new NumberMatcher({ lte: 0 }).toString()).toBe('<= 0')
            })

            test('returns error message for invalid options', () => {
                expect(new NumberMatcher({}).toString()).toBe('Incorrect number options provided')
            })
        })

        describe('toJSON', () => {
            test('returns number for eq option', () => {
                expect(new NumberMatcher({ eq: 5 }).toJSON()).toBe(5)
                expect(new NumberMatcher({ eq: 0 }).toJSON()).toBe(0)
                expect(new NumberMatcher({ eq: -10 }).toJSON()).toBe(-10)
            })

            test('returns string for range options', () => {
                expect(new NumberMatcher({ gte: 5, lte: 10 }).toJSON()).toBe('>= 5 && <= 10')
                expect(new NumberMatcher({ gte: 0, lte: 10 }).toJSON()).toBe('>= 0 && <= 10')
                expect(new NumberMatcher({ gte: 10, lte: 0 }).toJSON()).toBe('>= 10 && <= 0')
                expect(new NumberMatcher({ gte: 0, lte: 0 }).toJSON()).toBe('>= 0 && <= 0')
                expect(new NumberMatcher({ gte: -10, lte: -1 }).toJSON()).toBe('>= -10 && <= -1')
                expect(new NumberMatcher({ gte: 5 }).toJSON()).toBe('>= 5')
                expect(new NumberMatcher({ lte: 10 }).toJSON()).toBe('<= 10')
            })
        })
    })

    describe(validateNumberAndExtractOptions, () => {
        test('successfully extracts number literal configurations', () => {
            const result = validateNumberAndExtractOptions(5, { wait: 1000 })
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.match(5)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 1000 })
        })

        test('successfully extracts number literal 0', () => {
            const result = validateNumberAndExtractOptions(0, DEFAULT_OPTIONS)
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.match(0)).toBe(true)
            expect(result.commandOptions).toEqual(DEFAULT_OPTIONS)
        })

        test('successfully extracts number literal as gte', () => {
            const result = validateNumberAndExtractOptions({ gte: 0 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.match(0)).toBe(true)
            expect(result.commandOptions).toEqual(DEFAULT_OPTIONS)
        })

        test('successfully extracts number literal as lte', () => {
            const result = validateNumberAndExtractOptions({ lte: 0 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.match(0)).toBe(true)
            expect(result.commandOptions).toEqual(DEFAULT_OPTIONS)
        })

        test('successfully extracts valid interface configurations and returns remaining command options', () => {
            const result = validateNumberAndExtractOptions({ gte: 2, lte: 5, wait: 2000 }, DEFAULT_OPTIONS)
            expect(result.numberMatcher.match(3)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 2000, interval: 100, afterAssertion : DEFAULT_OPTIONS.afterAssertion, beforeAssertion: DEFAULT_OPTIONS.beforeAssertion })
        })

        test('support deprecated cases from NumberOptions', () => {
            // TODO dprevost to review
            expect(validateNumberAndExtractOptions({}, DEFAULT_OPTIONS)).toEqual({
                numberMatcher: new NumberMatcher({}),
                commandOptions: DEFAULT_OPTIONS
            })
            expect(validateNumberAndExtractOptions({ invalidKey: 10 } as any, DEFAULT_OPTIONS)).toEqual({
                numberMatcher: new NumberMatcher({}),
                commandOptions: { ...DEFAULT_OPTIONS, invalidKey: 10 }
            })
            expect(validateNumberAndExtractOptions({ wait: 10 }, DEFAULT_OPTIONS)).toEqual({
                numberMatcher: new NumberMatcher({}),
                commandOptions: { ...DEFAULT_OPTIONS, wait: 10 }
            })
        })

        test('throws error for empty or entirely invalid options objects', () => {
            expect(() => validateNumberAndExtractOptions(null as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
            expect(() => validateNumberAndExtractOptions(undefined as any, DEFAULT_OPTIONS)).toThrow(/Invalid NumberMatcher/)
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
            expect(result.numberMatcher.match(5)).toBe(true)
        })

        test('return default gte 1 when undefined is passed and supportUndefinedAsGteThen1 is true', () => {
            const result = validateNumberAndExtractOptions(undefined, {}, { supportDefaultAsGteThen1: true })
            expect(result.numberMatcher.match(1)).toBe(true)
            expect(result.numberMatcher.match(2)).toBe(true)
            expect(result.numberMatcher.match(0)).toBe(false)
        })

        test('return default gte 1 when {} is passed and supportUndefinedAsGteThen1 is true', () => {
            const result = validateNumberAndExtractOptions({}, {},  { supportDefaultAsGteThen1: true })
            expect(result.numberMatcher.match(1)).toBe(true)
            expect(result.numberMatcher.match(2)).toBe(true)
            expect(result.numberMatcher.match(0)).toBe(false)
        })

        test('merge with DEFAULT_OPTIONS and prioritizes number options over command options - wait only', () => {
            const result = validateNumberAndExtractOptions( { gte: 5, wait: 0 },  DEFAULT_OPTIONS)

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.match(5)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 0, interval: 100, afterAssertion : DEFAULT_OPTIONS.afterAssertion, beforeAssertion: DEFAULT_OPTIONS.beforeAssertion })
        })

        test('merge with DEFAULT_OPTIONS and prioritizes number options over command options - before/after assertions options', () => {
            const beforeAssertion = vi.fn().mockReturnValue(1)
            const afterAssertion = vi.fn().mockReturnValue(2)
            const result = validateNumberAndExtractOptions( { gte: 5, wait: 0, beforeAssertion, afterAssertion },  DEFAULT_OPTIONS)

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.match(5)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 0, interval: 100, afterAssertion, beforeAssertion })

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
            expect(result.numberMatcher.match(1)).toBe(true)
            expect(result.commandOptions).toEqual({ wait: 0, interval: 100, afterAssertion, beforeAssertion })

            expect(result.commandOptions?.beforeAssertion?.({} as any)).toBe(1)
            expect(result.commandOptions?.afterAssertion?.({} as any)).toBe(2)
            expect(beforeAssertion).toHaveBeenCalledTimes(1)
            expect(afterAssertion).toHaveBeenCalledTimes(1)
        })
    })

    describe('numberMatcherTester', () => {
        test('returns true/false when argument A is a NumberMatcher and argument B is a valid number', () => {
            const matcher = new NumberMatcher({ eq: 10 })
            expect(numberMatcherTester(matcher, 10)).toBe(true)
            expect(numberMatcherTester(matcher, 5)).toBe(false)
        })

        test('returns true/false symmetrically when argument B is a NumberMatcher and argument A is a valid number', () => {
            const matcher = new NumberMatcher({ gte: 5 })
            expect(numberMatcherTester(10, matcher)).toBe(true)
            expect(numberMatcherTester(3, matcher)).toBe(false)
        })

        test('returns undefined when neither argument is a NumberMatcher instance', () => {
            expect(numberMatcherTester(5, 10)).toBeUndefined()
            expect(numberMatcherTester('string', {})).toBeUndefined()
        })
    })
})
