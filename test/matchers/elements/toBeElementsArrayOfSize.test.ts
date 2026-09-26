import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import { $$ } from '@wdio/globals'

import { toBeElementsArrayOfSize } from '../../../src/matchers/elements/toBeElementsArrayOfSize.js'
import { browserFactory, chainableElementArrayFactory, createMultiRemoteElementArrayMock, elementArrayFactory, elementFactory, multiRemoteBrowserFactory } from '../../__mocks__/@wdio/globals.js'
import { refetchElements } from '../../../src/util/refetchElements.js'
import stripAnsi from 'strip-ansi'
import { multiRemote } from '../../../src/api/index.js'
import { waitUntil } from '../../../src/util/waitUntil.js'

vi.mock('@wdio/globals')

describe(toBeElementsArrayOfSize, async () => {
    let thisContext: { toBeElementsArrayOfSize: typeof toBeElementsArrayOfSize }
    let thisNotContext: { toBeElementsArrayOfSize: typeof toBeElementsArrayOfSize, isNot: boolean }

    beforeEach(() => {
        thisContext = { toBeElementsArrayOfSize }
        thisNotContext = { toBeElementsArrayOfSize, isNot: true }
    })

    describe.each([
        { elements: await $$('elements'), title: 'awaited ChainablePromiseArray', selectorName: '$$(`elements`)' },
        { elements: await $$('elements').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },
        { elements: await $$('elements').filter((t) => t.isEnabled()), title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])', selectorName: '[$$(`elements`)[0],$$(`elements`)[1]]' },
        { elements: [elementFactory('element'), elementFactory('element')], selectorName: '[$(`element`),$(`element`)]', title: 'Array of element (e.g. WebdriverIO.Element[])' },
        { elements: $$('elements'), title: 'non-awaited of ChainablePromiseArray' },
        { elements: $$('elements').getElements() as unknown as ChainablePromiseArray, title: 'non-awaited of ChainablePromiseArray' },
        { elements: $$('elements').filter((t) => t.isEnabled()) as unknown as ChainablePromiseArray, selectorName:'[$$(`elements`)[0],$$(`elements`)[1]]', title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },
    ])('given multiple elements when $title', ({ elements, selectorName = '$$(`elements`)' }) => {
        let els: ChainablePromiseArray | WebdriverIO.Element[] | WebdriverIO.ElementArray

        beforeEach(() => {
            els = elements
        })

        describe('success', () => {
            test('array of size 2', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toBeElementsArrayOfSize(els, 2, { beforeAssertion, afterAssertion, wait: 0 })

                expect(waitUntil).toHaveBeenCalledWith(
                    expect.any(Function),
                    undefined,
                    { wait: 0, interval: undefined }
                )
                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toBeElementsArrayOfSize',
                    expectedValue: 2,
                    options: { beforeAssertion, afterAssertion, wait: 0 }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toBeElementsArrayOfSize',
                    expectedValue: 2,
                    options: { beforeAssertion, afterAssertion, wait: 0 },
                    result
                })
            })

            test.for([
                0, 1, 3
            ])('not - success - pass should be false', async (expectedNotToBeSizeOf) => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, expectedNotToBeSizeOf)

                expect(result.pass).toBe(false) // success, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: ${expectedNotToBeSizeOf}
Received      : 2`)

            })
        })

        describe('failure', () => {
            test('fails with proper error message', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(els, 5)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be elements array of size

Expected: 5
Received: 2`
                )
            })

            test('fails - in between - with proper error message', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(els, { gte: 3, lte: 5 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be elements array of size

Expected: >= 3 && <= 5
Received: 2`
                )
            })

            test('not - failure - pass should be true', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, 2)

                expect(result.pass).toBe(true) // failure, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: 2
Received      : 2`
                )
            })

            test('not - failure - lte - pass should be true', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, { lte: 3 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: <= 3
Received      : 2`
                )
            })

            test('not - failure - gte - pass should be true', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, { gte: 1 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: >= 1
Received      : 2`
                )
            })

        })

        describe('error catching', () => {
            test('throws error with incorrect size param', async () => {
                await expect(thisContext.toBeElementsArrayOfSize(els, '5' as any)).rejects.toThrow('Invalid NumberMatcher. Received: "5"')
            })

            test('works if size contains options', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(els, { lte: 5 })
                expect(result.pass).toBe(true)
            })
        })

        describe('number options', () => {
            test.each([
                ['number - equal', 2, true],
                ['number - equal - fail 1', 1, false],
                ['number - equal - fail 2', 3, false],
            ])('should handle %s correctly', async (_title, expectedNumberValue, expectedPass) => {
                const result = await thisContext.toBeElementsArrayOfSize(els, expectedNumberValue,  { wait: 0 })

                expect(result.pass).toBe(expectedPass)
            })

            test.each([
                ['gte - equal', { gte: 2 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['gte - fail', { gte: 1 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['gte', { gte: 3 } satisfies ExpectWebdriverIO.NumberOptions, false],
                ['lte - equal', { lte: 2 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['lte - fail', { lte: 3 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['lte', { lte: 1 } satisfies ExpectWebdriverIO.NumberOptions, false],
                ['gte and lte', { gte: 1, lte: 10 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['not gte but is lte', { gte: 10, lte: 10 } satisfies ExpectWebdriverIO.NumberOptions, false],
                ['not lte but is gte', { gte: 1, lte: 1 } satisfies ExpectWebdriverIO.NumberOptions, false],
            ])('should handle %s correctly', async (_title, expectedNumberValue: ExpectWebdriverIO.NumberOptions, expectedPass) => {
                const result = await thisContext.toBeElementsArrayOfSize(els, expectedNumberValue)

                expect(result.pass).toBe(expectedPass)
            })
        })
    })

    describe('Refresh ElementArray', async () => {
        let elements: ChainablePromiseArray | WebdriverIO.Element[] | WebdriverIO.ElementArray
        let nonAwaitedElements: ChainablePromiseArray | WebdriverIO.Element[] | WebdriverIO.ElementArray
        let browser: WebdriverIO.Browser
        let elementArrayOf2: ChainablePromiseArray
        let elementArrayOf5: ChainablePromiseArray

        beforeEach(async () => {
            const actuatlRefetchElements = await vi.importActual<typeof import('../../../src/util/refetchElements.js')>('../../../src/util/refetchElements.js')
            vi.spyOn(actuatlRefetchElements, 'refetchElements')

            nonAwaitedElements = $$('elements')
            elements = await nonAwaitedElements
            browser = await elements.parent as WebdriverIO.Browser
            elementArrayOf2 = await chainableElementArrayFactory('elements', 2, browser)
            elementArrayOf5 = await chainableElementArrayFactory('elements', 5, browser)
        })

        test('does not refresh the element array with the wait 0', async () => {
            vi.mocked(browser.$$)
                .mockResolvedValueOnce(elementArrayOf2)
                .mockResolvedValue(elementArrayOf5)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { beforeAssertion: undefined, afterAssertion: undefined, wait: 0 })

            expect(result.pass).toBe(true)
            expect(browser.$$).toHaveBeenCalledTimes(0)
            expect(waitUntil).toHaveBeenCalledWith(
                expect.any(Function),
                undefined,
                expect.objectContaining({ wait: 0 })
            )
        })

        test('refresh once the elements array using parent $$ and update actual element with newly fetched elements', async () => {
            vi.mocked(browser.$$).mockReturnValue(elementArrayOf5)
            const result = await thisContext.toBeElementsArrayOfSize(elements, 5, { wait: 95, interval: 50 })

            expect(result.pass).toBe(true)
            expect(elements).toBe(elements) // Original actual elements array but altered
            expect(elements.length).toBe(5) // Altered actual elements array
            expect(browser.$$).toHaveBeenCalledTimes(1)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elements)
            expect(refetchElements).toHaveBeenCalledTimes(1)
        })

        test('refresh multiple time actual elements but does not update it since it failed', async () => {
            vi.mocked(browser.$$)
                .mockResolvedValueOnce(elementArrayOf2)
                .mockResolvedValue(elementArrayOf5)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 10, { wait: 198, interval: 20 })

            expect(result.pass).toBe(false)
            expect(elements.length).toBe(2)
            expect(elements).toBe(elements) // Original actual elements array but altered
            expect(browser.$$).toHaveBeenCalledTimes(9)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elements)
            expect(refetchElements).toHaveBeenNthCalledWith(2, elementArrayOf2)
            expect(refetchElements).toHaveBeenNthCalledWith(3, elementArrayOf5)
        })

        test('refresh once but does not update actual elements since they are not of type ElementArray or Element[]', async () => {
            vi.mocked(browser.$$)
                .mockResolvedValueOnce(elementArrayOf2)
                .mockResolvedValue(elementArrayOf5)

            const result = await thisContext.toBeElementsArrayOfSize(nonAwaitedElements, 5, { wait: 500 })

            expect(result.pass).toBe(true)
            expect(nonAwaitedElements).toBeInstanceOf(Promise)
            expect((await nonAwaitedElements).length).toBe(5)
            expect(await nonAwaitedElements).toBe(elements) // Original actual elements array but altered
            expect(browser.$$).toHaveBeenCalledTimes(2)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elements)
            expect(refetchElements).toHaveBeenCalledTimes(2)
        })

        test.for([
            elementArrayFactory('elements', 2),
            await chainableElementArrayFactory('elements', 2),
            [elementFactory('elements', 0), elementFactory('elements', 1)]
        ])('Does not refetch and does not alter the actual elements array when it size matches on first try', async () => {
            const receivedArray = elementArrayFactory('elements', 2)
            const result = await thisContext.toBeElementsArrayOfSize(receivedArray, 2)

            expect(result.pass).toBe(true)
            expect(receivedArray.length).toBe(2)
            expect(receivedArray).toBe(receivedArray)
            expect(browser.$$).not.toHaveBeenCalled()
            expect(refetchElements).not.toHaveBeenCalled()
        })

        test('refresh once the element array with the NumberOptions wait value', async () => {
            vi.mocked(browser.$$)
                .mockReturnValueOnce(elementArrayOf2)
                .mockReturnValue(elementArrayOf5)

            const result = await thisContext.toBeElementsArrayOfSize(elements, { gte: 5, wait: 450, interval: 100 })

            expect(result.pass).toBe(true)
            expect(elements.length).toBe(5)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elements)
            expect(browser.$$).toHaveBeenCalledTimes(2)
            expect(waitUntil).toHaveBeenCalledWith(
                expect.any(Function),
                undefined,
                { wait: 450, interval: 100 }
            )
        })

        test('refresh once the element array with the DEFAULT_OPTIONS wait value', async () => {
            vi.mocked(browser.$$)
                .mockReturnValueOnce(elementArrayOf2)
                .mockReturnValue(elementArrayOf5)

            const result = await thisContext.toBeElementsArrayOfSize(elements, { gte: 5 }, { beforeAssertion: undefined, afterAssertion: undefined })

            expect(result.pass).toBe(true)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elements)
            expect(browser.$$).toHaveBeenCalledTimes(2)
            expect(waitUntil).toHaveBeenCalledWith(
                expect.any(Function),
                undefined,
                { wait: undefined, interval: undefined }
            )
        })
    })

    describe('Works with differenet ElementArray or Element[] sizes', () => {
        test.for([
            0, 1, 2, 3, 4, 5, 10
        ])('ChainablePromiseArray of size %i', async (size) => {
            const els = chainableElementArrayFactory('elements', size)

            const result = await thisContext.toBeElementsArrayOfSize(els, size)

            expect(result.pass).toBe(true)
        })

        test.for([
            0, 1, 2, 3, 4, 5, 10
        ])('ElementArray of size %i', async (size) => {
            const els = elementArrayFactory('elements', size)

            const result = await thisContext.toBeElementsArrayOfSize(els, size)

            expect(result.pass).toBe(true)
        })

        test.for([
            0, 1, 2, 3, 4, 5, 10
        ])('Element[] of size %i', async (size) => {
            const els = Array(size).fill(null).map((_, index) => elementFactory('element', index))

            const result = await thisContext.toBeElementsArrayOfSize(els, size)

            expect(result.pass).toBe(true)
        })
    })

    test('fails for empty expected value', async () => {
        const els = await $$('elements')

        await expect(thisContext.toBeElementsArrayOfSize(els, {})).rejects.toThrow('Invalid NumberMatcher. Received: {}')
        await expect(thisContext.toBeElementsArrayOfSize(els, {},  { wait: 0 })).rejects.toThrow('Invalid NumberMatcher. Received: {}')
    })

    describe.each([
        { flag: undefined, shape: 'MultiRemoteElement[] (default)' },
        { flag: 'true', shape: 'WdioMultiRemoteElementArray (WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY=true)' },
    ])('given a multi-remote $$() - $shape', ({ flag }) => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })
        let originalEnv: string | undefined

        beforeEach(() => {
            originalEnv = process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            if (flag) {
                process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = flag
            } else {
                delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            }
        })

        afterEach(() => {
            if (originalEnv === undefined) {
                delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            } else {
                process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = originalEnv
            }
            vi.unstubAllGlobals()
        })

        /** chrome finds 3 elements, firefox only 2: WebdriverIO zips them into 3 wrappers, the last one without firefox */
        const unevenElements = () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 3)
            const last = elements[2] as unknown as WebdriverIO.MultiRemoteElement
            const getInstance = last.getInstance.bind(last)
            last.getInstance = ((name: string) => {
                if (name === 'firefox') {
                    throw new Error('Multiremote object has no instance named "firefox"')
                }
                return getInstance(name)
            }) as WebdriverIO.MultiRemoteElement['getInstance']
            return elements
        }

        test('passes when every instance has the single expected size', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('passes with a NumberMatcher shared by every instance', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const result = await thisContext.toBeElementsArrayOfSize(elements, { gte: 1, lte: 2 }, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('passes with a promise of multi-remote elements', async () => {
            const elements = Promise.resolve(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('fails with a per-instance message when the size differs', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 3, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to be elements array of size

- Expected  - 2
+ Received  + 2

  Object {
-   "chrome": 3,
-   "firefox": 3,
+   "chrome": 2,
+   "firefox": 2,
  }`)
        })

        test('passes with .not when the size differs', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const result = await thisNotContext.toBeElementsArrayOfSize(elements, 3, { wait: 0 })

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('supports instance names colliding with NumberOptions keys with expect.multiRemote()', async () => {
            const elements = createMultiRemoteElementArrayMock({ eq: browserFactory(), firefox: browserFactory() }, 'sel', 2)

            const pass = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ eq: 2, firefox: { gte: 1 } }), { wait: 0 })
            const fail = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ eq: 2, firefox: 3 }), { wait: 0 })

            expect(pass.pass).toBe(true)
            expect(fail.pass).toBe(false)
        })

        test('passes with one size per instance, whatever the key order', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const result = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ firefox: { gte: 1 }, chrome: 2 }), { wait: 0 })

            expect(result.pass).toBe(true)
        })

        describe('when instances found a different number of elements', () => {
            test('counts elements per instance', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(unevenElements(), multiRemote({ chrome: 3, firefox: 2 }), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('fails a single size that only some instances match', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(unevenElements(), 3, { wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toContain('+   "firefox": 2,')
            })

            test('fails with .not when only some instances differ from a single size', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(unevenElements(), 3, { wait: 0 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('fails with .not when only some instances differ from their own size', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(unevenElements(), multiRemote({ chrome: 3, firefox: 5 }), { wait: 0 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('passes with .not when every instance differs', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(unevenElements(), multiRemote({ chrome: 4, firefox: 5 }), { wait: 0 })

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })
        })

        describe('when the per-instance sizes do not name exactly the instances', () => {
            test.each<{ name: string, expected: MultiRemoteValues<number> }>([
                { name: 'a missing instance', expected: { chrome: 2 } },
                { name: 'an unknown instance', expected: { chrome: 2, firefox: 2, safari: 2 } },
            ])('fails with $name', async ({ expected }) => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

                const result = await thisContext.toBeElementsArrayOfSize(elements, multiRemote(expected), { wait: 0 })

                expect(result.pass).toBe(false)
            })

            test('fails with .not too, without retrying', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

                const result = await thisNotContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 3 }), { wait: 500, interval: 10 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(refetchElements).not.toHaveBeenCalled()
            })
        })

        test('rejects a plain object: per-instance sizes require expect.multiRemote()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            // @ts-expect-error a plain object is a legacy NumberOptions, not per-instance sizes
            await expect(thisContext.toBeElementsArrayOfSize(elements, { chrome: 2, firefox: 3 }, { wait: 0 })).rejects.toThrow('Invalid NumberMatcher')
        })

        test('fails with a per-instance message with expect.multiRemote()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const withMatcher = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 2, firefox: 3 }), { wait: 0 })

            expect(withMatcher.pass).toBe(false)
            expect(stripAnsi(withMatcher.message())).toEqual(`\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to be elements array of size

- Expected  - 1
+ Received  + 1

  Object {
    "chrome": 2,
-   "firefox": 3,
+   "firefox": 2,
  }`
            )
        })

        test('checks one size per instance with expect.multiRemote()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const pass = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 2, firefox: { gte: 1 } }), { wait: 0 })
            const fail = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 2, firefox: 3 }), { wait: 0 })
            const unknown = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 2, safari: 2 }), { wait: 0 })

            expect(pass.pass).toBe(true)
            expect(fail.pass).toBe(false)
            expect(unknown.pass).toBe(false)
        })

        test('fails, instead of throwing, on misspelled instance names', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            const result = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ Chrome: 2, Firefox: 2 }), { wait: 0 })

            expect(result.pass).toBe(false)
        })

        test('throws on an invalid NumberMatcher', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)

            await expect(thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: {}, firefox: 2 }), { wait: 0 })).rejects.toThrow('Invalid NumberMatcher. Received: {}')
        })
    })

    describe('given a multi-remote $$() retried until the size matches', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })
        let originalEnv: string | undefined

        beforeEach(() => {
            originalEnv = process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
        })

        afterEach(() => {
            if (originalEnv === undefined) {
                delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            } else {
                process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = originalEnv
            }
            vi.unstubAllGlobals()
        })

        test('WdioMultiRemoteElementArray: refetches from its parent and synchronizes the received array', async () => {
            process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
            const parent = multiRemoteBrowserFactory(browsers())
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 1, parent)
            vi.mocked(parent.$$).mockResolvedValue(createMultiRemoteElementArrayMock(browsers(), 'sel', 2) as never)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { wait: 500, interval: 10 })

            expect(result.pass).toBe(true)
            expect(parent.$$).toHaveBeenCalledWith('sel')
            expect(elements).toHaveLength(2)
        })

        test('WdioMultiRemoteElementArray: an empty array takes its instances from its parent and retries', async () => {
            process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
            const parent = multiRemoteBrowserFactory(browsers())
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 0, parent)
            vi.mocked(parent.$$).mockResolvedValue(createMultiRemoteElementArrayMock(browsers(), 'sel', 1) as never)

            const result = await thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 1, firefox: 1 }), { wait: 500, interval: 10 })

            expect(result.pass).toBe(true)
        })

        test('MultiRemoteElement[]: refetches best effort from the global multiRemoteBrowser, with a warning', async () => {
            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            const globalMultiRemoteBrowser = multiRemoteBrowserFactory(browsers())
            vi.mocked(globalMultiRemoteBrowser.$$).mockResolvedValue(createMultiRemoteElementArrayMock(browsers(), 'sel', 2) as never)
            vi.stubGlobal('multiRemoteBrowser', globalMultiRemoteBrowser)
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 1)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { wait: 500, interval: 10 })

            expect(result.pass).toBe(true)
            expect(globalMultiRemoteBrowser.$$).toHaveBeenCalledWith('sel')
            expect(elements).toHaveLength(2)
            expect(warn.mock.calls.flat().join()).toMatch(/best effort.*WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY=true/s)
        })

        describe('an empty array outside multi-remote rejects per-instance sizes, like a non-empty one, instead of passing', () => {
            test('an empty regular ElementArray', async () => {
                const elements = await chainableElementArrayFactory('sel', 0)

                // @ts-expect-error per-instance sizes are only typed for multi-remote elements
                await expect(thisContext.toBeElementsArrayOfSize(elements, { chrome: 0, firefox: 0 }, { wait: 0 })).rejects.toThrow('Invalid NumberMatcher')
                // @ts-expect-error per-instance sizes are only typed for multi-remote elements
                await expect(thisNotContext.toBeElementsArrayOfSize(elements, { chrome: 1, firefox: 1 }, { wait: 0 })).rejects.toThrow('Invalid NumberMatcher')
            })

            test('an empty plain array with a single (non multi-remote) global browser', async () => {
                vi.stubGlobal('browser', browserFactory())
                const elements = [] as unknown as WebdriverIO.MultiRemoteElement[]

                await expect(thisContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 0, firefox: 0 }), { wait: 0 })).rejects.toThrow('Invalid NumberMatcher')
                await expect(thisNotContext.toBeElementsArrayOfSize(elements, multiRemote({ chrome: 1, firefox: 1 }), { wait: 0 })).rejects.toThrow('Invalid NumberMatcher')
            })
        })

        test('MultiRemoteElement[]: an empty (unknown instances) array accepts per-instance sizes instead of throwing', async () => {
            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY

            const pass = await thisContext.toBeElementsArrayOfSize([] as unknown as WebdriverIO.MultiRemoteElement[], multiRemote({ chrome: 0, firefox: 0 }), { wait: 0 })
            const fail = await thisContext.toBeElementsArrayOfSize([] as unknown as WebdriverIO.MultiRemoteElement[], multiRemote({ chrome: 2, firefox: 2 }), { wait: 0 })

            expect(pass.pass).toBe(true)
            expect(fail.pass).toBe(false)
        })

        describe('MultiRemoteElement[]: an empty array checks per-instance sizes against the global multiRemoteBrowser instances', () => {
            const emptyElements = () => [] as unknown as WebdriverIO.MultiRemoteElement[]

            beforeEach(() => {
                delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
                vi.stubGlobal('multiRemoteBrowser', multiRemoteBrowserFactory(browsers()))
            })

            test('passes when naming exactly the instances', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(emptyElements(), multiRemote({ firefox: 0, chrome: 0 }), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test.each<{ name: string, expected: MultiRemoteValues<number> }>([
                { name: 'a missing instance', expected: { chrome: 0 } },
                { name: 'misspelled instances', expected: { Chrome: 0, Firefox: 0 } },
                { name: 'an unknown instance', expected: { chrome: 0, firefox: 0, safari: 0 } },
            ])('fails with $name, also with .not', async ({ expected }) => {
                const result = await thisContext.toBeElementsArrayOfSize(emptyElements(), multiRemote(expected), { wait: 0 })
                const notResult = await thisNotContext.toBeElementsArrayOfSize(emptyElements(), multiRemote(expected), { wait: 0 })

                expect(result.pass).toBe(false)
                expect(notResult.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('falls back on the expected instance names when the global multiRemoteBrowser has no registered browser', async () => {
                vi.stubGlobal('multiRemoteBrowser', new Proxy({}, { get: () => { throw new Error('No browser instance registered') } }))

                const result = await thisContext.toBeElementsArrayOfSize(emptyElements(), multiRemote({ chrome: 0 }), { wait: 0 })

                expect(result.pass).toBe(true)
            })
        })

        test('MultiRemoteElement[]: keeps refetching from the received elements when a best-effort refetch is empty', async () => {
            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            const globalMultiRemoteBrowser = { $$: vi.fn()
                .mockResolvedValueOnce([])
                .mockResolvedValue(createMultiRemoteElementArrayMock(browsers(), 'sel', 2)) }
            vi.stubGlobal('multiRemoteBrowser', globalMultiRemoteBrowser)
            vi.spyOn(console, 'warn').mockImplementation(() => {})
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 1)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { wait: 500, interval: 10 })

            expect(result.pass).toBe(true)
            expect(globalMultiRemoteBrowser.$$).toHaveBeenCalledTimes(2)
            expect(elements).toHaveLength(2)
        })

        test('MultiRemoteElement[]: without the global multiRemoteBrowser, keeps comparing the same elements instead of throwing', async () => {
            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            vi.spyOn(console, 'warn').mockImplementation(() => {})
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 1)

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { wait: 50, interval: 10 })

            expect(result.pass).toBe(false)
            expect(elements).toHaveLength(1)
        })
    })
})
