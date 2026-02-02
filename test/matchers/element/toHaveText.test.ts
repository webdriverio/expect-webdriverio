import { $, $$ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toHaveText } from '../../../src/matchers/element/toHaveText.js'
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio'
import { notFoundElementFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe(toHaveText, async () => {

    let thisContext: { toHaveText: typeof toHaveText; isNot?: boolean }
    let thisNotContext: { toHaveText: typeof toHaveText; isNot: true }

    beforeEach(() => {
        thisContext = { toHaveText }
        thisNotContext = { toHaveText, isNot: true }
    })

    describe.each([
        { element: await $('sel'), title: 'awaited ChainablePromiseElement' },
        { element: await $('sel').getElement(), title: 'awaited getElement of ChainablePromiseElement (e.g. WebdriverIO.Element)' },
        { element: $('sel'), title: 'non-awaited of ChainablePromiseElement' },

        // Since Promise<Element> Type is not supported the below is not official even if it works, should we support it? TODO delete or remove casting `as unknown as ChainablePromiseArray`
        // { element: $('sel').getElement() as unknown as ChainablePromiseElement, selectorName: '', title: 'non-awaited getElements of ChainablePromiseArray' }
    ])('given a single element when $title', ({ element }) => {
        let el: ChainablePromiseElement | WebdriverIO.Element

        beforeEach(async () => {
            el = element
        })

        test('wait for success', async () => {
            vi.mocked(el.getText).mockResolvedValueOnce('').mockResolvedValueOnce('').mockResolvedValueOnce('webdriverio')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(3)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveText',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveText',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(el.getText).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, wait: 500 }))
                .rejects.toThrow('some error')
        })

        test('success and trim by default', async () => {
            vi.mocked(el.getText).mockResolvedValue(' WebdriverIO ')

            const result = await thisContext.toHaveText(el, 'WebdriverIO')
            expect(result.pass).toBe(true)
        })

        test('success on the first attempt', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true })
            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            vi.mocked(el.getText).mockResolvedValue('webdriverio')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have text

Expected: "WebdriverIO"
Received: "webdriverio"`
            )
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {

            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisNotContext.toHaveText(el, 'WebdriverIO')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have text

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`)
        })

        test('not - success - pass should be false', async () => {

            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisNotContext.toHaveText(el, 'Not Desired')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test("should return false if texts don't match when trimming is disabled", async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'foobar', { trim: false, wait: 0 })
            expect(result.pass).toBe(false)
        })

        test('should return true if texts strictly match without trimming', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { trim: false })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + single replacer matches the expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', {  replace: ['Web', 'Browser'] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + replace (string) matches the expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { replace: [['Web', 'Browser']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + replace (regex) matches the expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { replace: [[/Web/, 'Browser']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text starts with expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'Web', { atStart: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text ends with expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'IO', { atEnd: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text contains the expected text at the given index', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, 'iverIO', { atIndex: 5 })

            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(el.getText).mockResolvedValue('')

            const result = await thisContext.toHaveText(el, 'WebdriverIO')

            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have text

