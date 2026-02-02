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

        describe('given we should wait for the condition to be met (modifier `.not` is not used)', () => {
            const isNot = undefined

            describe('should be pass=true for normal success', () => {
                let successCondition: () => Promise<boolean>

                beforeEach(() => {
                    successCondition = vi.fn().mockResolvedValue(true)
                })

                test('should return true when condition is met', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true with wait 0', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 0 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true when condition is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockResolvedValueOnce(false)
                        .mockResolvedValueOnce(false)
                        .mockResolvedValueOnce(true)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return true when condition errors but still is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockResolvedValueOnce(true)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })
            })

            describe('should be pass=false for normal failure', () => {

                let failureCondition: () => Promise<boolean>

                beforeEach(() => {
                    failureCondition = vi.fn().mockResolvedValue(false)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                    expect(result).toBe(false)
                    expect(failureCondition).toBeCalledTimes(4)
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

                    const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                    expect(result).toBe(false)
                    expect(condition).toBeCalledTimes(4)
                })

                test('should return false with default options', async () => {
                    const result = await waitUntil(failureCondition, undefined, {})

                    expect(result).toBe(false)
                    expect(failureCondition).toHaveBeenCalled()
                })
            })

            describe('when condition throws', () => {
                const error = new Error('failing')

                test('should throw with wait', async () => {
                    const condition = vi.fn().mockRejectedValue(error)

                    await expect(() => waitUntil(condition, isNot, { wait: 180, interval: 50 })).rejects.toThrowError('failing')
                    expect(condition).toBeCalledTimes(4)
                })

                test('should throw with wait 0', async () => {
                    const condition = vi.fn().mockRejectedValue(error)

                    await expect(() => waitUntil(condition, isNot, { wait: 0 })).rejects.toThrowError('failing')
                    expect(condition).toBeCalledTimes(1)
                })
            })
        })

        describe('given we should wait for the reverse condition to be met since element state can take time to update (modifier `.not` is true to for reverse condition)', () => {
            const isNot = true
            describe('should be pass=false for normal success (inverted later by jest expect library)', () => {
                let successCondition: () => Promise<boolean>

                beforeEach(() => {
                    successCondition = vi.fn().mockResolvedValue(false)
                })

                test('should return success (false) when condition is met', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return success (false) with wait 0', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 0 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return success (false) when condition is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockResolvedValueOnce(true)
                        .mockResolvedValueOnce(true)
                        .mockResolvedValueOnce(false)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return success (false) when condition errors but still is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockResolvedValueOnce(false)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(condition).toBeCalledTimes(3)
                })
            })

            describe('should be pass=true for normal failure', () => {
                let failureCondition: () => Promise<boolean>

                beforeEach(() => {
                    failureCondition = vi.fn().mockResolvedValue(true)
                })

                test('should return failure (true) when condition is not met within wait time', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                    expect(result).toBe(true)
                    expect(failureCondition).toBeCalledTimes(4)
                })

                test('should return true when condition is not met and wait is 0', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                    expect(result).toBe(true)
                })

                test('should return true if condition throws but still return true', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockResolvedValue(true)

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

    describe('when condition returns single ConditionResult', () => {

        describe('given we should wait for the condition to be met (modifier `.not` is not used)', () => {
            const isNot = undefined

            describe('should be pass=true for normal success', () => {
                let successCondition: () => Promise<ConditionResult>
                const successResult: ConditionResult = { success: true, results: [true] }
                const failureResult: ConditionResult = { success: false, results: [false] }

                beforeEach(() => {
                    successCondition = vi.fn().mockResolvedValue(successResult)
                })

                test('should return true when condition is met', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true with wait 0', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 0 })

                    expect(result).toBe(true)
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return true when condition is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockResolvedValueOnce(failureResult)
                        .mockResolvedValueOnce(failureResult)
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return true when condition errors but still is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(3)
                })
            })

            describe('should be pass=false for normal failure', () => {
                let failureCondition: () => Promise<ConditionResult>
                const failureResult: ConditionResult = { success: false, results: [false] }

                beforeEach(() => {
                    failureCondition = vi.fn().mockResolvedValue(failureResult)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                    expect(result).toBe(false)
                    expect(failureCondition).toBeCalledTimes(4)
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

                    const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                    expect(result).toBe(false)
                    expect(condition).toBeCalledTimes(4)
                })

                test('should return false with default options', async () => {
                    const result = await waitUntil(failureCondition, undefined, {})

                    expect(result).toBe(false)
                    expect(failureCondition).toHaveBeenCalled()
                })
            })
        })

        describe('given we should wait for the reverse condition to be met since element state can take time to update (modifier `.not` is true to for reverse condition)', () => {
            const isNot = true
            describe('should be pass=false for normal success (inverted later by jest expect library)', () => {
                let successCondition: () => Promise<ConditionResult>
                const successResult: ConditionResult = { success: false, results: [false] }
                const failureResult: ConditionResult = { success: true, results: [true] }

                beforeEach(() => {
                    successCondition = vi.fn().mockResolvedValue(successResult)
                })

                test('should return success (false) when condition is met', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return success (false) with wait 0', async () => {
                    const result = await waitUntil(successCondition, isNot, { wait: 0 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(successCondition).toBeCalledTimes(1)
                })

                test('should return success (false) when condition is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockResolvedValueOnce(failureResult)
                        .mockResolvedValueOnce(failureResult)
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(condition).toBeCalledTimes(3)
                })

                test('should return success (false) when condition errors but still is met within wait time', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockRejectedValueOnce(new Error('Test error'))
                        .mockResolvedValueOnce(successResult)

                    const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                    expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                    expect(condition).toBeCalledTimes(3)
                })
            })

            describe('should be pass=true for normal failure', () => {
                let failureCondition: () => Promise<ConditionResult>
                const failureResult: ConditionResult = { success: true, results: [true] }

                beforeEach(() => {
                    failureCondition = vi.fn().mockResolvedValue(failureResult)
                })

                test('should return failure (true) when condition is not met within wait time', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                    expect(result).toBe(true)
                    expect(failureCondition).toBeCalledTimes(4)
                })

                test('should return true when condition is not met and wait is 0', async () => {
                    const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                    expect(result).toBe(true)
                    expect(failureCondition).toBeCalledTimes(1)
                })

                test('should return true if condition throws but still return true', async () => {
                    const condition = vi.fn()
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockRejectedValueOnce(new Error('Always failing'))
                        .mockResolvedValue(failureResult)

                    const result = await waitUntil(condition, isNot, { wait: 190, interval: 50 })

                    expect(result).toBe(true)
                    expect(condition).toBeCalledTimes(4)
                })
            })
        })
    })

    describe('when condition returns multiple ConditionResult', () => {
        describe('when ConditionResult are all the same', () => {
            describe('given we should wait for the condition to be met (modifier `.not` is not used)', () => {
                const successResult: ConditionResult = { success: true, results: [true, true] }
                const failureResult: ConditionResult = { success: false, results: [false, false] }

                const isNot = undefined

                describe('should be pass=true for normal success', () => {
                    let successCondition: () => Promise<ConditionResult>

                    beforeEach(() => {
                        successCondition = vi.fn().mockResolvedValue(successResult)
                    })

                    test('should return true when condition is met', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 1000, interval: 100 })

                        expect(result).toBe(true)
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return true with wait 0', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 0 })

                        expect(result).toBe(true)
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return true when condition is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockResolvedValueOnce(failureResult)
                            .mockResolvedValueOnce(failureResult)
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return true when condition errors but still is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })
                })

                describe('should be pass=false for normal failure', () => {
                    let failureCondition: () => Promise<ConditionResult>

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult)
                    })

                    test('should return false when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(4)
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

                        const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(false)
                        expect(condition).toBeCalledTimes(4)
                    })

                    test('should return false with default options', async () => {
                        const result = await waitUntil(failureCondition, undefined, {})

                        expect(result).toBe(false)
                        expect(failureCondition).toHaveBeenCalled()
                    })
                })
            })

            describe('given we should wait for the reverse condition to be met since element state can take time to update (modifier `.not` is true to for reverse condition)', () => {
                const isNot = true
                describe('should be pass=false for normal success (inverted later by jest expect library)', () => {
                    let successCondition: () => Promise<ConditionResult>
                    const successResult: ConditionResult = { success: false, results: [false, false] }
                    const failureResult: ConditionResult = { success: true, results: [true, true] }

                    beforeEach(() => {
                        successCondition = vi.fn().mockResolvedValue(successResult)
                    })

                    test('should return success (false) when condition is met', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 1000, interval: 100 })

                        expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return success (false) with wait 0', async () => {
                        const result = await waitUntil(successCondition, isNot, { wait: 0 })

                        expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                        expect(successCondition).toBeCalledTimes(1)
                    })

                    test('should return success (false) when condition is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockResolvedValueOnce(failureResult)
                            .mockResolvedValueOnce(failureResult)
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return success (false) when condition errors but still is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                        expect(condition).toBeCalledTimes(3)
                    })
                })

                describe('should be pass=true for normal failure', () => {
                    let failureCondition: () => Promise<ConditionResult>
                    const failureResult: ConditionResult = { success: true, results: [true] }

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult)
                    })

                    test('should return failure (true) when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(true)
                        expect(failureCondition).toBeCalledTimes(4)
                    })

                    test('should return true when condition is not met and wait is 0', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                        expect(result).toBe(true)
                    })

                    test('should return true if condition throws but still return true', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Always failing'))
                            .mockRejectedValueOnce(new Error('Always failing'))
                            .mockResolvedValue(failureResult)

                        const result = await waitUntil(condition, isNot, { wait: 190, interval: 50 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(4)
                    })
                })
            })
        })

        describe('when ConditionResult are not always the same', () => {

            describe('given we should wait for the condition to be met (modifier `.not` is not used)', () => {
                const isNot = undefined

                const failureResult1: ConditionResult = { success: false, results: [true, false] }
                const failureResult2: ConditionResult = { success: false, results: [false, true] }

                describe('should be pass=true for normal success', () => {
                    const successResult: ConditionResult = { success: true, results: [true, true] }

                    test('should return true when condition is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockResolvedValueOnce(failureResult1)
                            .mockResolvedValueOnce(failureResult2)
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return true when condition errors but still is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockRejectedValueOnce(failureResult1)
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(3)
                    })
                })

                describe('should be pass=false for normal failure', () => {
                    let failureCondition: () => Promise<ConditionResult>

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult1)
                    })

                    test('should return false when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(false)
                        expect(failureCondition).toBeCalledTimes(4)
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
                            .mockResolvedValue(failureResult2)

                        const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(false)
                        expect(condition).toBeCalledTimes(4)
                    })

                    test('should return false with default options', async () => {
                        const result = await waitUntil(failureCondition, undefined, {})

                        expect(result).toBe(false)
                        expect(failureCondition).toHaveBeenCalled()
                    })
                })
            })

            describe('given we should wait for the reverse condition to be met since element state can take time to update (modifier `.not` is true to for reverse condition)', () => {
                const isNot = true

                const failureResult1: ConditionResult = { success: false, results: [true, false] }
                const failureResult2: ConditionResult = { success: false, results: [false, true] }

                describe('should be pass=false for normal success (inverted later by jest expect library)', () => {
                    let condition: () => Promise<ConditionResult>
                    const successResult: ConditionResult = { success: false, results: [false, false] }

                    beforeEach(() => {
                        condition = vi.fn()
                            .mockResolvedValueOnce(failureResult1)
                            .mockResolvedValueOnce(failureResult2)
                            .mockResolvedValueOnce(successResult)
                    })

                    test('should return success (false) when condition is met within wait time', async () => {

                        const result = await waitUntil(condition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                        expect(condition).toBeCalledTimes(3)
                    })

                    test('should return success (false) when condition errors but still is met within wait time', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Test error'))
                            .mockRejectedValueOnce(failureResult1)
                            .mockResolvedValueOnce(successResult)

                        const result = await waitUntil(condition, isNot, { wait: 990, interval: 50 })

                        expect(result).toBe(false) // success for .not, boolean is inverted later by jest's expect library
                        expect(condition).toBeCalledTimes(3)
                    })
                })

                describe('should be pass=true for normal failure', () => {
                    let failureCondition: () => Promise<ConditionResult>

                    beforeEach(() => {
                        failureCondition = vi.fn().mockResolvedValue(failureResult1)
                    })

                    test('should return failure (true) when condition is not met within wait time', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 180, interval: 50 })

                        expect(result).toBe(true)
                        expect(failureCondition).toBeCalledTimes(4)
                    })

                    test('should return fail (true) with wait 0', async () => {
                        const result = await waitUntil(failureCondition, isNot, { wait: 0 })

                        expect(result).toBe(true) // failure for .not, boolean is inverted later by jest's expect library
                        expect(failureCondition).toBeCalledTimes(1)
                    })

                    test('should return true if condition throws but still return failure', async () => {
                        const condition = vi.fn()
                            .mockRejectedValueOnce(new Error('Always failing'))
                            .mockRejectedValueOnce(new Error('Always failing'))
                            .mockResolvedValue(failureResult2)

                        const result = await waitUntil(condition, isNot, { wait: 190, interval: 50 })

                        expect(result).toBe(true)
                        expect(condition).toBeCalledTimes(4)
                    })
                })
            })
        })
    })

    describe('when not results aka no elements found cases we DO NOT RETRY', () => {
        const emptyResult: ConditionResult = { success: false, results: [] }

        let emptyCondition: () => Promise<boolean>

        beforeEach(() => {
            emptyCondition = vi.fn().mockResolvedValue(emptyResult)
        })

        test('should NOT RETRY and fails with pass=false when isNot is undefined', async () => {
            const isNot = undefined

            const result = await waitUntil(emptyCondition, isNot, { wait: 280, interval: 100 })

            expect(result).toBe(false)
            expect(emptyCondition).toBeCalledTimes(1)
        })

        test('should NOT RETRY and fails with pass=true when isNot is true', async () => {
            const isNot = true

            const result = await waitUntil(emptyCondition, isNot, { wait: 280, interval: 100 })

            expect(result).toBe(true) // failure for .not, boolean is inverted later by jest's expect library
            expect(emptyCondition).toBeCalledTimes(1)
        })
    })
})
