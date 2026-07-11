import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toBeDisplayed } from '../../../src/matchers/element/toBeDisplayed.js'
import { executeCommandBe, waitUntil } from '../../../src/utils.js'
import stripAnsi from 'strip-ansi'
import { DEFAULT_OPTIONS } from '../../../src/constants.js'
import { setDefaultOptions, setOptions } from '../../../src/index.js'

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
                    interval: 1,
                    wait: 500,
                },
            )
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {
                wait: 500,
                interval: 1,
            })
            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toBeDisplayed',
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
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
                interval: 1,
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
                interval: 1,
            })

            expect(result.pass).toBe(true)
            expect(element.isDisplayed).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toBeDisplayed(element)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
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

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        })

        test('not - success (with wait) - pass should be false', async () => {
            vi.mocked(element.isDisplayed).mockResolvedValue(false)

            const result = await thisNotContext.toBeDisplayed(element)

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), true,  {
                wait: 20,
                interval: 1,
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
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })

        test('undefined - failure', async () => {
            const element = undefined as unknown as WebdriverIO.Element

            const result = await thisContext.toBeDisplayed(element)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect  to be displayed

Expected: "displayed"
Received: "not displayed"`)
        })
    })

    describe.each(
        [{ fn: setOptions, name: 'setOptions' }, { fn: setDefaultOptions, name: 'setDefaultOptions' }]
    )('Global default options with $name', ({ fn: setDefaultOptionsFn }) => {
        describe('global options', () => {
            const defaultOptions = { ...DEFAULT_OPTIONS }

            let el: ChainablePromiseElement

            beforeEach(async () => {
                setDefaultOptionsFn({ wait: 99, interval: 101 })
                el = await $('sel')
                el.isDisplayed = vi.fn().mockResolvedValue(true)

            })

            afterEach(() => {
                setDefaultOptionsFn(defaultOptions)
            })

            test('should use globally set default options with executeCommandBe', async () => {
                await thisContext.toBeDisplayed(el)

                expect(executeCommandBe).toHaveBeenCalledWith(
                    el,
                    expect.anything(),
                    expect.objectContaining({ wait: 99, interval: 101 })
                )
            })

            test('should use globally set default options with isDisplayed', async () => {

                await thisContext.toBeDisplayed(el)

                expect(executeCommandBe).toHaveBeenCalledWith(
                    el,
                    expect.anything(),
                    expect.objectContaining({ wait: 99, interval: 101 })
                )
                expect(el.isDisplayed).toHaveBeenCalledWith(
                    {
                        withinViewport: false,
                        contentVisibilityAuto: true,
                        opacityProperty: true,
                        visibilityProperty: true
                    }
                )
            })
        })
    })
})
