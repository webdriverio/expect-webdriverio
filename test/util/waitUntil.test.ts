import { describe, test, vi, expect } from 'vitest'
import { waitUntil } from '../../src/util/waitUntil'

describe(waitUntil, () => {
    describe('given we should wait for the condition to be met (modifier `.not` is not used)', () => {
        const isNot = undefined
        describe('should be pass=true for normal success', () => {
            test('should return true when condition is met', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(true)
            })

            test('should return true with wait 0', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(true)
            })

            test('should return true when condition is met within wait time', async () => {
                const condition = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toBeCalledTimes(3)
            })

            test('should return true when condition errors but still is met within wait time', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Test error')).mockRejectedValueOnce(new Error('Test error')).mockResolvedValueOnce(true)

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toBeCalledTimes(3)
            })

            test('should use default options when not provided', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition)

                expect(result).toBe(true)
            })
        })

        describe('should be pass=false for normal failure', () => {

            test('should return false when condition is not met within wait time', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })

                expect(result).toBe(false)
            })

            test('should return false when condition is not met and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(false)
            })

            test('should return false if condition throws but still return false', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Always failing')).mockRejectedValueOnce(new Error('Always failing')).mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                expect(result).toBe(false)
                expect(condition).toBeCalledTimes(4)
            })
        })

        describe('when condition throws', () => {
            const error = new Error('failing')

            test('should throw with wait', async () => {
                const condition = vi.fn().mockRejectedValue(error)

                await expect(() => waitUntil(condition, isNot, { wait: 200, interval: 50 })).rejects.toThrowError('failing')
            })

            test('should throw with wait 0', async () => {
                const condition = vi.fn().mockRejectedValue(error)

                await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')

            })
        })
    })

    describe('given we should wait for the reverse condition to meet since element state can take time to update (modifier `.not` is true to for reverse condition)', () => {
        const isNot = true
        describe('should be pass=false for normal success', () => {
            test('should return false when condition is met', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toBe(false)
            })

            test('should return false with wait 0', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(false)
            })

            test('should return false when condition is met within wait time', async () => {
                const condition = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false)

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                expect(condition).toBeCalledTimes(3)
            })

            test('should return false when condition errors but still is met within wait time', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Test error')).mockRejectedValueOnce(new Error('Test error')).mockResolvedValueOnce(false)

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toBe(false)
                expect(condition).toBeCalledTimes(3)
            })

            test('should use default options when not provided', async () => {
                const condition = vi.fn().mockResolvedValue(false)

                const result = await waitUntil(condition, isNot)

                expect(result).toBe(false)
            })
        })

        describe('should be pass=true for normal failure', () => {

            test('should return true when condition is not met within wait time', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })

                expect(result).toBe(true)
            })

            test('should return true when condition is not met and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toBe(true)
            })

            test('should return true if condition throws but still return true', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Always failing')).mockRejectedValueOnce(new Error('Always failing')).mockResolvedValue(true)

                const result = await waitUntil(condition, isNot, { wait: 190, interval: 50 })

                expect(result).toBe(true)
                expect(condition).toBeCalledTimes(4)
            })
        })

        describe('when condition throws', () => {
            const error = new Error('failing')

            test('should throw with wait', async () => {
                const condition = vi.fn().mockRejectedValue(error)

                await expect(() => waitUntil(condition, isNot, { wait: 200, interval: 50 })).rejects.toThrowError('failing')
            })

            test('should throw with wait 0', async () => {
                const condition = vi.fn().mockRejectedValue(error)

                await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')

            })
        })
    })
})
