import { describe, it, expect, vi } from 'vitest'
import { multipleElementResultsStrategy } from '../../src/util/executeCommand'
import { chainableElementArrayFactory } from '../__mocks__/@wdio/globals'
import { $ } from '@wdio/globals'

vi.mock('@wdio/globals')

describe('executeCommand', () => {

    describe('multipleElementResultsStrategy', () => {

        const mockSingleCompare = vi.fn()

        describe('given a single element', () => {
            const element = $('selector')

            it('should return success true when the element matches the expected value', async () => {
                mockSingleCompare.mockResolvedValue({ result: true, value: 'Match' })

                const result = await multipleElementResultsStrategy(
                    element,
                    'Match',
                    mockSingleCompare,
                    false
                )

                expect(result.success).toBe(true)
                expect(result.actual).toEqual('Match')
            })

            it('should return success false when the element does not match the expected value', async () => {
                mockSingleCompare.mockResolvedValue({ result: false, value: 'No Match' })

                const result = await multipleElementResultsStrategy(
                    element,
                    'Match',
                    mockSingleCompare,
                    false
                )

                expect(result.success).toBe(false)
            })
        })

        describe('given multiple elements', () => {
            const threeElements = chainableElementArrayFactory('selector', 3)
            const twoElements = chainableElementArrayFactory('selector', 2)
            const oneElements = chainableElementArrayFactory('selector', 1)

            it('should return success true when all elements match expected values', async () => {
                mockSingleCompare.mockResolvedValue({ result: true, value: 'Match' })

                const result = await multipleElementResultsStrategy(
                    threeElements,
                    ['Match', 'Match', 'Match'],
                    mockSingleCompare,
                    false
                )

                expect(result.success).toBe(true)
                expect(result.actual).toEqual(['Match', 'Match', 'Match'])
            })

            it('should return success false when some elements do not match', async () => {
                mockSingleCompare
                    .mockResolvedValueOnce({ result: true, value: 'Match' })
                    .mockResolvedValueOnce({ result: false, value: 'No Match' })
                    .mockResolvedValueOnce({ result: true, value: 'Match' })

                const result = await multipleElementResultsStrategy(
                    threeElements,
                    ['Match', 'Match', 'Match'],
                    mockSingleCompare,
                    false
                )

                expect(result.success).toBe(false)
            })

            it('should pass (success=false) with .not when all elements fail to match', async () => {
                mockSingleCompare.mockResolvedValue({ result: false, value: 'Other' })

                const result = await multipleElementResultsStrategy(
                    twoElements,
                    'Match',
                    mockSingleCompare,
                    true // isNot: true
                )

                expect(result.success).toBe(false) // false is success for .not, since it is inverted later by Jest
            })

            it('should fail (success=true) when using .not but one element matches', async () => {
                mockSingleCompare
                    .mockResolvedValueOnce({ result: false, value: 'Other' })
                    .mockResolvedValueOnce({ result: true, value: 'Match' })

                const result = await multipleElementResultsStrategy(
                    twoElements,
                    'Match',
                    mockSingleCompare,
                    true // isNot: true
                )

                expect(result.success).toBe(true) // true is failure for .not, since it is inverted later by Jest
            })

            it('should fail when no elements are found (default behavior)', async () => {
                const result = await multipleElementResultsStrategy(
                    [],
                    'Match',
                    mockSingleCompare,
                    false
                )

                expect(result.success).toBe(false)
            })

            it('should pass (success=false) with .not when no elements are found and allowEmptyElements is true', async () => {
                const result = await multipleElementResultsStrategy(
                    [],
                    'Match',
                    mockSingleCompare,
                    true, // isNot
                    { allowEmptyElements: true }
                )

                expect(result.success).toBe(false) // false is success for .not, since it is inverted later by Jest
            })

            it('should handle missing elements compared to expected values array', async () => {
                const expected = ['A', 'B'] // Expecting 2

                mockSingleCompare.mockResolvedValue({ result: true, value: 'A' })

                const result = await multipleElementResultsStrategy(
                    oneElements,
                    expected,
                    mockSingleCompare,
                    false
                )

                expect(result.success).toBe(false)
                expect(result.actual).toEqual(['A', undefined])
            })
        })
    })
})
