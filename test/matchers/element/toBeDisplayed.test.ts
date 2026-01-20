import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toBeDisplayed } from '../../../src/matchers/element/toBeDisplayed.js'
import { executeCommandBe, waitUntil } from '../../../src/utils.js'

vi.mock('@wdio/globals')

describe(toBeDisplayed, async () => {
    let thisContext: { toBeDisplayed: typeof toBeDisplayed }
    let thisNotContext: { isNot: true; toBeDisplayed: typeof toBeDisplayed }

    beforeEach(async () => {
        thisContext = { toBeDisplayed }
        thisNotContext = { isNot: true, toBeDisplayed }

    })

    describe.each([
        { element: await $('sel'), title: 'awaited ChainablePromiseElement' },
        { element: await $('sel').getElement(), title: 'awaited getElement of ChainablePromiseElement (e.g. WebdriverIO.Element)' },
        { element: $('sel'), title: 'non-awaited of ChainablePromiseElement' }
    ])('given a single element when $title', ({ element: el }) => {
        let element: ChainablePromiseElement | WebdriverIO.Element

        beforeEach(async () => {
            thisContext = { toBeDisplayed }
            thisNotContext = { isNot: true, toBeDisplayed }

            element = el
            vi.mocked(element.isDisplayed).mockResolvedValue(true)
        })

        test('wait for success', async () => {
            vi.mocked(element.isDisplayed).mockResolvedValueOnce(false).mockResolvedValueOnce(true)
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toBeDisplayed(element, { beforeAssertion, afterAssertion, wait: 500 })

            expect(element.isDisplayed).toHaveBeenCalledWith(
                {
                    withinViewport: false,
                    contentVisibilityAuto: true,
                    opacityProperty: true,
                    visibilityProperty: true
                }
            )
            expect(executeCommandBe).toHaveBeenCalledExactlyOnceWith(element, expect.any(Function),
                {
                    beforeAssertion: beforeAssertion,
                    afterAssertion: afterAssertion,
                    interval: 100,
                    wait: 500,
                },
            )
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {
                wait: 500,
                interval: 100,
            })
            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toBeDisplayed',
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toBeDisplayed',
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('success with ToBeDisplayed and command options', async () => {
            const result = await thisContext.toBeDisplayed(element, { wait: 1, withinViewport: true })

            expect(element.isDisplayed).toHaveBeenCalledWith(
                {
                    withinViewport: true,
                    contentVisibilityAuto: true,
                    opacityProperty: true,
                    visibilityProperty: true
                }
            )
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, {
                wait: 1,
                interval: 100,
            })
            expect(result.pass).toBe(true)
        })

        test('wait but throws', async () => {
            vi.mocked(element.isDisplayed).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toBeDisplayed(element))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toBeDisplayed(element)

            expect(result.pass).toBe(true)
            expect(element.isDisplayed).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            vi.mocked(element.isDisplayed).mockResolvedValue(false)

            const result = await thisContext.toBeDisplayed(element, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(element.isDisplayed).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toBeDisplayed(element, { wait: 0 })

            expect(element.isDisplayed).toHaveBeenCalledWith(
                {
                    withinViewport: false,
                    contentVisibilityAuto: true,
                    opacityProperty: true,
                    visibilityProperty: true
                }
            )
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, {
                wait: 0,
                interval: 100,
            })

            expect(result.pass).toBe(true)
            expect(element.isDisplayed).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toBeDisplayed(element)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be displayed

Expected: "not displayed"
Received: "displayed"`)
        })

        test('not - success - pass should be false', async () => {
            vi.mocked(element.isDisplayed).mockResolvedValue(false)

            const result = await thisNotContext.toBeDisplayed(element)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('not - failure (with wait) - pass should be true', async () => {
            const result = await thisNotContext.toBeDisplayed(element)

            expect(result.pass).toBe(true) // success, boolean is inverted later because of `.not`
        })

        test('not - success (with wait) - pass should be false', async () => {
            vi.mocked(element.isDisplayed).mockResolvedValue(false)

            const result = await thisNotContext.toBeDisplayed(element)

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), true,  {
                wait: 1,
                interval: 100,
            })
            expect(element.isDisplayed).toHaveBeenCalledWith(
                {
                    withinViewport: false,
                    contentVisibilityAuto: true,
                    opacityProperty: true,
                    visibilityProperty: true
                }
            )
            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('message', async () => {
            vi.mocked(element.isDisplayed).mockResolvedValue(false)

            const result = await thisContext.toBeDisplayed(element)

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })

        test('undefined - failure', async () => {
            const element = undefined as unknown as WebdriverIO.Element

            const result = await thisContext.toBeDisplayed(element)

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect undefined to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })
    })

    describe.each([
        { elements: await $$('sel'), title: 'awaited ChainablePromiseArray' },
        { elements: await $$('sel').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },
        { elements: await $$('sel').filter((t) => t.isEnabled()), title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },
        { elements: $$('sel'), title: 'non-awaited of ChainablePromiseArray' }
    ])('given multiple elements when $title', ({ elements : els, title }) => {
        let elements: ChainablePromiseArray | WebdriverIO.ElementArray | WebdriverIO.Element[]
        let awaitedElements: typeof elements

        const selectorName = title.includes('filtered') ?  '$(`sel`), $$(`sel`)[1]': '$$(`sel`)'

        beforeEach(async () => {
            elements = els

            awaitedElements = await elements
            awaitedElements.forEach((element) => {
                vi.mocked(element.isDisplayed).mockResolvedValue(true)
            })
            expect(awaitedElements).toHaveLength(2)
        })

        test('wait for success', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toBeDisplayed(elements, { beforeAssertion, afterAssertion, wait: 500 })

            awaitedElements.forEach((element) => {
                expect(element.isDisplayed).toHaveBeenCalledWith(
                    {
                        withinViewport: false,
                        contentVisibilityAuto: true,
                        opacityProperty: true,
                        visibilityProperty: true
                    }
                )
            })
            expect(executeCommandBe).toHaveBeenCalledExactlyOnceWith(elements, expect.any(Function),
                {
                    beforeAssertion: beforeAssertion,
                    afterAssertion: afterAssertion,
                    interval: 100,
                    wait: 500,
                },
            )
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, {
                wait: 500,
                interval: 100,
            })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toBeDisplayed',
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toBeDisplayed',
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('success with ToBeDisplayed and command options', async () => {
            const result = await thisContext.toBeDisplayed(elements, { wait: 1, withinViewport: true })

            awaitedElements.forEach((element) => {
                expect(element.isDisplayed).toHaveBeenCalledWith(
                    {
                        withinViewport: true,
                        contentVisibilityAuto: true,
                        opacityProperty: true,
                        visibilityProperty: true
                    }
                )
            })
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, {
                wait:  1,
                interval: 100,
            })
            expect(result.pass).toBe(true)
        })

        test('wait but error', async () => {
            vi.mocked(awaitedElements[0].isDisplayed).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toBeDisplayed(elements))
                .rejects.toThrow('some error')
        })

        // TODO review if failure message need to be more specific and hihghlight that elements are empty?
        test('failure when no elements exist', async () => {
            const result = await thisContext.toBeDisplayed([])

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect [] to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toBeDisplayed(elements)

            expect(result.pass).toBe(true)
            awaitedElements.forEach((element) => {
                expect(element.isDisplayed).toHaveBeenCalledTimes(1)
            })
        })

        test('no wait - failure', async () => {
            vi.mocked(awaitedElements[0].isDisplayed).mockResolvedValue(false)

            const result = await thisContext.toBeDisplayed(elements, { wait: 0 })

            expect(result.pass).toBe(false)
            awaitedElements.forEach((element) => {
                expect(element.isDisplayed).toHaveBeenCalledTimes(1)
            })
        })

        test('no wait - success', async () => {
            const result = await thisContext.toBeDisplayed(elements, { wait: 0 })

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {
                wait: 0,
                interval: 100,
            })
            awaitedElements.forEach((element) => {
                expect(element.isDisplayed).toHaveBeenNthCalledWith(1,
                    {
                        withinViewport: false,
                        contentVisibilityAuto: true,
                        opacityProperty: true,
                        visibilityProperty: true
                    }
                )
            })
            expect(result.pass).toBe(true)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toBeDisplayed(elements)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect ${selectorName} not to be displayed

Expected: "not displayed"
Received: "displayed"`)
        })

        // TODO having a better message showing that we expect at least one element would be great?
        test('not - failure when no elements - pass should be true', async () => {
            const result = await thisNotContext.toBeDisplayed([])

            expect(result.pass).toBe(true) // success, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect [] not to be displayed

Expected: "not displayed"
Received: "displayed"`)
        })

        // TODO review we should display an array of values showing which element failed
        test('not - failure - when only first element is displayed - pass should be true', async () => {
            vi.mocked(awaitedElements[0].isDisplayed).mockResolvedValue(false)
            vi.mocked(awaitedElements[1].isDisplayed).mockResolvedValue(true)

            const result = await thisNotContext.toBeDisplayed(elements)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect ${selectorName} not to be displayed

Expected: "not displayed"
Received: "displayed"`)
        })

        test('not - success - pass should be false', async () => {
            awaitedElements.forEach((element) => {
                vi.mocked(element.isDisplayed).mockResolvedValue(false)
            })

            const result = await thisNotContext.toBeDisplayed(elements)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('not - failure (with wait) - pass should be true', async () => {
            const result = await thisNotContext.toBeDisplayed(elements)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        })

        test('not - success (with wait) - pass should be false', async () => {
            awaitedElements.forEach((element) => {
                vi.mocked(element.isDisplayed).mockResolvedValue(false)
            })

            const result = await thisNotContext.toBeDisplayed(elements, { wait: 300 })

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), true, {
                wait: 300,
                interval: 100,
            })
            awaitedElements.forEach((element) => {
                expect(element.isDisplayed).toHaveBeenCalledWith(
                    {
                        withinViewport: false,
                        contentVisibilityAuto: true,
                        opacityProperty: true,
                        visibilityProperty: true
                    }
                )
            })
            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('message when both elements fail', async () => {
            awaitedElements.forEach((element) => {
                vi.mocked(element.isDisplayed).mockResolvedValue(false)
            })

            const result = await thisContext.toBeDisplayed(elements)

            expect(result.message()).toEqual(`\
Expect ${selectorName} to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })

        test('message when a single element fails', async () => {
            awaitedElements.forEach((element) => {
                vi.mocked(element.isDisplayed).mockResolvedValue(false)
            })
            vi.mocked(awaitedElements[0].isDisplayed).mockResolvedValue(true)

            const result = await thisContext.toBeDisplayed(elements)

            expect(result.message()).toEqual(`\
Expect ${selectorName} to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })
    })

    test.for([
        { els: undefined, selectorName: 'undefined' },
        { els: null, selectorName: 'null' },
        { els: 0, selectorName: '0' },
        { els: 1, selectorName: '1' },
        { els: true, selectorName: 'true' },
        { els: false, selectorName: 'false' },
        { els: '', selectorName: '' },
        { els: 'test', selectorName: 'test' },
        { els: {}, selectorName: '{}' },
        { els: [1, 'test'], selectorName: '[1,"test"]' },
        { els: Promise.resolve(true), selectorName: 'true' }
    ])('fails for %s', async ({ els, selectorName }) => {
        const result = await thisContext.toBeDisplayed(els as any)

        expect(result.pass).toBe(false)
        expect(result.message()).toEqual(`\
Expect ${selectorName} to be displayed

Expected: "displayed"
Received: "not displayed"`)
    })
})
