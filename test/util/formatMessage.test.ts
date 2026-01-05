import { test, describe, beforeEach, expect } from 'vitest'
import { printDiffOrStringify, printExpected, printReceived } from 'jest-matcher-utils'

import { enhanceError, formatFailureMessage, numberError } from '../../src/util/formatMessage.js'
import type { CompareResult } from '../../src/utils.js'

describe('formatMessage', () => {
    describe(enhanceError, () => {
        describe('default', () => {
            let actual: string

            beforeEach(() => {
                actual = enhanceError(
                    'window',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'have title',
                    '',
                    '',
                    { message: '', containing: false }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Expect window to have title')
            })

            test('diff string', () => {
                const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual).toMatch(diffString)
            })
        })

        describe('isNot', () => {
            let actual: string

            describe('different', () => {
                beforeEach(() => {
                    actual = enhanceError(
                        'window',
                        'Test Expected',
                        'Test Actual',
                        { isNot: true },
                        'have title',
                        '',
                        '',
                        { message: '', containing: false }
                    )
                })

                test('starting message', () => {
                    expect(actual).toMatch('Expect window not to have title')
                })

                test('diff string', () => {
                    const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected [not]', 'Received      ', true)
                    expect(actual).toMatch(diffString)
                })
            })

            describe('same', () => {
                beforeEach(() => {
                    actual = enhanceError(
                        'window',
                        'Test Same',
                        'Test Same',
                        { isNot: true },
                        'have title',
                        '',
                        '',
                        { message: '', containing: false }
                    )
                })

                test('starting message', () => {
                    expect(actual).toMatch('Expect window not to have title')
                })

                test('diff string', () => {
                    const diffString = `Expected [not]: ${printExpected('Test Same')}\n` +
                        `Received      : ${printReceived('Test Same')}`
                    expect(actual).toMatch(diffString)
                })
            })

        })

        describe('containing', () => {
            let actual: string

            beforeEach(() => {
                actual = enhanceError(
                    'window',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'have title',
                    '',
                    '',
                    { message: '', containing: true }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Expect window to have title  containing')
            })

            test('diff string', () => {
                const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual).toMatch(diffString)
            })
        })

        describe('message', () => {
            let actual: string

            beforeEach(() => {
                actual = enhanceError(
                    'window',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'have title',
                    '',
                    '',
                    { message: 'Test Message', containing: false }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Test Message\nExpect window to have title')
            })

            test('diff string', () => {
                const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual).toMatch(diffString)
            })
        })

        describe('arg2', () => {
            let actual: string

            beforeEach(() => {
                actual = enhanceError(
                    'my-element',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'have property',
                    '',
                    'myProp',
                    { message: 'Test Message', containing: false }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Expect my-element to have property  myProp')
            })

            test('diff string', () => {
                const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual).toMatch(diffString)
            })
        })
    })

    describe(numberError, () => {
        test('should return correct message', () => {
            expect(numberError()).toBe('no params')
            expect(numberError({ eq: 0 })).toBe(0)
            expect(numberError({ gte: 1 })).toBe('>= 1')
            expect(numberError({ lte: 1 })).toBe(' <= 1')
            expect(numberError({ gte: 2, lte: 1 })).toBe('>= 2 && <= 1')
        })
    })
    describe(formatFailureMessage, () => {
        const subject = 'window'
        const expectation = 'title'
        const verb = 'have'
        const expectedValueArgument2 = 'myProp'

        const baseResult: CompareResult<string, string> = {
            result: false,
            actual: 'actual',
            expected: 'expected',
            instance: 'browser',
            value: 'actualValue'
        }
        const baseContext: ExpectWebdriverIO.MatcherContext = {
            isNot: false,
            expectation,
            verb,
            isMultiRemote: false
        }

        describe('Browser (not multi-remote) having single compareResults', () => {
            test('should return correct message', () => {
                const results = [baseResult]
                const context = { ...baseContext }

                const message = formatFailureMessage(subject, results, context, '', {})

                expect(message).toEqual(`\
Expect window to have title

Expected: "expected"
Received: "actual"`)
            })
        })

        describe('Multi-remote having multiple results', () => {
            test('should return correct message for multiple failures', () => {
                const results = [
                    {
                        ...baseResult,
                        actual: 'actual1',
                        expected: 'expected1',
                        instance: 'browserA'
                    },
                    {
                        ...baseResult,
                        actual: 'actual2',
                        expected: 'expected2',
                        instance: 'browserB'
                    }
                ]
                const context = {
                    ...baseContext,
                    isMultiRemote: true
                }

                const message = formatFailureMessage(subject, results, context, '', {})

                expect(message).toEqual(`\
Expect window to have title for remote "browserA"

Expected: "expected1"
Received: "actual1"

Expect window to have title for remote "browserB"

Expected: "expected2"
Received: "actual2"`)
            })
        })

        describe('Options', () => {
            test('should handle isNot', () => {
                const results = [{
                    ...baseResult,
                    result: true,
                    actual: 'actual',
                    expected: 'actual'
                }]
                const context = {
                    ...baseContext,
                    isNot: true
                }

                const message = formatFailureMessage(subject, results, context, '', {})

                expect(message).toEqual(`\
Expect window not to have title

Expected [not]: "actual"
Received      : "actual"`)
            })

            test('should handle message', () => {
                const results = [baseResult]
                const context = { ...baseContext, expectation: 'property' }

                const message = formatFailureMessage('my-element', results, context, expectedValueArgument2, { message: 'Custom Message', containing: false })

                expect(message).toEqual(`\
Custom Message
Expect my-element to have property myProp

Expected: "expected"
Received: "actual"`)
            })

            test('should handle containing', () => {
                const results = [baseResult]
                const context = { ...baseContext, expectation: 'property' }

                const message = formatFailureMessage('my-element', results, context, expectedValueArgument2, { message: '', containing: true })

                expect(message).toEqual(`\
Expect my-element to have property myProp containing

Expected: "expected"
Received: "actual"`)
            })

            test('should handle no verb', () => {
                const results = [baseResult]
                const context = { ...baseContext, expectation: 'exist', verb: '' }

                const message = formatFailureMessage('my-element', results, context)

                expect(message).toEqual(`\
Expect my-element to exist

Expected: "expected"
Received: "actual"`)
            })
        })
    })
})
