import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { ConditionResult } from '../../src/util/waitUntil'
import { waitUntil } from '../../src/util/waitUntil'

vi.mock('../../src/constants.js', async () => ({
    DEFAULT_OPTIONS: {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        ...(await vi.importActual<typeof import('../../src/constants.js')>('../../src/constants.js')).DEFAULT_OPTIONS,
        // speed up tests by lowering default wait timeout
        wait : 50,
        interval: 10
    }
}))

describe(waitUntil, () => {

    describe('when condition returns single boolean', () => {

        describe("when condition's result is true (pass=true), so usually success or failure with `.not`", () => {
            let successCondition: () => Promise<boolean>

            beforeEach(() => {
                successCondition = vi.fn().mockResolvedValue(true)
            })

            test('should return true with options', async () => {
                const result = await waitUntil(successCondition, undefined, { wait: 15, interval: 200 })

                expect(result).toBe(true)
                expect(successCondition).toBeCalledTimes(1)
            })

            test('should return true with wait 0', async () => {
                const result = await waitUntil(successCondition, undefined, { wait: 0 })

                expect(result).toBe(true)
                expect(successCondition).toBeCalledTimes(1)
            })

            test('should return true when condition is met with a delay', async () => {
                const condition = vi.fn()
                    .mockResolvedValueOnce(false)
                    .mockResolvedValueOnce(false)
                    .mockResolvedValue(true)

                const result = await waitUntil(condition, undefined, { wait: 250, interval: 100 })

                expect(result).toBe(true)
                expect(condition).toBeCalledTimes(3)
            })

            test('should return true when condition errors but still is met within wait time', async () => {
                const condition = vi.fn()
                    .mockRejectedValueOnce(new Error('Test error'))
                    .mockRejectedValueOnce(new Error('Test error'))
                    .mockResolvedValueOnce(true)

                const result = await waitUntil(condition, undefined, { wait: 250, interval: 100 })

                expect(result).toBe(true)
                expect(condition).toBeCalledTimes(3)
            })
        })

        describe("when condition's result is false (pass=false), so usually failure or success with `.not`", () => {

            let failureCondition: () => Promise<boolean>

            beforeEach(() => {
                failureCondition = vi.fn().mockResolvedValue(false)
            })

            test('should return false when condition is not met within wait time', async () => {
                const result = await waitUntil(failureCondition, undefined, { wait: 250, interval: 100 })

                expect(result).toBe(false)
                expect(failureCondition).toBeCalledTimes(3)
            })

            test('should return false when condition is not met and wait is 0', async () => {
                const result = await waitUntil(failureCondition, undefined, { wait: 0 })

                expect(result).toBe(false)
                expect(failureCondition).toBeCalledTimes(1)
            })

            test('should return false if condition throws but still return false', async () => {
                const condition = vi.fn()
                    .mockRejectedValueOnce(new Error('Always failing'))
                    .mockRejectedValueOnce(new Error('Always failing'))
                    .mockResolvedValue(false)

                const result = await waitUntil(condition, undefined, { wait: 250, interval: 100 })

                expect(result).toBe(false)
                expect(condition).toBeCalledTimes(3)
            })

            test('should return false with default options', async () => {
                const result = await waitUntil(failureCondition, undefined, {})

                expect(result).toBe(false)
                expect(failureCondition).toHaveBeenCalled()
            })
        })

        describe('when condition always throws', () => {
            const error = new Error('failing')

            test('should throw with wait', async () => {
                const condition = vi.fn().mockRejectedValue(error)

                await expect(() => waitUntil(condition, undefined, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
            })

            test('should throw with wait 0', async () => {
                const condition = vi.fn().mockRejectedValue(error)

                await expect(() => waitUntil(condition, undefined, { wait: 0 })).rejects.toThrowError('failing')

            })
        })
    })

    describe('when condition returns single ConditionResult', () => {

        describe('given isNot is false (or undefined)', () => {
            const isNot = false

            describe("when condition's result is true (pass=true), so success", () => {
                let successCondition: () => Promise<ConditionResult>
                const successResult: ConditionResult = { success: true, results: [true] }

                beforeEach(() => {
                    successCondition = vi.fn().mockResolvedValue(successResult)
                })

                test('should return true with options', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 15, interval: 200 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true with wait 0', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 0 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true when condition is met with a delay', async () => {
                    const condition = vi.fn()
                        .mockResolvedValueOnce({ success: false, results: [false] })
                        .mockResolvedValueOnce({ success: false, results: [false] })
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return true when condition errors but still is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })
            })

            describe("when condition's result is false (pass=false), so failure", () => {
                let failureCondition: () => Promise<ConditionResult>
                const failureResult: ConditionResult = { success: false, results: [false] }

                beforeEach(() => {
                    failureCondition = vi.fn().mockResolvedValue(failureResult)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(false)
                    expect(failureCondition).toBeCalledTimes(3)
                })

                test('should return false when condition is not met and wait is 0', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                    expect(result).toBe(false)
                    expect(failureCondition).toBeCalledTimes(1)
                })

                test('should return false if condition throws but still return false', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockResolvedValue(failureResult)

                    const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(false)
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return false with default options', async () => {
                    const result = await waitUntil(failureCondition, isNot, {})

                    expect(result).toBe(false)
                    expect(failureCondition).toHaveBeenCalled()
                })
            })

            describe('when condition always throws', () => {
                const error = new Error('failing')

                test('should throw with wait', async () => {
                    const condition = vi.fn().mockRejectedValue(error)

                    await expect(() => waitUntil(condition, isNot, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
                })

                test('should throw with wait 0', async () => {
                    const condition = vi.fn().mockRejectedValue(error)

                    await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                })
            })
        })

        describe('given isNot is true, so pass=true means failure and pass=false means success with `.not`', () => {
            const isNot = true

            describe("when condition's result is true (pass=true), so failure for `.not`", () => {
                let successCondition: () => Promise<ConditionResult>
                const successResult: ConditionResult = { success: true, results: [true] }

                beforeEach(() => {
                    successCondition = vi.fn().mockResolvedValue(successResult)
                })

                test('should return true with options', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 15, interval: 200 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true with wait 0', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 0 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true when condition is met with a delay', async () => {
                    const condition = vi.fn()
                        .mockResolvedValueOnce({ success: false, results: [false] })
                        .mockResolvedValueOnce({ success: false, results: [false] })
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return true when condition errors but still is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })
            })

            describe("when condition's result is false (pass=false), so success for `.not`", () => {
                let failureCondition: () => Promise<ConditionResult>
                const failureResult: ConditionResult = { success: false, results: [false] }

                beforeEach(() => {
                    failureCondition = vi.fn().mockResolvedValue(failureResult)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(false)
                    expect(failureCondition).toBeCalledTimes(3)
                })

                test('should return false when condition is not met and wait is 0', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                    expect(result).toBe(false)
                    expect(failureCondition).toBeCalledTimes(1)
                })

                test('should return false if condition throws but still return false', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockResolvedValue(failureResult)

                    const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                    expect(result).toBe(false)
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return false with default options', async () => {
                    const result = await waitUntil(failureCondition, isNot, {})

                    expect(result).toBe(false)
                    expect(failureCondition).toHaveBeenCalled()
                })
            })

            describe('when condition always throws', () => {
                const error = new Error('failing')

                test('should throw with wait', async () => {
                    const condition = vi.fn().mockRejectedValue(error)

                    await expect(() => waitUntil(condition, isNot, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
                })

                test('should throw with wait 0', async () => {
                    const condition = vi.fn().mockRejectedValue(error)

                    await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                })
            })
        })
    })

    describe('when condition returns multiple ConditionResult', () => {
        describe('when ConditionResult are all the same', () => {

            describe('given isNot is false (or undefined)', () => {
                const isNot = false

                describe("when condition's result is true (pass=true), so success", () => {
                    let successCondition: () => Promise<ConditionResult>
                    const successResult: ConditionResult = { success: true, results: [true, true] }

                    beforeEach(() => {
                        successCondition = vi.fn().mockResolvedValue(successResult)
                    })

                    test('should return true with options', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 15, interval: 200 })

                        expect(result).toBe(true)
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return true with wait 0', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 0 })

                        expect(result).toBe(true)
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return true when condition is met with a delay', async () => {
                        const condition = vi.fn()
                            .mockResolvedValueOnce({ success: false, results: [false, false] })
                            .mockResolvedValueOnce({ success: false, results: [false, false] })
                            .mockResolvedValueOnce({ success: true, results: [true, true] })

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return true when condition errors but still is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockResolvedValueOnce(true)

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })
                })

                describe("when condition's result is false (pass=false), so failure", () => {
                    let failureCondition: () => Promise<ConditionResult>
                    const failureResult: ConditionResult = { success: false, results: [false, false] }

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult)
                    })

                    test('should return false when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(3)
                    })

                    test('should return false when condition is not met and wait is 0', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(1)
                    })

                    test('should return false if condition throws but still return false', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Always failing'))
                            .mockRejectedValueOnce(new Error('Always failing'))
                            .mockResolvedValue(false)

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(false)
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return false with default options', async () => {
                        const result = await waitUntil(failureCondition, isNot, {})

                        expect(result).toBe(false)
                        expect(failureCondition).toHaveBeenCalled()
                    })
                })

                describe('when condition always throws', () => {
                    const error = new Error('failing')

                    test('should throw with wait', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
                    })

                    test('should throw with wait 0', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                    })
                })
            })

            describe('given isNot is true, so pass=true means failure and pass=false means success with `.not`', () => {
                const isNot = true

                describe("when condition's result is true (pass=true), so failure for `.not`", () => {
                    let successCondition: () => Promise<ConditionResult>
                    const successResult: ConditionResult = { success: true, results: [true, true] }

                    beforeEach(() => {
                        successCondition = vi.fn().mockResolvedValue(successResult)
                    })

                    test('should return true with options', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 15, interval: 200 })

                        expect(result).toBe(true)
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return true with wait 0', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 0 })

                        expect(result).toBe(true)
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return true when condition is met with a delay', async () => {
                        const condition = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return true when condition errors but still is met within wait time', async () => {
                        const condition = vi.fn().mockRejectedValueOnce(new Error('Test error')).mockRejectedValueOnce(new Error('Test error')).mockResolvedValueOnce(true)

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })
                })

                describe("when condition's result is false (pass=false), so success for `.not`", () => {
                    let failureCondition: () => Promise<ConditionResult>
                    const failureResult: ConditionResult = { success: false, results: [false, false] }

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult)
                    })

                    test('should return false when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(3)
                    })

                    test('should return false when condition is not met and wait is 0', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(1)
                    })

                    test('should return false if condition throws but still return false', async () => {
                        const condition = vi.fn().mockRejectedValueOnce(new Error('Always failing')).mockRejectedValueOnce(new Error('Always failing')).mockResolvedValue(false)

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(false)
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return false with default options', async () => {
                        const result = await waitUntil(failureCondition, isNot, {})

                        expect(result).toBe(false)
                        expect(failureCondition).toHaveBeenCalled()
                    })
                })

                describe('when condition always throws', () => {
                    const error = new Error('failing')

                    test('should throw with wait', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
                    })

                    test('should throw with wait 0', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                    })
                })
            })
        })

        describe('when ConditionResult are not all the same, so always failure with or without `.not`', () => {
            const failureResult: ConditionResult = { success: false, results: [true, false] }

            describe('given isNot is false (or undefined), should be failure (pass=false)', () => {
                const isNot = false

                describe("when one of the condition's result is false (pass=false), so failure", () => {
                    let failureCondition: () => Promise<ConditionResult>

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult)
                    })

                    test('should return false when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(3)
                    })

                    test('should return false when condition is not met and wait is 0', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(1)
                    })

                    test('should return false if condition throws but still return false', async () => {
                        const condition = vi.fn().mockRejectedValueOnce(new Error('Always failing')).mockRejectedValueOnce(new Error('Always failing')).mockResolvedValue(false)

                        const result = await waitUntil(condition, isNot, { wait: 18, interval: 5 })

                        expect(result).toBe(false)
                        expect(condition).toBeCalledTimes(4)
                    })

                    test('should return false with default options', async () => {
                        const result = await waitUntil(failureCondition, isNot, {})

                        expect(result).toBe(false)
                        expect(failureCondition).toHaveBeenCalled()
                    })
                })

                describe('when condition always throws', () => {
                    const error = new Error('failing')

                    test('should throw with wait', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
                    })

                    test('should throw with wait 0', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                    })
                })
            })

            describe('given isNot is true, should also be failure (pass=true)', () => {
                const isNot = true

                describe("when one of the condition's result is true (pass=true), so failure for `.not`", () => {
                    let failureCondition: () => Promise<ConditionResult>

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult)
                    })

                    test('should return true when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(true) // failure for .not
                        expect(failureCondition).toBeCalledTimes(3)
                    })

                    test('should return true when condition is not met and wait is 0', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                        expect(result).toBe(true) // failure for .not
                        expect(failureCondition).toBeCalledTimes(1)
                    })

                    test('should return true if condition throws but still return failure', async () => {
                        const condition = vi.fn().mockRejectedValueOnce(new Error('failing')).mockRejectedValueOnce(new Error('failing')).mockResolvedValue(failureResult)

                        const result = await waitUntil(condition, isNot, { wait: 250, interval: 100 })

                        expect(result).toBe(true) // failure for .not
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return true with default options', async () => {
                        const result = await waitUntil(failureCondition, isNot, {})

                        expect(result).toBe(true) // failure for .not
                        expect(failureCondition).toHaveBeenCalled()
                    })
                })

                describe('when condition always throws', () => {
                    const error = new Error('failing')

                    test('should throw with wait', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 250, interval: 100 })).rejects.toThrowError('failing')
                    })

                    test('should throw with wait 0', async () => {
                        const condition = vi.fn().mockRejectedValue(error)

                        await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                    })
                })
            })
        })
    })
})
