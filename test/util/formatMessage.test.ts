import { test, describe, beforeEach, expect } from 'vitest'
import { printDiffOrStringify, printExpected, printReceived } from 'jest-matcher-utils';

import { enhanceError } from '../../src/util/formatMessage.js'

describe('formatMessage', () => {
    describe('enhanceError', () => {
        describe('default', () => {
            let actual: string

            beforeEach(() => {
                actual = enhanceError(
                    'Test Subject',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'Test Verb',
                    'Test Expectation',
                    '',
                    { message: '', containing: false }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Expect Test Subject to Test Verb Test Expectation')
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
                        'Test Subject',
                        'Test Expected',
                        'Test Actual',
                        { isNot: true },
                        'Test Verb',
                        'Test Expectation',
                        '',
                        { message: '', containing: false }
                    )
                })

                test('starting message', () => {
                    expect(actual).toMatch("Expect Test Subject not to Test Verb Test Expectation")
                })

                test('diff string', () => {
                    const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected [not]', 'Received      ', true)
                    expect(actual).toMatch(diffString)
                })
            })

            describe('same', () => {
                beforeEach(() => {
                    actual = enhanceError(
                        'Test Subject',
                        'Test Same',
                        'Test Same',
                        { isNot: true },
                        'Test Verb',
                        'Test Expectation',
                        '',
                        { message: '', containing: false }
                    )
                })

                test('starting message', () => {
                    expect(actual).toMatch("Expect Test Subject not to Test Verb Test Expectation")
                })

                test('diff string', () => {
                    const diffString = `Expected [not]: ${printExpected("Test Same")}\n` +
                        `Received      : ${printReceived("Test Same")}`
                    expect(actual).toMatch(diffString)
                })
            })

        })

        describe('containing', () => {
            let actual: string

            beforeEach(() => {
                actual = enhanceError(
                    'Test Subject',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'Test Verb',
                    'Test Expectation',
                    '',
                    { message: '', containing: true }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Expect Test Subject to Test Verb Test Expectation containing')
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
                    'Test Subject',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'Test Verb',
                    'Test Expectation',
                    '',
                    { message: 'Test Message', containing: false }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Test Message\nExpect Test Subject to Test Verb Test Expectation')
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
                    'Test Subject',
                    'Test Expected',
                    'Test Actual',
                    { isNot: false },
                    'Test Verb',
                    'Test Expectation',
                    'Test Arg2',
                    { message: 'Test Message', containing: false }
                )
            })

            test('starting message', () => {
                expect(actual).toMatch('Expect Test Subject to Test Verb Test Expectation Test Arg2')
            })

            test('diff string', () => {
                const diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual).toMatch(diffString)
            })
        })
    })
})
