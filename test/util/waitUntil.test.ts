import { describe, test, expect, vi } from 'vitest'
import type { ConditionResult } from '../../src/util/waitUntil'
import { waitUntil } from '../../src/util/waitUntil'

describe(waitUntil, () => {
    describe('given single result', () => {
        describe('given isNot is false', () => {
            const isNot = false

            test('should return true when condition is met immediately', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(true)
            })

            test('should return false when condition is not met and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(false)
            })

            test('should return true when condition is met within wait time', async () => {
                const condition = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should return false when condition is not met within wait time', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })

                expect(result).toBe(false)
            })

            test('should throw error if condition throws and never recovers', async () => {
                const condition = vi.fn().mockRejectedValue(new Error('Test error'))

                await expect(waitUntil(condition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
            })

            test('should recover from errors if condition eventually succeeds', async () => {
                const condition = vi.fn()
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockResolvedValueOnce(true)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should use default options when not provided', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition)

                expect(result).toBe(true)
            })
        })

        describe('given isNot is true', () => {
            const isNot = true

            test('should handle isNot flag correctly when condition is true', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is true and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is false', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(true)
            })

            test('should handle isNot flag correctly when condition is false and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(true)
            })

            test('should throw error if condition throws and never recovers', async () => {
                const condition = vi.fn().mockRejectedValue(new Error('Test error'))

                await expect(waitUntil(condition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
            })

            test('should do all the attempts to succeed even with isNot true', async () => {
                const condition = vi.fn()
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockResolvedValueOnce(true)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })

                expect(result).toBe(false)
                expect(condition).toHaveBeenCalledTimes(3)
            })
        })
    })

    describe('given multiple results', () => {
        let conditionResult: ConditionResult

        describe('given isNot is false', () => {
            const isNot = false

            test('should return false when condition returns empty array', async () => {
                conditionResult = { success: false, results: [] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(false)
            })

            test('should return true when condition is met immediately', async () => {
                conditionResult = { success: true, results: [true] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(true)
            })

            test('should return false when condition is not met and wait is 0', async () => {
                conditionResult = { success: false, results: [false] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(false)
            })

            test('should return true when condition is met within wait time', async () => {
                const condition = vi.fn().mockResolvedValueOnce({ success: false, results: [false] }).mockResolvedValueOnce({ success: false, results: [false] }).mockResolvedValueOnce({ success: true, results: [true] })

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should return false when condition is not met within wait time', async () => {
                conditionResult = { success: false, results: [false] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })

                expect(result).toBe(false)
            })

            test('should recover from errors if condition eventually succeeds', async () => {
                const condition = vi.fn()
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockResolvedValueOnce({ success: true, results: [true] })

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toHaveBeenCalledTimes(3)
            })
        })

        describe('given isNot is true', () => {
            const isNot = true

            test('should return false when condition returns empty array', async () => {
                conditionResult = { success: false, results: [] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is true', async () => {
                conditionResult = { success: true, results: [true] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is true and wait is 0', async () => {
                conditionResult = { success: true, results: [true] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is false', async () => {
                conditionResult = { success: false, results: [false] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(true)
            })

            test('should handle isNot flag correctly when condition is false and wait is 0', async () => {
                conditionResult = { success: false, results: [false] }
                const condition = vi.fn().mockResolvedValue(conditionResult)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(true)
            })

            test('should do all the attempts to succeed even with isNot true', async () => {
                const condition = vi.fn()
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockRejectedValueOnce(new Error('Not ready yet'))
                    .mockResolvedValueOnce({ success: true, results: [true] })

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })

                expect(result).toBe(false)
                expect(condition).toHaveBeenCalledTimes(3)
            })
        })
    })
})
