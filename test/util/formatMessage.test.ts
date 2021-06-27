import { printDiffOrStringify } from 'jest-matcher-utils';

import { enhanceError } from '../../src/util/formatMessage'

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
                expect(actual.includes('Expect Test Subject to Test Verb Test Expectation')).toBe(true)
            })

            test('diff string', () => {
                let diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual.includes(diffString)).toBe(true)
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
                expect(actual.includes('Expect Test Subject to Test Verb Test Expectation containing')).toBe(true)
            })

            test('diff string', () => {
                let diffString = printDiffOrStringify('Test Expected', 'Test Actual', 'Expected', 'Received', true)
                expect(actual.includes(diffString)).toBe(true)
            })
        })
    })
})
