import { describe, it, expect, vi } from 'vitest'
import { executeCommandWithStrategy, multipleElementResultsStrategy } from '../../src/util/executeCommand'
import { chainableElementArrayFactory } from '../__mocks__/@wdio/globals'
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
    })
})
