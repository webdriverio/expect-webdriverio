import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { executeCommandWithStrategy, multipleElementResultsStrategy } from '../../src/util/executeCommand'
import { browserFactory, chainableElementArrayFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../__mocks__/@wdio/globals'
import { $ } from '@wdio/globals'
import { some } from '../../src/api/index.js'

vi.mock('@wdio/globals')

describe('executeCommand', () => {
    describe('arrayContaining collection opt-in', () => {
        it.each([false, true])('compares the snapshot once without applying negation (isNot: %s)', async (isNot) => {
            const elements = await chainableElementArrayFactory('selector', 2)
            const expected = expect.arrayContaining(['Second'])
            const asymmetricMatch = vi.spyOn(expected, 'asymmetricMatch')
            const result = await executeCommandWithStrategy({
                unresolvedElements: elements,
                expectedValues: expected,
                supportsArrayContaining: true,
                singleElementCompare: async (_element, _expected, index) => ({ success: false, actual: index === 0 ? 'First' : 'Second' }),
                context: { isNot, iteration: 0 },
            })
            expect(result.success).toBe(true)
            expect(result.actual).toEqual(['First', 'Second'])
            expect(asymmetricMatch).toHaveBeenCalledExactlyOnceWith(['First', 'Second'], expect.any(Object))
        })

        it('keeps non-opted-in matchers on their per-element strategy', async () => {
            const result = await executeCommandWithStrategy({
                unresolvedElements: chainableElementArrayFactory('selector', 2),
                expectedValues: expect.arrayContaining(['First']),
                singleElementCompare: async () => ({ success: false, actual: 'First' }),
                context: { isNot: false, iteration: 0 },
            })
            expect(result.success).toBe(false)
        })

        it('keeps some() matching per-element array values', async () => {
            const result = await executeCommandWithStrategy({
                unresolvedElements: some(chainableElementArrayFactory('selector', 2)),
                expectedValues: expect.arrayContaining(['First']),
                supportsArrayContaining: true,
                singleElementCompare: async (_element, _expected, index) => ({ success: index === 0, actual: index === 0 ? ['First'] : ['Other'] }),
                context: { isNot: false, iteration: 0 },
            })
            expect(result.success).toBe(true)
            expect(result.context).toEqual({ isSome: true })
        })

        it('rejects multi-remote elements under the legacy strategy', async () => {
            const elements = createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'sel', 2)

            await expect(executeCommandWithStrategy({
                unresolvedElements: elements,
                expectedValues: 'Match',
                singleElementCompare: async () => ({ success: true, actual: 'Match' }),
                context: { isNot: false, iteration: 0 },
                strategy: 'LegacyLooseMultipleElements',
            })).rejects.toThrow('Multi-remote elements works only when enabling `useToHaveTextStrictMultiElementsCompareStrategy`')
        })
    })

    describe('multipleElementResultsStrategy', () => {

        const mockSingleCompare = vi.fn()

        describe('given a single element', () => {
            const element = $('selector')

            it('should return success true when the element matches the expected value', async () => {
                mockSingleCompare.mockResolvedValue({ success: true, actual: 'Match' })

                const result = await multipleElementResultsStrategy(
                    element,
                    'Match',
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(true)
                expect(result.actual).toEqual('Match')
            })

            it('should return success false when the element does not match the expected value', async () => {
                mockSingleCompare.mockResolvedValue({ success: false, actual: 'No Match' })

                const result = await multipleElementResultsStrategy(
                    element,
                    'Match',
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(false)
            })
        })

        describe('given multiple elements', () => {
            const threeElements = chainableElementArrayFactory('selector', 3)
            const twoElements = chainableElementArrayFactory('selector', 2)
            const oneElements = chainableElementArrayFactory('selector', 1)

            it('should return success true when all elements match expected values', async () => {
                mockSingleCompare.mockResolvedValue({ success: true, actual: 'Match' })

                const result = await multipleElementResultsStrategy(
                    threeElements,
                    ['Match', 'Match', 'Match'],
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(true)
                expect(result.actual).toEqual(['Match', 'Match', 'Match'])
            })

            it('should return success false when some elements do not match', async () => {
                mockSingleCompare
                    .mockResolvedValueOnce({ success: true, actual: 'Match' })
                    .mockResolvedValueOnce({ success: false, actual: 'No Match' })
                    .mockResolvedValueOnce({ success: true, actual: 'Match' })

                const result = await multipleElementResultsStrategy(
                    threeElements,
                    ['Match', 'Match', 'Match'],
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(false)
            })

            it('should pass (success=false) with .not when all elements fail to match', async () => {
                mockSingleCompare.mockResolvedValue({ success: false, actual: 'Other' })

                const result = await multipleElementResultsStrategy(
                    twoElements,
                    'Match',
                    mockSingleCompare,
                    { isNot: true, isSome: false, iteration: 0 } // isNot: true
                )

                expect(result.success).toBe(false) // false is success for .not, since it is inverted later by Jest
            })

            it('should fail (success=true) when using .not but one element matches', async () => {
                mockSingleCompare
                    .mockResolvedValueOnce({ success: false, actual: 'Other' })
                    .mockResolvedValueOnce({ success: true, actual: 'Match' })

                const result = await multipleElementResultsStrategy(
                    twoElements,
                    'Match',
                    mockSingleCompare,
                    { isNot: true, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(true) // true is failure for .not, since it is inverted later by Jest
            })

            it('should fail when no elements are found (default behavior)', async () => {
                const result = await multipleElementResultsStrategy(
                    [],
                    'Match',
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(false)
            })

            it('should pass (success=false) with .not when no elements are found and allowEmptyElements is true', async () => {
                const result = await multipleElementResultsStrategy(
                    [],
                    'Match',
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 },
                    { allowEmptyElements: true }
                )

                expect(result.success).toBe(false) // false is success for .not, since it is inverted later by Jest
            })

            it('should handle missing elements compared to expected values array', async () => {
                const expected = ['A', 'B'] // Expecting 2

                mockSingleCompare.mockResolvedValue({ success: true, actual: 'A' })

                const result = await multipleElementResultsStrategy(
                    oneElements,
                    expected,
                    mockSingleCompare,
                    { isNot: false, isSome: false, iteration: 0 },
                )

                expect(result.success).toBe(false)
                expect(result.actual).toEqual(['A', undefined])
            })
        })

        describe('given a single multi-remote element ($())', () => {
            const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

            it('replicates a single (non-keyed) expected value across every instance', async () => {
                const element = createMultiRemoteElementMock(browsers(), 'sel')
                const compare = vi.fn(async (el: WebdriverIO.Element) => ({ success: true, actual: await el.getText() }))
                vi.mocked(element.getInstance('chrome').getText).mockResolvedValue('chrome-text')
                vi.mocked(element.getInstance('firefox').getText).mockResolvedValue('firefox-text')

                const result = await multipleElementResultsStrategy(
                    element,
                    'Match',
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(compare).toHaveBeenCalledTimes(2)
                expect(compare).toHaveBeenCalledWith(element.getInstance('chrome'), 'Match')
                expect(compare).toHaveBeenCalledWith(element.getInstance('firefox'), 'Match')
                expect(result.success).toBe(true)
                expect(result.actual).toEqual({ chrome: 'chrome-text', firefox: 'firefox-text' })
            })

            it('compares each instance against its own expected value when given a MultiRemoteValues object', async () => {
                const element = createMultiRemoteElementMock(browsers(), 'sel')
                const compare = vi.fn(async (_el: WebdriverIO.Element, expected: unknown) => ({ success: true, actual: expected }))

                const result = await multipleElementResultsStrategy(
                    element,
                    { chrome: 'Chrome expected', firefox: 'Firefox expected' },
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(compare).toHaveBeenCalledWith(element.getInstance('chrome'), 'Chrome expected')
                expect(compare).toHaveBeenCalledWith(element.getInstance('firefox'), 'Firefox expected')
                expect(result.success).toBe(true)
                expect(result.actual).toEqual({ chrome: 'Chrome expected', firefox: 'Firefox expected' })
            })

            it('fails gracefully with undefined actual when the expected value targets an instance that does not exist', async () => {
                const element = createMultiRemoteElementMock(browsers(), 'sel')
                const compare = vi.fn(async () => ({ success: true, actual: 'ignored' }))

                const result = await multipleElementResultsStrategy(
                    element,
                    { chrome: 'Chrome expected', safari: 'Safari expected' },
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                // Strict: firefox is still compared (for its actual) but not expected, safari does not exist.
                expect(compare).toHaveBeenCalledTimes(2)
                expect(compare).toHaveBeenCalledWith(expect.anything(), undefined)
                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: 'ignored', firefox: 'ignored', safari: undefined })
            })

            it('fails when the expected value omits an instance, even if every named instance matches', async () => {
                const element = createMultiRemoteElementMock(browsers(), 'sel')
                const compare = vi.fn(async () => ({ success: true, actual: 'Match' }))

                const result = await multipleElementResultsStrategy(element, { chrome: 'Match' }, compare, { isNot: false, isSome: false, iteration: 0 })

                expect(compare).toHaveBeenCalledTimes(2)
                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: 'Match', firefox: 'Match' })
            })
        })

        describe.each([
            { flag: undefined, shape: 'MultiRemoteElement[] (default)' },
            { flag: 'true', shape: 'WdioMultiRemoteElementArray (WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY=true)' },
        ])('given a multi-remote element array ($$()) - $shape', ({ flag }) => {
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
            })

            it('compares every element across every instance and actually waits for all comparisons (regression for the forEach/await bug)', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async (el: WebdriverIO.Element) => ({ success: true, actual: await el.getText() }))

                const result = await multipleElementResultsStrategy(
                    elements,
                    'Match',
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                // 2 elements x 2 instances: if the comparisons weren't actually awaited, this would be 0.
                expect(compare).toHaveBeenCalledTimes(4)
                expect(result.success).toBe(true)
                expect(result.actual).toEqual({
                    chrome: [' Valid Text ', ' Valid Text '],
                    firefox: [' Valid Text ', ' Valid Text '],
                })
            })

            it('fails when any element/instance comparison fails', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn()
                    .mockResolvedValueOnce({ success: true, actual: 'ok' })
                    .mockResolvedValueOnce({ success: false, actual: 'not ok' })
                    .mockResolvedValue({ success: true, actual: 'ok' })

                const result = await multipleElementResultsStrategy(
                    elements,
                    'Match',
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(false)
            })

            it('keeps actuals in element order even when comparisons resolve out of order', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async (_el: WebdriverIO.Element, _expected: unknown, index?: number) => {
                    // First element resolves last
                    await new Promise((resolve) => setTimeout(resolve, index === 0 ? 10 : 0))
                    return { success: true, actual: `el${index}` }
                })

                const result = await multipleElementResultsStrategy(elements, 'Match', compare, { isNot: false, isSome: false, iteration: 0 })

                expect(result.actual).toEqual({ chrome: ['el0', 'el1'], firefox: ['el0', 'el1'] })
            })

            it('fails strictly when an instance expects more values than there are elements, still reporting actuals', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async () => ({ success: true, actual: 'a' }))

                const result = await multipleElementResultsStrategy(
                    elements,
                    { chrome: ['a', 'a', 'c'], firefox: ['a', 'a'] },
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(compare).toHaveBeenCalledTimes(4)
                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: ['a', 'a', undefined], firefox: ['a', 'a'] })
            })

            it('fails strictly when an instance expects fewer values than there are elements', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async () => ({ success: true, actual: 'a' }))

                const result = await multipleElementResultsStrategy(
                    elements,
                    { chrome: ['a'], firefox: ['a', 'a'] },
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(false)
            })

            it('fails strictly when the expected value omits an instance, still comparing every instance', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async () => ({ success: true, actual: 'a' }))

                const result = await multipleElementResultsStrategy(elements, { chrome: ['a', 'a'] }, compare, { isNot: false, isSome: false, iteration: 0 })

                expect(compare).toHaveBeenCalledTimes(4)
                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: ['a', 'a'], firefox: ['a', 'a'] })
            })

            it('fails strictly when the expected value names an unknown instance', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async () => ({ success: true, actual: 'a' }))

                const result = await multipleElementResultsStrategy(
                    elements,
                    { chrome: ['a', 'a'], firefox: ['a', 'a'], safari: ['a', 'a'] },
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(false)
            })

            it('passes when per-instance expected arrays match every element', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async () => ({ success: true, actual: 'a' }))

                const result = await multipleElementResultsStrategy(
                    elements,
                    { chrome: ['a', 'a'], firefox: ['a', 'a'] },
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(result.success).toBe(true)
            })

            it(`${flag ? 'retries (no abort)' : 'aborts'} when empty since only the MultiRemoteElementArray shape can be refetched`, async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 0)

                const result = await multipleElementResultsStrategy(elements, 'Match', vi.fn(), { isNot: false, isSome: false, iteration: 0 })

                expect(result.success).toBe(false)
                expect(result.abort).toBe(!flag)
            })

            it('fails when an instance found no element, reporting its own (empty) elements', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 1)
                const firstElement = elements[0] as unknown as WebdriverIO.MultiRemoteElement
                const originalGetInstance = firstElement.getInstance.bind(firstElement)
                firstElement.getInstance = vi.fn((name: string) => {
                    if (name === 'firefox') {
                        throw new Error('Multiremote object has no instance named "firefox"')
                    }
                    return originalGetInstance(name)
                })
                const compare = vi.fn(async (el: WebdriverIO.Element) => ({ success: true, actual: await el.getText() }))

                const result = await multipleElementResultsStrategy(
                    elements,
                    'Match',
                    compare,
                    { isNot: false, isSome: false, iteration: 0 }
                )

                expect(compare).toHaveBeenCalledTimes(1)
                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: [' Valid Text '], firefox: [] })
            })
        })
    })

    describe('multi-remote strict strategy', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })
        const context = { isNot: false, isSome: false, iteration: 0 }
        const notContext = { isNot: true, isSome: false, iteration: 0 }
        const compareEquals = vi.fn(async (_el: WebdriverIO.Element, expected: unknown) => ({ success: expected === 'a', actual: 'a' }))

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

        describe('given per-instance values whose names are all unknown', () => {
            it.each([
                { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel') },
                { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2) },
            ])('fails strictly on $name, also with .not, and aborts', async ({ subject }) => {
                const result = await multipleElementResultsStrategy(subject(), { safari: 'a' }, compareEquals, context)
                const notResult = await multipleElementResultsStrategy(subject(), { safari: 'a' }, compareEquals, notContext)

                expect(result).toEqual(expect.objectContaining({ success: false, abort: true }))
                expect(notResult).toEqual(expect.objectContaining({ success: true, abort: true })) // failure, inverted later by `.not`
            })

            it('keeps an object as a literal expected value when the matcher allows it (e.g. styles)', async () => {
                const compare = vi.fn(async (_el: WebdriverIO.Element, expected: unknown) => ({ success: (expected as { color: string }).color === 'red', actual: 'red' }))

                const result = await multipleElementResultsStrategy(createMultiRemoteElementMock(browsers(), 'sel'), { color: 'red' }, compare, context, { allowObjectExpectedValue: true })

                expect(result.success).toBe(true)
                expect(compare).toHaveBeenCalledWith(expect.anything(), { color: 'red' })
            })
        })

        it('aborts on a missing instance for $() instead of retrying', async () => {
            const result = await multipleElementResultsStrategy(createMultiRemoteElementMock(browsers(), 'sel'), { chrome: 'a' }, compareEquals, context)

            expect(result).toEqual(expect.objectContaining({ success: false, abort: true, actual: { chrome: 'a', firefox: 'a' } }))
        })

        describe('given an array expected value on $()', () => {
            it('compares every instance against the array when the matcher supports it (e.g. classes)', async () => {
                const compare = vi.fn(async (_el: WebdriverIO.Element, expected: unknown) => ({ success: Array.isArray(expected), actual: 'a b' }))

                const result = await multipleElementResultsStrategy(createMultiRemoteElementMock(browsers(), 'sel'), ['a', 'b'], compare, context, { allowArrayWithSingleElement: true })

                expect(result.success).toBe(true)
                expect(compare).toHaveBeenCalledTimes(2)
                expect(compare).toHaveBeenCalledWith(expect.anything(), ['a', 'b'])
            })

            it('fails strictly and aborts when the matcher does not support it', async () => {
                const result = await multipleElementResultsStrategy(createMultiRemoteElementMock(browsers(), 'sel'), ['a', 'b'], compareEquals, context)

                expect(result).toEqual(expect.objectContaining({ success: false, abort: true, actual: { chrome: 'a', firefox: 'a' } }))
                expect(compareEquals).toHaveBeenCalledWith(expect.anything(), undefined)
            })
        })

        describe('given instances with a different number of elements', () => {
            it('compares per-instance arrays against each instance own elements', async () => {
                const result = await multipleElementResultsStrategy(unevenElements(), { chrome: ['a', 'a', 'a'], firefox: ['a', 'a'] }, compareEquals, context)

                expect(result.success).toBe(true)
                expect(result.actual).toEqual({ chrome: ['a', 'a', 'a'], firefox: ['a', 'a'] })
            })

            it('passes a single expected value when every element of every instance matches', async () => {
                const result = await multipleElementResultsStrategy(unevenElements(), 'a', compareEquals, context)

                expect(result.success).toBe(true)
                expect(result.expected).toEqual({ chrome: ['a', 'a', 'a'], firefox: ['a', 'a'] })
            })

            it('fails when an expected array does not match the instance own element count, without aborting', async () => {
                const result = await multipleElementResultsStrategy(unevenElements(), { chrome: ['a', 'a'], firefox: ['a', 'a'] }, compareEquals, context)

                expect(result.success).toBe(false)
                expect(result.abort).toBeUndefined()
            })
        })

        it('returns the expected value per instance and per element for $$() failure messages', async () => {
            const result = await multipleElementResultsStrategy(createMultiRemoteElementArrayMock(browsers(), 'sel', 2), 'b', compareEquals, context)

            expect(result.success).toBe(false)
            expect(result.expected).toEqual({ chrome: ['b', 'b'], firefox: ['b', 'b'] })
        })

        describe('given some()', () => {
            it('requires at least one matching element in every instance', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                // Only chrome's first element matches
                const compare = vi.fn(async (el: WebdriverIO.Element) => ({ success: el === (elements[0] as unknown as WebdriverIO.MultiRemoteElement).getInstance('chrome'), actual: '' }))

                const result = await multipleElementResultsStrategy(elements, 'a', compare, { isNot: false, isSome: true, iteration: 0 })

                expect(result.success).toBe(false)
            })

            it('passes when every instance has at least one matching element', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const firstElements = ['chrome', 'firefox'].map((name) => (elements[0] as unknown as WebdriverIO.MultiRemoteElement).getInstance(name))
                const compare = vi.fn(async (el: WebdriverIO.Element) => ({ success: firstElements.includes(el), actual: '' }))

                const result = await multipleElementResultsStrategy(elements, 'a', compare, { isNot: false, isSome: true, iteration: 0 })

                expect(result.success).toBe(true)
            })
        })

        it.each([
            { name: 'a single element', subject: () => $('sel') },
            { name: 'an element array', subject: () => chainableElementArrayFactory('sel', 2) },
        ])('fails strictly and aborts on per-instance values for $name', async ({ subject }) => {
            const result = await multipleElementResultsStrategy(subject(), { chrome: 'a', firefox: 'a' }, compareEquals, notContext)

            expect(result).toEqual(expect.objectContaining({ success: true, abort: true })) // failure, inverted later by `.not`
            // Still compared for the actual value, but never against the per-instance values
            expect(compareEquals.mock.calls.every(([, expected]) => expected === undefined)).toBe(true)
        })

        describe('given arrayContaining', () => {
            it('requires every instance own collection to satisfy it', async () => {
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
                const compare = vi.fn(async (_el: WebdriverIO.Element, _expected: unknown, index?: number) => ({ success: false, actual: `item${index}` }))

                const result = await executeCommandWithStrategy({
                    unresolvedElements: elements,
                    expectedValues: expect.arrayContaining(['item1']),
                    supportsArrayContaining: 'arrayOnly',
                    singleElementCompare: compare,
                    context: { isNot: false, iteration: 0 },
                })

                expect(result.success).toBe(true)
                expect(result.actual).toEqual({ chrome: ['item0', 'item1'], firefox: ['item0', 'item1'] })
            })

            it('fails when one instance collection does not satisfy it', async () => {
                const result = await executeCommandWithStrategy({
                    unresolvedElements: unevenElements(),
                    expectedValues: expect.arrayContaining(['item2']),
                    supportsArrayContaining: 'arrayOnly',
                    singleElementCompare: async (_el, _expected, index) => ({ success: false, actual: `item${index}` }),
                    context: { isNot: false, iteration: 0 },
                })

                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: ['item0', 'item1', 'item2'], firefox: ['item0', 'item1'] })
            })
        })

        describe('given a best-effort refetch (MultiRemoteElement[] without WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY)', () => {
            let originalEnv: string | undefined

            beforeEach(() => {
                originalEnv = process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
                delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
                vi.spyOn(console, 'warn').mockImplementation(() => {})
            })

            afterEach(() => {
                if (originalEnv !== undefined) {
                    process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = originalEnv
                }
                vi.unstubAllGlobals()
            })

            it('keeps the received elements, and so the selector, when a refetch is empty and keeps retrying', async () => {
                const globalMultiRemoteBrowser = { $$: vi.fn()
                    .mockResolvedValueOnce([])
                    .mockResolvedValueOnce(createMultiRemoteElementArrayMock(browsers(), 'sel', 2)) }
                vi.stubGlobal('multiRemoteBrowser', globalMultiRemoteBrowser)
                const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 1)

                const first = await multipleElementResultsStrategy(elements, 'a', compareEquals, { ...context, iteration: 1 })
                expect(first).toEqual(expect.objectContaining({ success: false, abort: false }))
                expect(elements).toHaveLength(1)

                const second = await multipleElementResultsStrategy(elements, 'a', compareEquals, { ...context, iteration: 2 })
                expect(second.success).toBe(true)
                expect(elements).toHaveLength(2)
                expect(globalMultiRemoteBrowser.$$).toHaveBeenCalledTimes(2)
            })
        })
    })
})
