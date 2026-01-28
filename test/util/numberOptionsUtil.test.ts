import { test, describe, expect } from 'vitest'
import {
    isNumber,
    validateNumberOptions,
    validateNumberOptionsArray,
    NumberMatcher,
    numberMatcherTester
} from '../../src/util/numberOptionsUtil.js'

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

    describe(validateNumberOptions, () => {
        test('converts plain number to NumberMatcher with eq option', () => {
            const result = validateNumberOptions(5)

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.equals(5)).toBe(true)
            expect(result.numberMatcher.toString()).toBe('5')
            expect(result.numberCommandOptions).toBeUndefined()
        })

        test('converts NumberOptions with eq to NumberMatcher and extract command options', () => {
            const result = validateNumberOptions({ eq: 10, wait: 2000, interval: 100 })

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.equals(10)).toBe(true)
            expect(result.numberCommandOptions).toEqual({ wait: 2000, interval: 100 })
        })

        test('converts NumberOptions with gte to NumberMatcher', () => {
            const result = validateNumberOptions({ gte: 5 })

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.equals(5)).toBe(true)
            expect(result.numberMatcher.equals(10)).toBe(true)
            expect(result.numberMatcher.equals(4)).toBe(false)
        })

        test('converts NumberOptions with lte to NumberMatcher', () => {
            const result = validateNumberOptions({ lte: 10 })

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.equals(10)).toBe(true)
            expect(result.numberMatcher.equals(5)).toBe(true)
            expect(result.numberMatcher.equals(11)).toBe(false)
        })

        test('converts NumberOptions with gte and lte to NumberMatcher', () => {
            const result = validateNumberOptions({ gte: 5, lte: 10 })

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(result.numberMatcher.equals(5)).toBe(true)
            expect(result.numberMatcher.equals(7)).toBe(true)
            expect(result.numberMatcher.equals(10)).toBe(true)
            expect(result.numberMatcher.equals(4)).toBe(false)
            expect(result.numberMatcher.equals(11)).toBe(false)
        })

        test('throws error for invalid options', () => {
            expect(() => validateNumberOptions({} as any)).toThrow('Invalid NumberOptions. Received: {}')
            expect(() => validateNumberOptions(null as any)).toThrow('Invalid NumberOptions. Received: null')
            expect(() => validateNumberOptions({ wait: 1000 } as any)).toThrow('Invalid NumberOptions')
        })
    })

    describe(validateNumberOptionsArray, () => {
        test('converts array of numbers to array of NumberMatchers', () => {
            const result = validateNumberOptionsArray([1, 2, 3])

            expect(Array.isArray(result.numberMatcher)).toBe(true)
            expect(result.numberMatcher).toHaveLength(3)
            expect((result.numberMatcher as NumberMatcher[])[0].equals(1)).toBe(true)
            expect((result.numberMatcher as NumberMatcher[])[1].equals(2)).toBe(true)
            expect((result.numberMatcher as NumberMatcher[])[2].equals(3)).toBe(true)
            expect(result.numberCommandOptions).toBeUndefined()
        })

        test('converts array of NumberOptions to array of NumberMatchers', () => {
            const result = validateNumberOptionsArray([{ eq: 1 }, { gte: 5 }, { lte: 10 }])

            expect(Array.isArray(result.numberMatcher)).toBe(true)
            expect(result.numberMatcher).toHaveLength(3)
            expect((result.numberMatcher as NumberMatcher[])[0].equals(1)).toBe(true)
            expect((result.numberMatcher as NumberMatcher[])[1].equals(5)).toBe(true)
            expect((result.numberMatcher as NumberMatcher[])[2].equals(10)).toBe(true)
        })

        test('converts single number to NumberMatcher', () => {
            const result = validateNumberOptionsArray(5)

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect((result.numberMatcher as NumberMatcher).equals(5)).toBe(true)
        })

        test('converts single NumberOptions to NumberMatcher', () => {
            const result = validateNumberOptionsArray({ gte: 5, lte: 10 })

            expect(result.numberMatcher).toBeInstanceOf(NumberMatcher)
            expect((result.numberMatcher as NumberMatcher).equals(7)).toBe(true)
        })

        test('converts single NumberOptions to command options', () => {
            const  { numberMatcher, numberCommandOptions } = validateNumberOptionsArray({ gte: 5, lte: 10, wait: 2000, interval: 100 })

            expect(numberMatcher).toBeInstanceOf(NumberMatcher)
            expect(numberCommandOptions).toEqual({ wait: 2000, interval: 100 })
        })

        test('Does not converts multiple NumberOptions to command options since it is not supported', () => {
            const  { numberMatcher, numberCommandOptions } = validateNumberOptionsArray([{ gte: 5, lte: 10, wait: 2000, interval: 100 }])

            expect(numberMatcher).toBeInstanceOf(Array)
            expect(numberCommandOptions).toBeUndefined()
        })
    })

    describe(NumberMatcher, () => {
        describe('equals', () => {
            test('returns false for undefined', () => {
                const matcher = new NumberMatcher({ eq: 5 })
                expect(matcher.equals(undefined)).toBe(false)
            })

            describe('with eq option', () => {
                test('returns true for exact match', () => {
                    const matcher = new NumberMatcher({ eq: 5 })
                    expect(matcher.equals(5)).toBe(true)
                })

                test('returns false for non-match', () => {
                    const matcher = new NumberMatcher({ eq: 5 })
                    expect(matcher.equals(4)).toBe(false)
                    expect(matcher.equals(6)).toBe(false)
                })

                test('works with 0', () => {
                    const matcher = new NumberMatcher({ eq: 0 })
                    expect(matcher.equals(0)).toBe(true)
                    expect(matcher.equals(1)).toBe(false)
                })
            })

            describe('with gte option', () => {
                test('returns true for values greater than or equal', () => {
                    const matcher = new NumberMatcher({ gte: 5 })
                    expect(matcher.equals(5)).toBe(true)
                    expect(matcher.equals(6)).toBe(true)
                    expect(matcher.equals(100)).toBe(true)
                })

                test('returns false for values less than', () => {
                    const matcher = new NumberMatcher({ gte: 5 })
                    expect(matcher.equals(4)).toBe(false)
                    expect(matcher.equals(0)).toBe(false)
                })
            })

            describe('with lte option', () => {
                test('returns true for values less than or equal', () => {
                    const matcher = new NumberMatcher({ lte: 10 })
                    expect(matcher.equals(10)).toBe(true)
                    expect(matcher.equals(9)).toBe(true)
                    expect(matcher.equals(0)).toBe(true)
                })

                test('returns false for values greater than', () => {
                    const matcher = new NumberMatcher({ lte: 10 })
                    expect(matcher.equals(11)).toBe(false)
                    expect(matcher.equals(100)).toBe(false)
                })
            })

            describe('with gte and lte options', () => {
                test('returns true for values in range', () => {
                    const matcher = new NumberMatcher({ gte: 5, lte: 10 })
                    expect(matcher.equals(5)).toBe(true)
                    expect(matcher.equals(7)).toBe(true)
                    expect(matcher.equals(10)).toBe(true)
                })

                test('returns false for values outside range', () => {
                    const matcher = new NumberMatcher({ gte: 5, lte: 10 })
                    expect(matcher.equals(4)).toBe(false)
                    expect(matcher.equals(11)).toBe(false)
                })
            })

            describe('with no options', () => {
                test('returns false for any value', () => {
                    const matcher = new NumberMatcher({})
                    expect(matcher.equals(0)).toBe(false)
                    expect(matcher.equals(5)).toBe(false)
                    expect(matcher.equals(100)).toBe(false)
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
                expect(new NumberMatcher({ gte: 5 }).toJSON()).toBe('>= 5')
                expect(new NumberMatcher({ lte: 10 }).toJSON()).toBe('<= 10')
            })

            test('serializes correctly with JSON.stringify', () => {
                expect(JSON.stringify(new NumberMatcher({ eq: 5 }))).toBe('5')
                expect(JSON.stringify(new NumberMatcher({ gte: 5, lte: 10 }))).toBe('">= 5 && <= 10"')
                expect(JSON.stringify([new NumberMatcher({ eq: 1 }), new NumberMatcher({ eq: 2 })])).toBe('[1,2]')
            })
        })
    })

    describe(numberMatcherTester, () => {
        test('returns true when NumberMatcher matches number', () => {
            const matcher = new NumberMatcher({ eq: 5 })

            expect(numberMatcherTester(matcher, 5)).toBe(true)
            expect(numberMatcherTester(5, matcher)).toBe(true)
        })

        test('returns false when NumberMatcher does not match number', () => {
            const matcher = new NumberMatcher({ eq: 5 })

            expect(numberMatcherTester(matcher, 10)).toBe(false)
            expect(numberMatcherTester(10, matcher)).toBe(false)
        })

        test('works with range matchers', () => {
            const matcher = new NumberMatcher({ gte: 5, lte: 10 })

            expect(numberMatcherTester(matcher, 7)).toBe(true)
            expect(numberMatcherTester(7, matcher)).toBe(true)
            expect(numberMatcherTester(matcher, 3)).toBe(false)
            expect(numberMatcherTester(3, matcher)).toBe(false)
        })

        test('returns undefined for non-NumberMatcher comparisons', () => {
            expect(numberMatcherTester(5, 5)).toBeUndefined()
            expect(numberMatcherTester('5', 5)).toBeUndefined()
            expect(numberMatcherTester({}, 5)).toBeUndefined()
            expect(numberMatcherTester(null, 5)).toBeUndefined()
        })

        test('returns undefined when both are NumberMatchers', () => {
            const matcher1 = new NumberMatcher({ eq: 5 })
            const matcher2 = new NumberMatcher({ eq: 5 })

            expect(numberMatcherTester(matcher1, matcher2)).toBeUndefined()
        })

        test('returns undefined when neither is a number', () => {
            const matcher = new NumberMatcher({ eq: 5 })

            expect(numberMatcherTester(matcher, '5')).toBeUndefined()
            expect(numberMatcherTester(matcher, null)).toBeUndefined()
            expect(numberMatcherTester(matcher, undefined)).toBeUndefined()
        })
    })
})
