import { test, describe, beforeEach, expect, vi } from 'vitest'
import { INVERTED_COLOR, printDiffOrStringify } from 'jest-matcher-utils'

import { enhanceError, enhanceErrorBe } from '../../src/util/formatMessage.js'
import { elementArrayFactory, elementFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('jest-matcher-utils', async (importActual) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importActual<typeof import('jest-matcher-utils')>()
    return {
        ...actual,
        INVERTED_COLOR: vi.fn(actual.INVERTED_COLOR)
    }
})

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

        test.for([
            { actual: undefined, selectorName: 'undefined' },
            { actual: null, selectorName: 'null' },
            { actual: true, selectorName: 'true' },
            { actual: 5, selectorName: '5' },
            { actual: 'test', selectorName: 'test' },
            { actual: {}, selectorName: '{}' },
            { actual: ['1', '2'], selectorName: '["1","2"]' },
        ])('should return failure message for unsupported type $actual when isNot is false', async ({ actual, selectorName }) => {
            const result = await enhanceError(actual as any, 'webdriverio', undefined, { isNot: false }, 'have', 'text')

            expect(result).toEqual(`\
Expect ${selectorName} to have text

Expected: "webdriverio"
Received: undefined`)
        })

        test.for([
            { actual: undefined, selectorName: 'undefined' },
            { actual: null, selectorName: 'null' },
            { actual: true, selectorName: 'true' },
            { actual: 5, selectorName: '5' },
            { actual: 'test', selectorName: 'test' },
            { actual: {}, selectorName: '{}' },
            { actual: ['1', '2'], selectorName: '["1","2"]' },
        ])('should return failure message for unsupported type $actual when isNot is true', async ({ actual, selectorName }) => {
            const result = await enhanceError(actual as any, 'webdriverio', undefined, { isNot: true }, 'have', 'text')

            expect(result).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: "webdriverio"
Received      : undefined`)
        })

        describe('given multiple elements', () => {
            const elements = elementArrayFactory('elements', 2)
            const elementName = '$$(`elements`)'

            describe('elements when isNot is false', () => {
                const isNot = false
                test('all elements failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Actual Value 1', 'Test Actual Value 2']

                    const actualFailureMessage = enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    )

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "Test Expected Value 1",
-   "Test Expected Value 2",
+   "Test Actual Value 1",
+   "Test Actual Value 2",
  ]`)
                })

                test('First elements failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Actual Value 1', 'Test Expected Value 2']

                    const actualFailureMessage = enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    )

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "Test Expected Value 1",
+   "Test Actual Value 1",
    "Test Expected Value 2",
  ]`)
                })

                test('Seconds elements failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Expected Value 1', 'Test Actual Value 2']

                    const actualFailureMessage = enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    )

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} to have text

- Expected  - 1
+ Received  + 1

  Array [
    "Test Expected Value 1",
-   "Test Expected Value 2",
+   "Test Actual Value 2",
  ]`)
                })
            })

            describe('elements when isNot is true', () => {
                const isNot = true
                test('all elements failure then all values are highlighted as failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Expected Value 1', 'Test Expected Value 2']

                    const actualFailureMessage = enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    )

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

Expected [not]: ["Test Expected Value 1", "Test Expected Value 2"]
Received      : ["Test Expected Value 1", "Test Expected Value 2"]`
                    )

                    expect(INVERTED_COLOR).toHaveBeenCalledTimes(4)
                })

                test('First elements failure then only first values are highlighted as failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Expected Value 1', 'Test Actual Value 2']

                    const actualFailureMessage = enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    )

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

Expected [not]: ["Test Expected Value 1", "Test Expected Value 2"]
Received      : ["Test Expected Value 1", "Test Actual Value 2"]`
                    )

                    expect(INVERTED_COLOR).toHaveBeenCalledTimes(2)
                    expect(INVERTED_COLOR).toHaveBeenNthCalledWith(1, '"Test Expected Value 1"')
                    expect(INVERTED_COLOR).toHaveBeenNthCalledWith(2, '"Test Expected Value 1"')
                })

                test('Second elements failure then only second values are highlighted as failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Actual Value 1', 'Test Expected Value 2']

                    const actualFailureMessage = enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    )

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

Expected [not]: ["Test Expected Value 1", "Test Expected Value 2"]
Received      : ["Test Actual Value 1", "Test Expected Value 2"]`
                    )

                    expect(INVERTED_COLOR).toHaveBeenCalledTimes(2)
                    expect(INVERTED_COLOR).toHaveBeenNthCalledWith(1, '"Test Expected Value 2"')
                    expect(INVERTED_COLOR).toHaveBeenNthCalledWith(2, '"Test Expected Value 2"')
                })
            })
        })
    })

    describe(enhanceErrorBe, () => {
        const verb = 'be'
        const expectation = 'displayed'
        const options = {}

        describe('given a single element', () => {
            const subject = elementFactory('element')

            const isNot = false
            test('when isNot is false and failure with result having pass=false', () => {
                const message = enhanceErrorBe(subject, [false], { isNot, verb, expectation }, options )
                expect(message).toEqual(`\
