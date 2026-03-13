import { test, describe, beforeEach, expect } from 'vitest'
import { printDiffOrStringify } from 'jest-matcher-utils'

import { enhanceError, enhanceErrorBe, numberError } from '../../src/util/formatMessage.js'

describe('formatMessage', () => {
    describe(enhanceError, () => {
        describe('default', () => {
            let actualFailureMessage: string
            const expected = 'Test Expected Value'
            const actual = 'Test Actual Value'

            beforeEach(() => {
                actualFailureMessage = enhanceError(
                    'window',
                    expected,
                    actual,
                    { isNot: false },
                    'have',
                    'title',
                )
            })

            test('message', () => {
                expect(actualFailureMessage).toEqual(`\
Expect window to have title

Expected: "Test Expected Value"
Received: "Test Actual Value"`)
            })

            test('diff string', () => {
                const diffString = printDiffOrStringify('Test Expected Value', 'Test Actual Value', 'Expected', 'Received', true)
                expect(diffString).toEqual(`\
Expected: "Test Expected Value"
Received: "Test Actual Value"`)
                expect(actualFailureMessage).toMatch(diffString)
            })
        })

        describe('isNot', () => {
            let actualFailureMessage: string
            const isNot = true

            describe('same', () => {
                const expected = 'Test Same'
                const actual = expected

                beforeEach(() => {
                    actualFailureMessage = enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'title'
                    )
                })

                test('message', () => {
                    expect(actualFailureMessage).toEqual(`\
Expect window not to have title

Expected [not]: "Test Same"
Received      : "Test Same"`)
                })

                test('diff string', () => {
                    const diffString = `\
Expected [not]: "Test Same"
Received      : "Test Same"`
                    expect(actualFailureMessage).toMatch(diffString)
                })
            })
        })

        describe('containing', () => {
            let actualFailureMessage: string

            describe('isNot false', () => {
                const expected = 'Test Expected Value'
                const actual = 'Test Actual Value'
                const isNot = false

                beforeEach(() => {
                    actualFailureMessage = enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'title',
                        '',
                        { message: '', containing: true }
                    )
                })

                test('message', () => {
                    expect(actualFailureMessage).toEqual(`\
Expect window to have title containing

Expected: "Test Expected Value"
Received: "Test Actual Value"`)
                })
            })

            describe('isNot true', () => {
                const expected = 'same value'
                const actual = expected
                const isNot = true

                beforeEach(() => {
                    actualFailureMessage = enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'title',
                        '',
                        { message: '', containing: true }
                    )
                })

                test('message', () => {
                    expect(actualFailureMessage).toEqual(`\
Expect window not to have title containing

Expected [not]: "same value"
Received      : "same value"`)
                })
            })
        })

        describe('custom message', () => {
            let actualFailureMessage: string
            const customPrefixMessage = 'Test Message'

            beforeEach(() => {
                actualFailureMessage = enhanceError(
                    'window',
                    'Test Expected Value',
                    'Test Actual Value',
                    { isNot: false },
                    'have',
                    'title',
                    '',
                    { message: customPrefixMessage, containing: false }
                )
            })

            test('message', () => {
                expect(actualFailureMessage).toEqual(`\
Test Message
Expect window to have title

Expected: "Test Expected Value"
Received: "Test Actual Value"`)
            })
        })

        describe('Expected Value Argument 2', () => {
            let actualFailureMessage: string
            const expectedArg2 = 'myPropertyName'

            describe('isNot false', () => {
                const expected = 'Expected Property Value'
                const actual = 'Actual Property Value'
                const isNot = false

                beforeEach(() => {
                    actualFailureMessage = enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'property',
                        expectedArg2,
                    )
                })

                test('message', () => {
                    expect(actualFailureMessage).toEqual(`\
Expect window to have property myPropertyName

Expected: "Expected Property Value"
Received: "Actual Property Value"`)
                })
            })

            describe('isNot true', () => {
                const expected = 'Expected Property Value'
                const actual = 'Actual Property Value'
                const isNot = true

                beforeEach(() => {
                    actualFailureMessage = enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'property',
                        expectedArg2,
                    )
                })

                test('message', () => {
                    expect(actualFailureMessage).toEqual(`\
Expect window not to have property myPropertyName

Expected [not]: "Expected Property Value"
Received      : "Actual Property Value"`)
                })
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

    describe(enhanceErrorBe, () => {
        const subject = 'element'
        const verb = 'be'
        const expectation = 'displayed'
        const options = {}

        const isNot = false
        test('when isNot is false', () => {
            const message = enhanceErrorBe(subject, { isNot, verb, expectation }, options )
            expect(message).toEqual(`\
Expect element to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })

        test('with custom message', () => {
            const customMessage = 'Custom Error Message'
            const message = enhanceErrorBe(subject, { isNot, verb, expectation }, { ...options, message: customMessage })
            expect(message).toEqual(`\
Custom Error Message
Expect element to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })

        test('when isNot is true', () => {
            const isNot = true
            const message = enhanceErrorBe(subject, { isNot, verb, expectation }, options)
            expect(message).toEqual(`\
Expect element not to be displayed

Expected: "not displayed"
Received: "displayed"`)

        })
    })
})
