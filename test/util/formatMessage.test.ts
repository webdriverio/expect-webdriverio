import { test, describe, beforeEach, expect } from 'vitest'
import { printDiffOrStringify } from 'jest-matcher-utils'

import { enhanceError, enhanceErrorBe } from '../../src/util/formatMessage.js'
import stripAnsi from 'strip-ansi'
import { elementArrayFactory, elementFactory } from '../__mocks__/@wdio/globals.js'

describe('formatMessage', () => {
    describe(enhanceError, () => {
        describe('default', () => {
            let actualFailureMessage: string
            const expected = 'Test Expected Value'
            const actual = 'Test Actual Value'

            beforeEach(() => {
                actualFailureMessage = stripAnsi(enhanceError(
                    'window',
                    expected,
                    actual,
                    { isNot: false },
                    'have',
                    'title',
                ))
            })

            test('message', () => {
                expect(actualFailureMessage).toEqual(`\
Expect window to have title

Expected: "Test Expected Value"
Received: "Test Actual Value"`)
            })

            test('diff string', () => {
                const diffString = stripAnsi(printDiffOrStringify('Test Expected Value', 'Test Actual Value', 'Expected', 'Received', true))
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
                    actualFailureMessage = stripAnsi(enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'title'
                    ))
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
                    actualFailureMessage = stripAnsi(enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'title',
                        '',
                        { message: '', containing: true }
                    ))
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
                    actualFailureMessage = stripAnsi(enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'title',
                        '',
                        { message: '', containing: true }
                    ))
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
                actualFailureMessage = stripAnsi(enhanceError(
                    'window',
                    'Test Expected Value',
                    'Test Actual Value',
                    { isNot: false },
                    'have',
                    'title',
                    '',
                    { message: customPrefixMessage, containing: false }
                ))
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
                    actualFailureMessage = stripAnsi(enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'property',
                        expectedArg2,
                    ))
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
                    actualFailureMessage = stripAnsi(enhanceError(
                        'window',
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'property',
                        expectedArg2,
                    ))
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

            expect(stripAnsi(result)).toEqual(`\
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

            expect(stripAnsi(result)).toEqual(`\
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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

Expected [not]: ["Test Expected Value 1", "Test Expected Value 2"]
Received      : ["Test Expected Value 1", "Test Expected Value 2"]`
                    )
                })

                test('First elements failure then only first values are highlighted as failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Expected Value 1', 'Test Actual Value 2']

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

                    // TODO: Error message is ambigious, will be fixed with support of $$.
                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

- Expected [not]  - 1
+ Received        + 1

  Array [
    "Test Expected Value 1",
-   "Test Expected Value 2",
+   "Test Actual Value 2",
  ]`
                    )
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

                    // TODO: Error message is ambigious, will be fixed with support of $$.
                    expect(stripAnsi(actualFailureMessage)).toEqual(`\
Expect ${elementName} not to have text

- Expected [not]  - 1
+ Received        + 1

  Array [
-   "Test Expected Value 1",
+   "Test Actual Value 1",
    "Test Expected Value 2",
  ]`
                    )
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
                const message = stripAnsi(enhanceErrorBe(subject, { isNot, verb, expectation }, options ))
                expect(message).toEqual(`\
Expect $(\`element\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
            })

            test('with custom message', () => {
                const customMessage = 'Custom Error Message'
                const message = stripAnsi(enhanceErrorBe(subject, { isNot, verb, expectation }, { ...options, message: customMessage }))
                expect(message).toEqual(`\
Custom Error Message
Expect $(\`element\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
            })

            test('when isNot is true and failure with result having pass=true (inverted later by Jest)', () => {
                const isNot = true
                const message = stripAnsi(enhanceErrorBe(subject, { isNot, verb, expectation }, options))
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
                const result = await enhanceErrorBe(subject as any, { isNot, verb, expectation }, options)

                expect(stripAnsi(result)).toEqual(`\
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
                const result = await enhanceErrorBe(subject as any, { isNot: true, verb, expectation }, options)

                expect(stripAnsi(result)).toEqual(`\
Expect ${selectorName} not to be displayed

Expected: "not displayed"
Received: "displayed"`)
            })
        })

        describe('given multiple elements', () => {
            const elements = elementArrayFactory('elements', 2)
            const elementName = '$$(`elements`)'

            describe('elements when isNot is false', () => {
                const isNot = false
                test('all elements failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Actual Value 1', 'Test Actual Value 2']

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

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

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

Expected [not]: ["Test Expected Value 1", "Test Expected Value 2"]
Received      : ["Test Expected Value 1", "Test Expected Value 2"]`
                    )
                })

                test('First elements failure then only first values are highlighted as failure', () => {
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Expected Value 1', 'Test Actual Value 2']

                    const actualFailureMessage = stripAnsi(enhanceError(
                        elements,
                        expected,
                        actual,
                        { isNot },
                        'have',
                        'text',
                    ))

                    expect(actualFailureMessage).toEqual(`\
Expect ${elementName} not to have text

- Expected [not]  - 1
+ Received        + 1

  Array [
    "Test Expected Value 1",
-   "Test Expected Value 2",
+   "Test Actual Value 2",
  ]`
                    )
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

                    expect(stripAnsi(actualFailureMessage)).toEqual(`\
Expect ${elementName} not to have text

- Expected [not]  - 1
+ Received        + 1

  Array [
-   "Test Expected Value 1",
+   "Test Actual Value 1",
    "Test Expected Value 2",
  ]`
                    )

                })
            })

            describe('given subject is Element[]', () => {
                test('should return element selector name inside the array', async () => {
                    const arrayOfElements = [elementFactory('element1'), elementFactory('element2')]
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Actual Value 1', 'Test Expected Value 2']

                    const actualFailureMessage = enhanceError(
                        arrayOfElements,
                        expected,
                        actual,
                        { isNot: false },
                        'have',
                        'text',
                    )
                    expect(stripAnsi(actualFailureMessage)).toEqual(`\
Expect [$(\`element1\`),$(\`element2\`)] to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "Test Expected Value 1",
+   "Test Actual Value 1",
    "Test Expected Value 2",
  ]`
                    )
                })

                test('should return element selector name truncated when array of elements is too long', async () => {
                    const arrayOfElements = Array(100).fill(null).map((_, index) => elementFactory(`element${index + 1}`))
                    const expected = ['Test Expected Value 1', 'Test Expected Value 2']
                    const actual = ['Test Actual Value 1', 'Test Expected Value 2']

                    const actualFailureMessage = enhanceError(
                        arrayOfElements,
                        expected,
                        actual,
                        { isNot: false },
                        'have',
                        'text',
                    )
                    expect(stripAnsi(actualFailureMessage)).toEqual(`\
Expect [$(\`element1\`),$(\`element2\`),$(\`element3\`),$(\`element4\`),$(\`element5\`),$(\`element6\`),$(\`element7\`),$... to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "Test Expected Value 1",
+   "Test Actual Value 1",
    "Test Expected Value 2",
  ]`
                    )
                })
            })
        })
    })
})