Expect $(\`element\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
            })

            test('with custom message', () => {
                const customMessage = 'Custom Error Message'
                const message = enhanceErrorBe(subject, [false], { isNot, verb, expectation }, { ...options, message: customMessage })
                expect(message).toEqual(`\
Custom Error Message
Expect $(\`element\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
            })

            test('when isNot is true and failure with result having pass=true (inverted later by Jest)', () => {
                const isNot = true
                const message = enhanceErrorBe(subject, [true], { isNot, verb, expectation }, options)
                expect(message).toEqual(`\
Expect $(\`element\`) not to be displayed

Expected: "not displayed"
Received: "displayed"`)

            })

            test('when isNot is true and failure with result having pass=true (inverted later by Jest)', () => {
                const isNot = true
                const message = enhanceErrorBe(subject, [true], { isNot, verb, expectation }, options)
                expect(message).toEqual(`\
Expect $(\`element\`) not to be displayed

Expected: "not displayed"
Received: "displayed"`)

            })

            test.for([
                { actual: undefined, selectorName: 'undefined' },
                { actual: null, selectorName: 'null' },
                { actual: true, selectorName: 'true' },
                { actual: 5, selectorName: '5' },
                { actual: 'test', selectorName: 'test' },
                { actual: {}, selectorName: '{}' },
                { actual: ['1', '2'], selectorName: '["1","2"]' },
            ])('should return failure message for unsupported type $actual when isNot is false and not result from element function call', async ({ actual: subject, selectorName }) => {
                const result = await enhanceErrorBe(subject as any,  [], { isNot, verb, expectation }, options)

                expect(result).toEqual(`\
Expect ${selectorName} to be displayed

Expected: "displayed"
Received: "not displayed"`)
            })

            test.for([
                { actual: undefined, selectorName: 'undefined' },
                { actual: null, selectorName: 'null' },
                { actual: true, selectorName: 'true' },
                { actual: 5, selectorName: '5' },
                { actual: 'test', selectorName: 'test' },
                { actual: {}, selectorName: '{}' },
                { actual: ['1', '2'], selectorName: '["1","2"]' },
            ])('should return failure message for unsupported type $actual when isNot is true and not result from element function call', async ({ actual: subject, selectorName }) => {
                const result = await enhanceErrorBe(subject as any, [], { isNot: true, verb, expectation }, options)

                expect(result).toEqual(`\
Expect ${selectorName} not to be displayed

Expected: "not displayed"
Received: "displayed"`)
            })
        })

        describe('given multiples elements', () => {
            const subject = elementArrayFactory('elements', 2)

            describe('when isNot is false', () => {
                const isNot = false

                test('failure with all results having pass=false', () => {
                    const message = enhanceErrorBe(subject, [false, false], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect $$(\`elements\`) to be displayed

- Expected  - 2
+ Received  + 2

  Array [
-   "displayed",
-   "displayed",
+   "not displayed",
+   "not displayed",
  ]`)
                })

                test('failure with first results having pass=true', () => {
                    const message = enhanceErrorBe(subject, [true, false], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect $$(\`elements\`) to be displayed

- Expected  - 1
+ Received  + 1

  Array [
    "displayed",
-   "displayed",
+   "not displayed",
  ]`)
                })

                test('failure with second results having pass=true', () => {
                    const message = enhanceErrorBe(subject, [false, true], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect $$(\`elements\`) to be displayed

- Expected  - 1
+ Received  + 1

  Array [
-   "displayed",
+   "not displayed",
    "displayed",
  ]`)
                })

                test('when no element', () => {
                    const message = enhanceErrorBe([], [], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect [] to be displayed

Expected: "at least one result"
Received: []`)
                })
            })

            describe('when isNot is true where failure are pass=true since Jest inverts the result', () => {
                const isNot = true

                test('failure with all results having pass=true', () => {
                    const message = enhanceErrorBe(subject, [true, true], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect $$(\`elements\`) not to be displayed

- Expected  - 2
+ Received  + 2

  Array [
-   "not displayed",
-   "not displayed",
+   "displayed",
+   "displayed",
  ]`)
                })

                test('failure with first results having success pass=false (inverted later)', () => {
                    const message = enhanceErrorBe(subject, [false, true], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect $$(\`elements\`) not to be displayed

- Expected  - 1
+ Received  + 1

  Array [
    "not displayed",
-   "not displayed",
+   "displayed",
  ]`)
                })

                test('failure with second results having success pass=false (inverted later)', () => {
                    const message = enhanceErrorBe(subject, [true, false], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect $$(\`elements\`) not to be displayed

- Expected  - 1
+ Received  + 1

  Array [
-   "not displayed",
+   "displayed",
    "not displayed",
  ]`)
                })

                test('when no elements', () => {
                    const message = enhanceErrorBe([], [], { isNot, verb, expectation }, options )
                    expect(message).toEqual(`\
Expect [] not to be displayed

Expected: "at least one result"
Received: []`)
                })
            })
        })
    })
})
