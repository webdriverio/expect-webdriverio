import { $, $$ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toHaveElementClass } from '../../../src/matchers/element/toHaveElementClass.js'
import type { AssertionResult } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'

import { multiRemote } from '../../../src/api/index.js'
import { oneOf } from '../../../src/matchers/asymmetrics/oneOf.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteElementsCommand, mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
vi.mock('@wdio/globals')

describe(toHaveElementClass, () => {

    let thisContext: { toHaveElementClass: typeof toHaveElementClass }
    let thisNotContext: { isNot: true; toHaveElementClass: typeof toHaveElementClass }

    beforeEach(() => {
        thisContext = { toHaveElementClass }
        thisNotContext = { isNot: true, toHaveElementClass }
    })

    describe('given a single element', () => {
        let el: WebdriverIO.Element

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockImplementation(async (attribute: string) => {
                if (attribute === 'class') {
                    return 'some-class another-class yet-another-class'
                }
                return null
            })
        })

        test('success when class name is present', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveElementClass(el, 'some-class', { wait: 0, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 },
                result
            })
        })

        test('failure when an asymmetric matcher needs the spaces between the classes', async () => {
            // each class is compared: no class has a space in it
            const result = await thisContext.toHaveElementClass(el, expect.stringContaining('some-class '), { wait: 0 })
            expect(result.pass).toBe(false)

            const result2 = await thisContext.toHaveElementClass(el, expect.stringContaining(' another-class '), { wait: 0 })
            expect(result2.pass).toBe(false)

            const result3 = await thisContext.toHaveElementClass(el, expect.stringContaining('another-class'), { wait: 0 })
            expect(result3.pass).toBe(true)
        })

        test('success with expect.oneOf() of asymmetric matchers', async () => {
            const result = await thisContext.toHaveElementClass(el, oneOf(expect.stringContaining('some-class'), expect.stringContaining('another-class')))

            expect(result.pass).toBe(true)
        })

        test('failure with expect.oneOf() of asymmetric matchers', async () => {
            const result = await thisContext.toHaveElementClass(el, oneOf(expect.stringContaining('notsome-class'), expect.stringContaining('notanother-class')), { wait: 0 })

            expect(result.pass).toBe(false)
        })

        test('success with RegExp when class name is present', async () => {
            const result = await thisContext.toHaveElementClass(el, /sOmE-cLaSs/i)

            expect(result.pass).toBe(true)
        })

        test('success when it has any of the classes, with expect.oneOf()', async () => {
            const result = await thisContext.toHaveElementClass(el, oneOf('not-a-class', 'yet-another-class'))

            expect(result.pass).toBe(true)
        })

        test('success when it has all the classes, with 1 assertion for each class', async () => {
            const results = [
                await thisContext.toHaveElementClass(el, 'some-class'),
                await thisContext.toHaveElementClass(el, 'yet-another-class'),
            ]

            expect(results.map((result) => result.pass)).toEqual([true, true])
        })

        test('failure if the classes do not match', async () => {
            const result = await thisContext.toHaveElementClass(el, 'someclass', { wait: 0, message: 'Not found!' })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Not found!
Expect $(\`sel\`) to have class

Expected: "someclass"
Received: "some-class another-class yet-another-class"`)
        })

        test('failure when it has none of the classes of expect.oneOf()', async () => {
            const result = await thisContext.toHaveElementClass(el, oneOf('someclass', 'anotherclass'), { wait: 0 })

            expect(result.pass).toBe(false)
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveElementClass(el, oneOf('not-class', 'not-another-class'))

            expect(result.pass).toBe(false) // success, boolean is inverted later
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveElementClass(el, oneOf('some-class', 'not-another-class'), { wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later
        })

        // As in the other matchers, an array of expected values on a single element fails the assertion, without retries:
        // use `expect.oneOf()` for "has any", and 1 assertion for each class for "has all"
        test.for([false, true])('fails with an array of expected values, even if each one matches (isNot: %s)', async (isNot) => {
            const result = await (isNot ? thisNotContext : thisContext).toHaveElementClass(el, ['some-class', 'another-class'], { wait: 1000 })

            expect(result.pass).toBe(isNot) // with `.not`, `true` is a failure
            expect(el.getAttribute).toHaveBeenCalledTimes(1)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) ${isNot ? 'not ' : ''}to have class

Expected${isNot ? ' [not]' : ''}: ["some-class", "another-class"]
Received${isNot ? '      ' : ''}: "some-class another-class yet-another-class"`
            )
        })

        // Each class is compared, for plain values and asymmetric matchers alike. For the full attribute, use
        // `toHaveAttribute('class', ...)`
        describe('compares each class', () => {
            test.each([
                ['expect.oneOf() with one of the classes', oneOf('another-class', 'not-a-class'), true],
                ['expect.oneOf() with none of the classes', oneOf('not-a-class', 'other'), false],
                ['expect.stringMatching() of a class that is not the first', expect.stringMatching(/^another/), true],
                ['expect.stringContaining() of a part of a class', expect.stringContaining('other-cl'), true],
                ['expect.stringContaining() of 2 classes and the space between them', expect.stringContaining('some-class another'), false],
            ])('%s', async (_name, expected, pass) => {
                const result = await thisContext.toHaveElementClass(el, expected, { wait: 0 })

                expect(result.pass).toBe(pass)
            })

            test.each([
                ['a tab', 'some-class\tanother-class'],
                ['a new line', 'some-class\nanother-class'],
                ['several spaces', '  some-class   another-class  '],
                ['a form feed', 'some-class\fanother-class'],
                ['a carriage return', 'some-class\ranother-class'],
            ])('splits the classes on %s', async (_name, attribute) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attribute)

                const result = await thisContext.toHaveElementClass(el, 'another-class', { wait: 0 })

                expect(result.pass).toBe(true)
            })

            // HTML separates the classes only with ASCII whitespace: a non-breaking space is part of the class name
            test.each([
                ['btn', false],
                ['btn\u00a0active', true],
            ])('keeps a non-breaking space in the class name: %s', async (expected, pass) => {
                vi.mocked(el.getAttribute).mockResolvedValue('btn\u00a0active')

                const result = await thisContext.toHaveElementClass(el, expected, { wait: 0 })

                expect(result.pass).toBe(pass)
            })

            test('not - expect.oneOf() with none of the classes passes', async () => {
                const result = await thisNotContext.toHaveElementClass(el, oneOf('not-a-class', 'other'), { wait: 0 })

                expect(result.pass).toBe(false) // success, boolean is inverted later
            })
        })

        describe('options', () => {
            test('should fail when class is not a string', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue(null)

                const result = await thisContext.toHaveElementClass(el, 'some-class')

                expect(result.pass).toBe(false)
            })

            test('should pass when trimming the attribute', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue('  some-class  ')

                const result = await thisContext.toHaveElementClass(el, 'some-class', { wait: 0, trim: true })

                expect(result.pass).toBe(true)
            })

            test('should pass when ignore the case', async () => {
                const result = await thisContext.toHaveElementClass(el, 'sOme-ClAsS', { wait: 0, ignoreCase: true })
                expect(result.pass).toBe(true)
            })

            test('should pass if containing', async () => {
                const result = await thisContext.toHaveElementClass(el, 'some', { wait: 0, containing: true })
                expect(result.pass).toBe(true)
            })

            test('applies the string options once with expect.oneOf(), as with a plain value', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue('aa')

                // `replace` changes "aa" into "a" once: a second time would give ""
                const plain = await thisContext.toHaveElementClass(el, 'a', { wait: 0, replace: ['a', ''] })
                const withOneOf = await thisContext.toHaveElementClass(el, oneOf('a'), { wait: 0, replace: ['a', ''] })

                expect([plain.pass, withOneOf.pass]).toEqual([true, true])
            })

            test('should pass if expect.oneOf() ignores the case', async () => {
                const result = await thisContext.toHaveElementClass(el, oneOf('sOme-ClAsS', 'not-a-class'), { wait: 0, ignoreCase: true })
                expect(result.pass).toBe(true)
            })
        })

        describe('failure when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(el, 'test')
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have class

Expected: "test"
Received: "some-class another-class yet-another-class"` )
            })
        })

        describe('failure with RegExp when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(el, /WDIO/)
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have class

Expected: /WDIO/
Received: "some-class another-class yet-another-class"` )
            })
        })
    })

    describe('given multiple elements', () => {
        let elements: WebdriverIO.ElementArray

        const selectorName = '$$(`sel`)'
        beforeEach(async () => {
            elements = await $$('sel')

            expect(elements).toHaveLength(2)
            elements.forEach((el) => {
                vi.mocked(el.getAttribute).mockImplementation(async (attribute: string) => {
                    if (attribute === 'class') {
                        return 'some-class another-class yet-another-class'
                    }
                    return null
                })
            })
        })

        test('success when class name is present', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveElementClass(elements, 'some-class', { wait: 0, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 },
                result
            })
        })

        test('failure when an asymmetric matcher needs the spaces between the classes', async () => {
            // each class is compared: no class has a space in it
            const result = await thisContext.toHaveElementClass(elements, expect.stringContaining('some-class '), { wait: 0 })
            expect(result.pass).toBe(false)

            const result2 = await thisContext.toHaveElementClass(elements, expect.stringContaining(' another-class '), { wait: 0 })
            expect(result2.pass).toBe(false)

            const result3 = await thisContext.toHaveElementClass(elements, expect.stringContaining('another-class'), { wait: 0 })
            expect(result3.pass).toBe(true)
        })

        test('success with multiple asymmetric matcher', async () => {
            const result = await thisContext.toHaveElementClass(elements, [expect.stringContaining('some-class'), expect.stringContaining('another-class')])

            expect(result.pass).toBe(true)
        })

        test('failure with multiple asymmetric matcher', async () => {
            const result = await thisContext.toHaveElementClass(elements, [expect.stringContaining('notsome-class'), expect.stringContaining('notanother-class')])

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have class

- Expected  - 2
+ Received  + 2

  Array [
-   StringContaining "notsome-class",
-   StringContaining "notanother-class",
+   "some-class another-class yet-another-class",
+   "some-class another-class yet-another-class",
  ]`
            )
        })

        test('not - failure with multiple asymmetric matcher - pass should be true', async () => {
            const result = await thisNotContext.toHaveElementClass(elements, [expect.stringContaining('some-class'), expect.stringContaining('another-class')])

            expect(result.pass).toBe(true) // failure, boolean is inverted later
            expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have class

Expected [not]: [StringContaining "some-class", StringContaining "another-class"]
Received      : ["some-class another-class yet-another-class", "some-class another-class yet-another-class"]`
            )
        })

        test('success with RegExp when class name is present', async () => {
            const result = await thisContext.toHaveElementClass(elements, /sOmE-cLaSs/i)

            expect(result.pass).toBe(true)
        })

        test('success if array matches with class', async () => {
            const result = await thisContext.toHaveElementClass(elements, ['some-class', 'yet-another-class'])

            expect(result.pass).toBe(true)
        })

        test('failure if the classes do not match', async () => {
            const result = await thisContext.toHaveElementClass(elements, 'someclass', { wait: 0, message: 'Not found!' })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Not found!
Expect ${selectorName} to have class

- Expected  - 2
+ Received  + 2

  Array [
-   "someclass",
-   "someclass",
+   "some-class another-class yet-another-class",
+   "some-class another-class yet-another-class",
  ]`)
        })

        test('failure if array does not match with class', async () => {
            const result = await thisContext.toHaveElementClass(elements, ['someclass', 'anotherclass'])

            expect(result.pass).toBe(false)
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveElementClass(elements, ['not-class', 'not-another-class'])

            expect(result.pass).toBe(false) // success, boolean is inverted later
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveElementClass(elements, ['some-class', 'not-another-class'])

            expect(result.pass).toBe(true) // failure, boolean is inverted later
        })

        describe('options', () => {
            test('should fail when class is not a string', async () => {
                elements.forEach((el) => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null)
                })

                const result = await thisContext.toHaveElementClass(elements, 'some-class')

                expect(result.pass).toBe(false)
            })

            test('should pass when trimming the attribute', async () => {
                elements.forEach((el) => {
                    vi.mocked(el.getAttribute).mockResolvedValue('  some-class  ')
                })

                const result = await thisContext.toHaveElementClass(elements, 'some-class', { wait: 0, trim: true })

                expect(result.pass).toBe(true)
            })

            test('should pass when ignore the case', async () => {
                const result = await thisContext.toHaveElementClass(elements, 'sOme-ClAsS', { wait: 0, ignoreCase: true })
                expect(result.pass).toBe(true)
            })

            test('should pass if containing', async () => {
                const result = await thisContext.toHaveElementClass(elements, 'some', { wait: 0, containing: true })
                expect(result.pass).toBe(true)
            })

            test('should pass if array ignores the case', async () => {
                const result = await thisContext.toHaveElementClass(elements, ['sOme-ClAsS', 'anOther-ClAsS'], { wait: 0, ignoreCase: true })
                expect(result.pass).toBe(true)
            })
        })

        describe('failure when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(elements, 'test')
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have class

- Expected  - 2
+ Received  + 2

  Array [
-   "test",
-   "test",
+   "some-class another-class yet-another-class",
+   "some-class another-class yet-another-class",
  ]` )
            })
        })

        describe('failure with RegExp when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(elements, /WDIO/)
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have class

- Expected  - 2
+ Received  + 2

  Array [
-   /WDIO/,
-   /WDIO/,
+   "some-class another-class yet-another-class",
+   "some-class another-class yet-another-class",
  ]` )
            })
        })
    })

    describe('given multi-remote elements', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

        test.each([
            { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel'), message: `\
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have class

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "some",
-   "firefox": "some",
+   "firefox": "other",
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have class

- Expected  - 2
+ Received  + 2

  Multi-remote values {
    "chrome": Array [
      "some",
      "some",
    ],
    "firefox": Array [
-     "some",
-     "some",
+     "other",
+     "other",
    ],
  }` },
        ])('checks the same class or one class per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getAttribute', 'other')

            const same = await thisContext.toHaveElementClass(element, 'some', { wait: 0 })
            const perInstance = await thisContext.toHaveElementClass(element, multiRemote({ chrome: 'some', firefox: 'other' }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })

        test('checks one array per instance, as the plain object shorthand, element by element on $$()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
            mockMultiRemoteElementsCommand(elements, 'getAttribute', { chrome: ['some attribute', 'second'], firefox: ['other', 'another'] })

            const result = await thisContext.toHaveElementClass(elements, { chrome: ['some', 'second'], firefox: ['other', 'another'] }, { wait: 0 })
            const swapped = await thisContext.toHaveElementClass(elements, { chrome: ['second', 'some'], firefox: ['another', 'other'] }, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(swapped.pass).toBe(false)
        })
    })
})
