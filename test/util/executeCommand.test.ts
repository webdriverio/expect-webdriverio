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

                // Only chrome exists: safari is compared without ever calling `compare` for it.
                expect(compare).toHaveBeenCalledTimes(1)
                expect(result.success).toBe(false)
                expect(result.actual).toEqual({ chrome: 'ignored', safari: undefined })
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

            it('fails gracefully with undefined actual when an instance is not found for an element', async () => {
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
                expect(result.actual).toEqual({ chrome: [' Valid Text '], firefox: [undefined] })
            })
        })
    })
})