Expected: "WebdriverIO"
Received: ""`
            )
        })

        test('success if array matches with text and ignoreCase', async () => {

            vi.mocked(el.getText).mockResolvedValue('webdriverio')

            const result = await thisContext.toHaveText(el, ['WDIO', 'Webdriverio'], { ignoreCase: true })
            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with text and trim', async () => {

            vi.mocked(el.getText).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveText(el, ['WDIO', 'WebdriverIO', 'toto'], { trim: true })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with text and replace (string)', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [['Web', 'Browser']] })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with text and replace (regex)', async () => {

            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [[/Web/g, 'Browser']] })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with text and multiple replacers and one of the replacers is a function', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, ['WDIO', 'browserdriverio', 'toto'], {
                replace: [
                    [/Web/g, 'Browser'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
            })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('failure if array does not match with text', async () => {

            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')
            const result = await thisContext.toHaveText(el, ['WDIO', 'Webdriverio'])

            expect(result.pass).toBe(false)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('should return true if actual text contains the expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, expect.stringContaining('iverIO'), {})

            expect(result.pass).toBe(true)
        })

        test('should return false if actual text does not contain the expected text', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, expect.stringContaining('WDIO'))

            expect(result.pass).toBe(false)
        })

        test('should return true if actual text contains one of the expected texts', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, [expect.stringContaining('iverIO'), expect.stringContaining('WDIO')], {})

            expect(result.pass).toBe(true)
        })

        test('should return false if actual text does not contain the expected texts', async () => {
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveText(el, [expect.stringContaining('EXAMPLE'), expect.stringContaining('WDIO')])

            expect(result.pass).toBe(false)
        })

        describe('with RegExp', () => {
            let el: ChainablePromiseElement

            beforeEach(async () => {
                el = await $('sel')
                vi.mocked(el.getText).mockResolvedValue('This is example text')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveText(el, /ExAmplE/i)

                expect(result.pass).toBe(true)
            })

            test('success if array matches with RegExp', async () => {
                const result = await thisContext.toHaveText(el, ['WDIO', /ExAmPlE/i])

                expect(result.pass).toBe(true)
            })

            test('success if array matches with text', async () => {
                const result = await thisContext.toHaveText(el, ['This is example text', /Webdriver/i])

                expect(result.pass).toBe(true)
            })

            test('success if array matches with text and ignoreCase', async () => {
                const result = await thisContext.toHaveText(el, ['ThIs Is ExAmPlE tExT', /Webdriver/i], {
                    ignoreCase: true,
                })

                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveText(el, /Webdriver/i)

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have text

Expected: /Webdriver/i
Received: "This is example text"`
                )
            })

            test('failure if array does not match with text', async () => {
                const result = await thisContext.toHaveText(el, ['WDIO', /Webdriver/i])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have text

Expected: ["WDIO", /Webdriver/i]
Received: "This is example text"`
                )
            })
        })
    })

    describe.each([
        { elements: await $$('sel'), title: 'awaited ChainablePromiseArray' },
        { elements: await $$('sel').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },
        { elements: await $$('sel').filter((t) => t.isEnabled()), selectorName: '$(`sel`), $(`dev`)', title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },
        { elements: $$('sel'), title: 'non-awaited of ChainablePromiseArray' },

        // Since Promise<Element[]> Type is not supported the below is not official even if it works, should we support it? TODO delete or remove casting `as unknown as ChainablePromiseArray`
        { elements: $$('sel').filter((t) => t.isEnabled()) as unknown as ChainablePromiseArray, selectorName: '$(`sel`), $(`dev`)', title: 'non-awaited filtered ChainablePromiseArray' },
        { elements: $$('sel').getElements() as unknown as ChainablePromiseArray, title: 'non-awaited getElements of ChainablePromiseArray' }
    ])('given multiple elements when $title', ({ elements, selectorName }) => {
        let els: ChainablePromiseArray | WebdriverIO.ElementArray | WebdriverIO.Element[]

        selectorName = selectorName || '$$(`sel`)'
        beforeEach(async () => {
            els = elements

            const awaitedEls = await els
            awaitedEls[0] = await $('sel')
            awaitedEls[1] = await $('dev')
        })

        describe('given single expected values', () => {
            beforeEach(async () => {
                els = elements

                const awaitedEls = await els
                expect(awaitedEls.length).toBe(2)
                awaitedEls.forEach(el => vi.mocked(el.getText).mockResolvedValue('WebdriverIO'))
            })

            test('should return true if the received element array matches the expected text array', async () => {
                const result = await thisContext.toHaveText(els, 'WebdriverIO')
                expect(result.pass).toBe(true)
            })

            test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                const result = await thisContext.toHaveText(els, 'webdriverio', { ignoreCase: true })
                expect(result.pass).toBe(true)
            })

            test('should return false if the received element array does not match the expected text array', async () => {
                const result = await thisContext.toHaveText(els, 'webdriverio')
                expect(result.pass).toBe(false)
            })

            test('should return false when first element does not match', async () => {
                vi.mocked((await els)[0].getText).mockResolvedValueOnce('Wrong')
                vi.mocked((await els)[1].getText).mockResolvedValueOnce('webdriverio')

                const result = await thisContext.toHaveText(els, 'webdriverio', { message: 'Test', wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "webdriverio",
+   "Wrong",
    "webdriverio",
  ]`
                )
            })

            test('should return false when second element does not match', async () => {
                vi.mocked((await els)[0].getText).mockResolvedValueOnce('webdriverio')
                vi.mocked((await els)[1].getText).mockResolvedValueOnce('Wrong')

                const result = await thisContext.toHaveText(els, 'webdriverio', { message: 'Test', wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 1

  Array [
    "webdriverio",
-   "webdriverio",
+   "Wrong",
  ]`
                )
            })

            test('should shows custom failure message', async () => {
                const result = await thisContext.toHaveText(els, 'webdriverio', { message: 'Test', wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
+   "WebdriverIO",
+   "WebdriverIO",
  ]`
                )
            })
        })

        describe('given multiples expected values', () => {
            let awaitedElements: WebdriverIO.Element[] | WebdriverIO.ElementArray| ChainablePromiseArray
            beforeEach(async () => {
                els = elements

                awaitedElements = await els
                vi.mocked(awaitedElements[0].getText).mockResolvedValue('WebdriverIO')
                vi.mocked(awaitedElements[1].getText).mockResolvedValue('Get Started')
            })

            test('should return true if the received elements', async () => {
                const result = await thisContext.toHaveText(els, ['WebdriverIO', 'Get Started'])
                expect(result.pass).toBe(true)
            })

            test('should return true if the received elements and trim by default', async () => {
                const awaitedEls = await els
                vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                const result = await thisContext.toHaveText(els, ['WebdriverIO', 'Get Started'])

                expect(result.pass).toBe(true)
            })

            test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { ignoreCase: true })
                expect(result.pass).toBe(true)
            })

            test('should return false if the received element array does not match the expected text array', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "get started",
+   "WebdriverIO",
+   "Get Started",
  ]`
                )
            })

            test('should return false if the first received element array does not match the first expected text in the array', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverIO', 'Get Started'])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "webdriverIO",
+   "WebdriverIO",
    "Get Started",
  ]`
                )
            })

            test('should return false if the second received element array does not match the second expected text in the array', async () => {
                const result = await thisContext.toHaveText(els, ['WebdriverIO', 'get started'])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 1

  Array [
    "WebdriverIO",
-   "get started",
+   "Get Started",
  ]`
                )
            })

            // TODO legacy behavior to be removed in future major release
            test('should return true when trying to match non-indexed + more texts than elements (legacy behavior to deprecated)', async () => {
                vi.mocked((await els)[0].getText).mockResolvedValueOnce('webdriverio1')
                vi.mocked((await els)[1].getText).mockResolvedValueOnce('webdriverio2')

                const result = await thisContext.toHaveText(els, ['webdriverio2', 'webdriverio1', 'webdriverio'])

                expect(result.pass).toBe(true)
            })

            test('should return false when trying to match non-indexed + more texts than elements (legacy behavior to deprecated) but nothing match', async () => {
                vi.mocked((await els)[0].getText).mockResolvedValueOnce('webdriverio1')
                vi.mocked((await els)[1].getText).mockResolvedValueOnce('webdriverio2')

                const result = await thisContext.toHaveText(els, ['webdriverio', 'webdriverio', 'webdriverIO'])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 3
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
-   "webdriverIO",
+   "webdriverio1",
+   "webdriverio2",
  ]`
                )
            })

            test('should return false and display proper custom error message', async () => {
                const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { message: 'Test', wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "get started",
+   "WebdriverIO",
+   "Get Started",
  ]`
                )
            })

            test('not - failure on both elements - pass should be true', async () => {
                const result = await thisNotContext.toHaveText(elements, ['WebdriverIO', 'Get Started'])

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "Get Started"]
Received      : ["WebdriverIO", "Get Started"]`)
            })

            test('not - failure on first element only - pass should be true', async () => {
                const result = await thisNotContext.toHaveText(elements, ['WebdriverIO', 'OK Get Started'])

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "OK Get Started"]
Received      : ["WebdriverIO", "Get Started"]`)
            })

            test('not - success - pass should be false', async () => {
                const result = await thisNotContext.toHaveText(elements, ['NOT WebdriverIO', 'NOT Get Started'])

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })
        })
    })

    describe('Edge cases', () => {
        test('should have pass false with proper error message when actual is an empty array of elements', async () => {
            const result = await thisContext.toHaveText([], 'webdriverio')

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect [] to have text

Expected: "webdriverio"
Received: undefined`)
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

        test.for([
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
