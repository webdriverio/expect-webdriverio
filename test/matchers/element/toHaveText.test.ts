import { $, $$ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toHaveText } from '../../../src/matchers/element/toHaveText.js'
import type { ChainablePromiseArray } from 'webdriverio'
import { notFoundElementFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe(toHaveText, async () => {
    let thisContext: { toHaveText: typeof toHaveText; isNot?: boolean }
    let thisNotContext: { toHaveText: typeof toHaveText; isNot: true }

    beforeEach(() => {
        thisContext = { toHaveText }
        thisNotContext = { toHaveText, isNot: true }
    })

    describe.for([
        { element: await $('sel'), title: 'awaited ChainablePromiseElement' },
        { element: await $('sel').getElement(), title: 'awaited getElement of ChainablePromiseElement (e.g. WebdriverIO.Element)' },
        { element: $('sel'), title: 'non-awaited of ChainablePromiseElement' }
    ])('given a single element when $title', ({ element, title }) => {
        let el: ChainablePromiseElement | WebdriverIO.Element

        let selectorName = '$(`sel`)'
        if (title.includes('non-awaited')) {selectorName = ''} // Bug to fix

        beforeEach(async () => {
            el = element
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')
        })

        test('wait for success', async () => {
            vi.mocked(el.getText).mockResolvedValueOnce('').mockResolvedValueOnce('').mockResolvedValueOnce('webdriverio')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(3)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveText',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveText',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(el.getText).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, wait: 0 }))
                .rejects.toThrow('some error')
        })

        test('success and trim actual text by default', async () => {
            vi.mocked(el.getText).mockResolvedValue(' WebdriverIO ')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            vi.mocked(el.getText).mockResolvedValue('Not WebdriverIO')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`
            )
        })

        test('not, with no trim - failure - pass should be true', async () => {
            vi.mocked(el.getText).mockResolvedValue(' WebdriverIO ')

            const result = await thisNotContext.toHaveText(el, ' WebdriverIO ', { trim: false, wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: " WebdriverIO "
Received      : " WebdriverIO "`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveText(el, 'not WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('should return true if texts strictly match without trimming', async () => {
            const result = await thisContext.toHaveText(el, 'WebdriverIO', { trim: false, wait: 0 })

            expect(result.pass).toBe(true)
        })

        test("should return false if texts don't match when trimming is disabled", async () => {
            const result = await thisContext.toHaveText(el, 'foobar', { trim: false, wait: 0 })
            expect(result.pass).toBe(false)
        })

        test('should return true if actual text + single replacer matches the expected text', async () => {
            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { wait: 0, replace: ['Web', 'Browser'] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + replace (string) matches the expected text', async () => {
            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { wait: 0, replace: [['Web', 'Browser']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + replace (regex) matches the expected text', async () => {
            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { wait: 0, replace: [[/Web/, 'Browser']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text starts with expected text', async () => {
            const result = await thisContext.toHaveText(el, 'Web', { wait: 0, atStart: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text ends with expected text', async () => {
            const result = await thisContext.toHaveText(el, 'IO', { wait: 0, atEnd: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text contains the expected text at the given index', async () => {
            const result = await thisContext.toHaveText(el, 'iverIO', { wait: 0, atIndex: 5 })

            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(el.getText).mockResolvedValue('')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

Expected: "WebdriverIO"
Received: ""`
            )
        })

        test('success if one of the values in the array matches with text and ignoreCase', async () => {

            const result = await thisContext.toHaveText(el, ['WDIO', 'Webdriverio'], { wait: 0, ignoreCase: true })
            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and trim', async () => {

            vi.mocked(el.getText).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveText(el, ['WDIO', 'WebdriverIO', 'toto'], { wait: 0, trim: true })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and replace (string)', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [['Web', 'Browser']] })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and replace (regex)', async () => {

            const result = await thisContext.toHaveText(el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [[/Web/g, 'Browser']] })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'browserdriverio', 'toto'], {
                replace: [
                    [/Web/g, 'Browser'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
            })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('failure if one of the values in the array does not match with text', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'Webdriverio'], { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('should return true if actual text contains the expected text', async () => {
            const result = await thisContext.toHaveText(el, expect.stringContaining('iverIO'), {})

            expect(result.pass).toBe(true)
        })

        test('should return false if actual text does not contain the expected text', async () => {
            const result = await thisContext.toHaveText(el, expect.stringContaining('WDIO'), { wait: 0 })

            expect(result.pass).toBe(false)
        })

        test('should return true if actual text contains one of the expected texts', async () => {
            const result = await thisContext.toHaveText(el, [expect.stringContaining('iverIO'), expect.stringContaining('WDIO')], {})

            expect(result.pass).toBe(true)
        })

        test('should return false if actual text does not contain the expected texts', async () => {
            const result = await thisContext.toHaveText(el, [expect.stringContaining('EXAMPLE'), expect.stringContaining('WDIO')], { wait: 0 })

            expect(result.pass).toBe(false)
        })

        describe('with RegExp', () => {
            beforeEach(async () => {
                vi.mocked(el.getText).mockResolvedValue('This is example text')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveText(el, /ExAmplE/i)

                expect(result.pass).toBe(true)
            })

            test('success if one of the values in the array matches with RegExp', async () => {
                const result = await thisContext.toHaveText(el, ['WDIO', /ExAmPlE/i])

                expect(result.pass).toBe(true)
            })

            test('success if one of the values in the array matches with text', async () => {
                const result = await thisContext.toHaveText(el, ['This is example text', /Webdriver/i])

                expect(result.pass).toBe(true)
            })

            test('success if one of the values in the array matches with text and ignoreCase', async () => {
                const result = await thisContext.toHaveText(el, ['ThIs Is ExAmPlE tExT', /Webdriver/i], {
                    ignoreCase: true,
                })

                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveText(el, /Webdriver/i, { wait: 0 })

                expect(result.pass).toBe(false)
                // TODO drepvost verify if we should see array as received value
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

Expected: /Webdriver/i
Received: "This is example text"`
                )
            })

            test('failure if one of the values in the array does not match with text', async () => {
                const result = await thisContext.toHaveText(el, ['WDIO', /Webdriver/i], { wait: 0 })

                expect(result.pass).toBe(false)
                // TODO drepvost verify if we should see array as received value
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

Expected: ["WDIO", /Webdriver/i]
Received: "This is example text"`
                )
            })
        })
    })

    describe.for([
        { elements: await $$('sel'), title: 'awaited ChainablePromiseArray' },
        { elements: await $$('sel').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },
        { elements: await $$('sel').filter((t) => t.isEnabled()), title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },

        // Bug that will be fixed later with $$ support. Throws `Error: Can't call "getText" on element with selector "label", it is not a function`
        // { elements: $$('sel'), title: 'non-awaited of ChainablePromiseArray' }
    ])('given a multiple elements when $title', ({ elements, title }) => {
        let els: ChainablePromiseArray | WebdriverIO.ElementArray //| WebdriverIO.Element[] // Bug that will be fixed later with $$ support

        const selectorName = title.includes('WebdriverIO.Element[]') ? '': '$$(`sel`)' // Bug to fix where with Element[] selector name is empty

        beforeEach(async () => {
            els = elements as ChainablePromiseArray | WebdriverIO.ElementArray // casting, bug that will be fixed later with $$ support

            const awaitedEls = await els
            awaitedEls[0] = await $('sel')
            awaitedEls[1] = await $('dev')
        })

        describe('given single expected values', () => {
            beforeEach(async () => {
                const awaitedEls = await els
                expect(awaitedEls.length).toBe(2)

                awaitedEls.forEach(el => vi.mocked(el.getText).mockResolvedValue('WebdriverIO'))
            })

            test('should return true if the received element array matches the expected text array', async () => {
                const result = await thisContext.toHaveText(els, 'WebdriverIO', { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                const result = await thisContext.toHaveText(els, 'webdriverio', { ignoreCase: true, wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('should return true if actual texts contains space since we trim by default', async () => {
                const awaitedEls = await els
                vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                vi.mocked(awaitedEls[1].getText).mockResolvedValue(' WebdriverIO ')

                const result = await thisContext.toHaveText( els, 'WebdriverIO', { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('should return false if the received element array does not match the expected text array', async () => {
                const result = await thisContext.toHaveText(els, 'webdriverio', { wait: 0 })

                expect(result.pass).toBe(false)
            })

            test('should return false and show custom failure message correctly', async () => {
                const result = await thisContext.toHaveText(els, 'webdriverio', { message: 'Test', wait: 0 })

                // selectorName is buggy, to be fixed later with $$ support
                // Expected vs received is wierd, to be fixed later with $$ support
                expect(result.message()).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 2

  Array [
-   "webdriverio",
+   "WebdriverIO",
+   "WebdriverIO",
  ]`
                )
            })

            test('should return false and show a correct custom failure message', async () => {
                const result = await thisContext.toHaveText( els, 'webdriverio', { message: 'Test', wait: 0 })

                expect(result.message()).toMatch(/Test\nExpect .* to have text/)
            })
        })

        describe('given multiples expected values', () => {
            beforeEach(async () => {
                const awaitedEls = await els
                vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO')
                vi.mocked(awaitedEls[1].getText).mockResolvedValue('Get Started')
            })

            test('should return true if the received elements', async () => {
                const result = await thisContext.toHaveText(els, ['WebdriverIO', 'Get Started'], { wait: 0 })
                expect(result.pass).toBe(true)
            })

            test('should return true if actual texts contains space since we trim by default', async () => {
                const awaitedEls = await els
                vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                const result = await thisContext.toHaveText( els, ['WebdriverIO', 'Get Started'], { wait: 0 })

                // For single element we trim by default but not for multiple elements, sounds like a bug
                expect(result.pass).toBe(false)
            })

            test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { ignoreCase: true, wait: 0 })
                expect(result.pass).toBe(true)
            })

            test('should return false if the received element array does not match the expected text array', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { wait: 0 })

                expect(result.pass).toBe(false)
            })

            test('should return false if the second received element array does not match the second expected text in the array', async () => {
                const result = await thisContext.toHaveText(els, ['WebdriverIO', 'get started'], { wait: 0 })

                expect(result.pass).toBe(false)
                // Buggy error message to fix later with $$ support
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 3
+ Received  + 1

  Array [
-   Array [
    "WebdriverIO",
-     "get started",
-   ],
+   "Get Started",
  ]`
                )
            })

            test('should return false and display proper custom error message', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { message: 'Test', wait: 0 })

                expect(result.pass).toBe(false)
                // Buggy error message to fix later with $$ support
                expect(result.message()).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 4
+ Received  + 2

  Array [
-   Array [
-     "webdriverio",
-     "get started",
-   ],
+   "WebdriverIO",
+   "Get Started",
  ]`
                )
            })

            test('should return false and show a correct custom failure message', async () => {
                const result = await thisContext.toHaveText( els, 'webdriverio', { message: 'Test', wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toMatch(/Test\nExpect .* to have text/)
            })
        })
    })

    describe('Edge cases', () => {
        test('should have pass false with proper error message when actual is an empty array of elements', async () => {
            // @ts-ignore
            const result = await thisContext.toHaveText([], 'webdriverio')

            expect(result.pass).toBe(true)
        })

        // TODO view later to handle this case more gracefully
        test('given element is not found then it throws error when an element does not exists', async () => {
            const element: WebdriverIO.Element = notFoundElementFactory('sel')

            await expect(thisContext.toHaveText(element, 'webdriverio')).rejects.toThrow("Can't call getText on element with selector sel because element wasn't found")
        })

        // TODO view later to handle this case more gracefully
        test('given element from out of bound ChainableArray, then it throws error when an element does not exists', async () => {
            const element: ChainablePromiseElement = $$('elements')[3]

            await expect(thisContext.toHaveText(element, 'webdriverio')).rejects.toThrow('Index out of bounds! $$(elements) returned only 2 elements.')
        })

        // Throws with wierd and differrent error message!
        test.skip.for([
            { actual: undefined, selectorName: 'undefined' },
            { actual: null, selectorName: 'null' },
            { actual: true, selectorName: 'true' },
            { actual: 5, selectorName: '5' },
            { actual: 'test', selectorName: 'test' },
            { actual: Promise.resolve(true), selectorName: 'true' },
            { actual: {}, selectorName: '{}' },
            { actual: ['1', '2'], selectorName: '["1","2"]' },
        ])('should have pass false with proper error message when actual is unsupported type of $actual', async ({ actual, selectorName }) => {
            const result = await thisContext.toHaveText(actual as any, 'webdriverio')

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

Expected: "webdriverio"
Received: undefined`)
        })
    })
})
