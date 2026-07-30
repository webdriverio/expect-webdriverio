import { describe, test, vi, expect } from 'vitest'
import { waitUntil } from '../../src/util/waitUntil'

describe(waitUntil, () => {
    describe('given we should wait for the condition to be met (modifier `.not` is not used)', () => {
        const isNot = undefined
        describe('should be pass=true for normal success', () => {
            test('should return true when condition is met', async () => {
                const condition = vi.fn().mockResolvedValue({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
            })

            test('should return true with wait 0', async () => {
                const condition = vi.fn().mockResolvedValue({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
            })

            test('should return true when condition is met within wait time', async () => {
                const condition = vi.fn().mockResolvedValueOnce({ success: false, subject: 'test', actual: 'test' }).mockResolvedValueOnce({ success: false, subject: 'test', actual: 'test' }).mockResolvedValueOnce({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should return true when condition errors but still is met within wait time', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Test error')).mockRejectedValueOnce(new Error('Test error')).mockResolvedValueOnce({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should use default options when not provided', async () => {
                const condition = vi.fn().mockResolvedValue({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition)

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
            })
        })

        describe('should be pass=false for normal failure', () => {

            test('should return false when condition is not met within wait time', async () => {
                const condition = vi.fn().mockResolvedValue({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
            })

            test('should return false when condition is not met and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
            })

            test('should return false if condition throws but still return false', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Always failing')).mockRejectedValueOnce(new Error('Always failing')).mockResolvedValue({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
                expect(condition).toHaveBeenCalledTimes(4)
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
                const condition = vi.fn().mockResolvedValue({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
            })

            test('should return false with wait 0', async () => {
                const condition = vi.fn().mockResolvedValue({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
            })

            test('should return false when condition is met within wait time', async () => {
                const condition = vi.fn().mockResolvedValueOnce({ success: true, subject: 'test', actual: 'test' }).mockResolvedValueOnce({ success: true, subject: 'test', actual: 'test' }).mockResolvedValueOnce({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' }) // success for .not, boolean is inverted later by jest's expect library
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should return false when condition errors but still is met within wait time', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Test error')).mockRejectedValueOnce(new Error('Test error')).mockResolvedValueOnce({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
                expect(condition).toHaveBeenCalledTimes(3)
            })

            test('should use default options when not provided', async () => {
                const condition = vi.fn().mockResolvedValue({ success: false, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot)

                expect(result).toEqual({ success: false, subject: 'test', actual: 'test' })
            })
        })

        describe('should be pass=true for normal failure', () => {

            test('should return true when condition is not met within wait time', async () => {
                const condition = vi.fn().mockResolvedValue({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
            })

            test('should return true when condition is not met and wait is 0', async () => {
                const condition = vi.fn().mockResolvedValue({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 0 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
            })

            test('should return true if condition throws but still return true', async () => {
                const condition = vi.fn().mockRejectedValueOnce(new Error('Always failing')).mockRejectedValueOnce(new Error('Always failing')).mockResolvedValue({ success: true, subject: 'test', actual: 'test' })

                const result = await waitUntil(condition, isNot, { wait: 190, interval: 50 })

                expect(result).toEqual({ success: true, subject: 'test', actual: 'test' })
                expect(condition).toHaveBeenCalledTimes(4)
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

    describe('when condition returns abort: true', () => {
        test('should return immediately without retrying (isNot=false)', async () => {
            const condition = vi.fn().mockResolvedValue({
                success: false,
                abort: true,
                subject: 'test',
                actual: 'test',
            })

            const result = await waitUntil(condition, false, { wait: 5000, interval: 50 })

            expect(result).toEqual({ success: false, subject: 'test', actual: 'test', abort: true })
            expect(condition).toHaveBeenCalledTimes(1)
        })

        test('should return immediately without retrying (isNot=true), pass should be true since it is inverted later', async () => {
            const condition = vi.fn().mockResolvedValue({
                success: true,
                abort: true,
                subject: 'test',
                actual: 'test',
            })

            const result = await waitUntil(condition, true, { wait: 5000, interval: 50 })

            expect(result).toEqual({ success: true, subject: 'test', actual: 'test', abort: true })
            expect(condition).toHaveBeenCalledTimes(1)
        })
    })
})
