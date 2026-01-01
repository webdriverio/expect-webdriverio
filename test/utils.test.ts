import { describe, test, expect } from 'vitest'
import type { CompareResult } from '../src/utils'
import { compareNumbers, compareObject, compareText, compareTextWithArray, waitUntil, waitUntilResult } from '../src/utils'

describe('utils', () => {
    describe('compareText', () => {
        test('should pass when strings match', () => {
            expect(compareText('foo', 'foo', {}).result).toBe(true)
        })

        test('should fail when strings do not match', () => {
            expect(compareText('foo', 'bar', {}).result).toBe(false)
        })

        test('should pass when trims away white space', () => {
            expect(compareText(' foo ', 'foo', {}).result).toBe(true)
        })

        test('should fail without trimming away white space', () => {
            expect(compareText(' foo ', 'foo ', { trim: false }).result).toBe(false)
        })

        test('should pass if same word but wrong case and using ignoreCase', () => {
            expect(compareText(' FOO ', 'foo', { ignoreCase: true }).result).toBe(true)
            expect(compareText(' foo ', 'FOO', { ignoreCase: true }).result).toBe(true)
        })

        test('should pass if string contains expected and using containing', () => {
            expect(compareText('qwe_AsD_zxc', 'asd', { ignoreCase: true, containing: true }).result).toBe(true)
        })

        test('should support asymmetric matchers', () => {
            expect(compareText('foo', expect.stringContaining('oo'), {}).result).toBe(true)
            expect(compareText('foo', expect.not.stringContaining('oo'), {}).result).toBe(false)
        })

        test('should support asymmetric matchers and using ignoreCase', () => {
            expect(compareText(' FOO ', expect.stringContaining('foo'), { ignoreCase: true }).result).toBe(true)
            expect(compareText(' FOO ', expect.not.stringContaining('foo'), { ignoreCase: true }).result).toBe(false)
            expect(compareText(' Foo ', expect.stringContaining('FOO'), { ignoreCase: true }).result).toBe(true)
            expect(compareText(' Foo ', expect.not.stringContaining('FOO'), { ignoreCase: true }).result).toBe(false)
            expect(compareText(' foo ', expect.stringContaining('foo'), { ignoreCase: true }).result).toBe(true)
        })
    })

    describe('compareTextWithArray', () => {
        test('should pass if strings match in array', () => {
            expect(compareTextWithArray('foo', ['foo', 'bar'], {}).result).toBe(true)
        })

        test('should fail if string does not match in array', () => {
            expect(compareTextWithArray('foo', ['foot', 'bar'], {}).result).toBe(false)
        })

        test('should pass if white space and using trim', () => {
            expect(compareTextWithArray(' foo ', ['foo', 'bar'], { trim: true }).result).toBe(true)
        })

        test('should pass if wrong case and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', ['foO', 'bar'], { trim: true, ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', ['foO', 'BAR'], { trim: true, ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', ['foOo', 'BAR'], { trim: true, ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray(' FOO ', ['foOO', 'bar'], { trim: true, ignoreCase: true }).result).toBe(false)
        })

        test('should pass if string contains and using containing', () => {
            expect(compareTextWithArray('qwe_AsD_zxc', ['foo', 'ZXC'], { ignoreCase: true, containing: true }).result).toBe(true)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxc'], { ignoreCase: true, containing: true }).result).toBe(true)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxcc'], { ignoreCase: true, containing: true }).result).toBe(false)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxcc'], { ignoreCase: true, containing: false }).result).toBe(false)
        })

        test('should support asymmetric matchers', () => {
            expect(compareTextWithArray('foo', [expect.stringContaining('oo'), expect.stringContaining('oobb')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.stringContaining('oobb'), expect.stringContaining('oo')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oo'), expect.stringContaining('oobb')], {}).result).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('oobb'), expect.not.stringContaining('oo')], {}).result).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('oo'), expect.not.stringContaining('oobb')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oobb'), expect.not.stringContaining('oo')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oof'), expect.not.stringContaining('oobb')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oo'), expect.not.stringContaining('foo')], {}).result).toBe(false)
        })

        test('should support asymmetric matchers and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', [expect.stringContaining('foo'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' FOO ', [expect.not.stringContaining('foo'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray(' foo ', [expect.stringContaining('FOO'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray(' foo ', [expect.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('FOOO'), 'FOO'], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('OO'), expect.not.stringContaining('FOOO')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOOO'), expect.not.stringContaining('OO')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOOO'), expect.not.stringContaining('OOO')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), expect.not.stringContaining('OO')], { ignoreCase: true }).result).toBe(false)
        })
    })

    describe('compareNumbers', () => {
        test('should work when equal', () => {
            const actual = 10
            const eq = 10
            expect(compareNumbers(actual, { eq })).toBe(true)
        })

        test('should pass when using gte and number is greater', () => {
            const actual = 10
            const gte = 5
            expect(compareNumbers(actual, { gte })).toBe(true)
        })

        test('should pass when using lte and number is lower', () => {
            const actual = 10
            const lte = 20
            expect(compareNumbers(actual, { lte })).toBe(true)
        })

        test('should pass when using lte and gte and number is in between', () => {
            const actual = 10
            const lte = 20
            const gte = 1
            expect(compareNumbers(actual, { lte, gte })).toBe(true)
        })

        test('should fail when using lte and gte and is lte but not gte', () => {
            const actual = 10
            const lte = 20
            const gte = 15
            expect(compareNumbers(actual, { lte, gte })).toBe(false)
        })

        test('should fail when using lte and gte and is gte but not lte', () => {
            const actual = 10
            const lte = 9
            const gte = 1
            expect(compareNumbers(actual, { lte, gte })).toBe(false)
        })
    })

    describe('compareObject', () => {
        test('should pass if the objects are equal', () => {
            expect(compareObject({ 'foo': 'bar' }, { 'foo': 'bar' }).result).toBe(true)
        })

        test('should pass if the objects are deep equal', () => {
            expect(compareObject({ 'foo': { 'bar': 'baz' } }, { 'foo': { 'bar': 'baz' } }).result).toBe(true)
        })

        test('should fail if the objects are not equal', () => {
            expect(compareObject({ 'foo': 'bar' }, { 'baz': 'quux' }).result).toBe(false)
        })

        test('should fail if the objects are only shallow equal', () => {
            expect(compareObject({ 'foo': { 'bar': 'baz' } }, { 'foo': { 'baz': 'quux' } }).result).toBe(false)
        })

        test('should fail if the actual value is a number or array', () => {
            expect(compareObject(10, { 'foo': 'bar' }).result).toBe(false)
            expect(compareObject([{ 'foo': 'bar' }], { 'foo': 'bar' }).result).toBe(false)
        })
    })
    describe('waitUntil', () => {
        describe('given isNot is false', () => {
            const isNot = false

            test('should return true when condition is met immediately', async () => {
                const condition = async () => true
                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })
                expect(result).toBe(true)
            })

            test('should return false when condition is not met and wait is 0', async () => {
                const condition = async () => false
                const result = await waitUntil(condition, isNot, { wait: 0 })
                expect(result).toBe(false)
            })

            test('should return true when condition is met within wait time', async () => {
                let attempts = 0
                const condition = async () => {
                    attempts++
                    return attempts >= 3
                }
                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })
                expect(result).toBe(true)
                expect(attempts).toBeGreaterThanOrEqual(3)
            })

            test('should return false when condition is not met within wait time', async () => {
                const condition = async () => false
                const result = await waitUntil(condition, isNot, { wait: 200, interval: 50 })
                expect(result).toBe(false)
            })

            test('should throw error if condition throws and never recovers', async () => {
                const condition = async () => {
                    throw new Error('Test error')
                }
                await expect(waitUntil(condition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
            })

            test('should recover from errors if condition eventually succeeds', async () => {
                let attempts = 0
                const condition = async () => {
                    attempts++
                    if (attempts < 3) {
                        throw new Error('Not ready yet')
                    }
                    return true
                }
                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })
                expect(result).toBe(true)
                expect(attempts).toBe(3)
            })

            test('should use default options when not provided', async () => {
                const condition = async () => true
                const result = await waitUntil(condition)
                expect(result).toBe(true)
            })
        })

        describe('given isNot is true', () => {
            const isNot = true

            test('should handle isNot flag correctly when condition is true', async () => {
                const condition = async () => true
                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })
                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is true and wait is 0', async () => {
                const condition = async () => true
                const result = await waitUntil(condition, isNot, { wait: 0 })
                expect(result).toBe(false)
            })

            test('should handle isNot flag correctly when condition is false', async () => {
                const condition = async () => false
                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 100 })
                expect(result).toBe(true)
            })

            test('should handle isNot flag correctly when condition is false and wait is 0', async () => {
                const condition = async () => false
                const result = await waitUntil(condition, isNot, { wait: 0 })
                expect(result).toBe(true)
            })

            test('should throw error if condition throws and never recovers', async () => {
                const condition = async () => {
                    throw new Error('Test error')
                }
                await expect(waitUntil(condition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
            })

            test('should do all the attempts to succeed even with isNot true', async () => {
                let attempts = 0
                const condition = async () => {
                    attempts++
                    if (attempts < 3) {
                        throw new Error('Not ready yet')
                    }
                    return true
                }
                const result = await waitUntil(condition, isNot, { wait: 1000, interval: 50 })
                expect(result).toBe(false)
                expect(attempts).toBe(3)
            })

        })
    })

    describe('waitUntilResult', () => {
        const trueCompareResult = { value: 'myValue', actual: 'myValue', expected: 'myValue', result: true } satisfies CompareResult<string, string>
        const falseCompareResult = { value: 'myWrongValue', actual: 'myWrongValue', expected: 'myValue', result: false } satisfies CompareResult<string, string>

        const trueCondition = async () => {
            return { ...trueCompareResult }
        }
        const falseCondition = async () => {
            return { ...falseCompareResult }
        }

        const errorCondition = async () => {
            throw new Error('Test error')
        }

        describe('given Browser is not multi-remote and return a single value', () => {
            describe('given isNot is false', () => {
                const isNot = false

                test('should return true when condition is met immediately', async () => {
                    const result = await waitUntilResult(trueCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }],
                    })
                })

                test('should return false when condition is not met and wait is 0', async () => {
                    const result = await waitUntilResult(falseCondition, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...falseCompareResult, pass: false }],
                    })
                })

                test('should return true when condition is met within wait time', async () => {
                    let attempts = 0
                    const condition = async () => {
                        attempts++
                        return attempts >= 3 ? trueCompareResult : falseCompareResult
                    }

                    const result = await waitUntilResult(condition, isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }],
                    })
                    expect(attempts).toBeGreaterThanOrEqual(3)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntilResult(falseCondition, isNot, { wait: 200, interval: 50 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...falseCompareResult, pass: false }],
                    })
                })

                test('should throw error if condition throws and never recovers', async () => {
                    await expect(waitUntilResult(errorCondition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
                })

                test('should recover from errors if condition eventually succeeds', async () => {
                    let attempts = 0
                    const condition = async () => {
                        attempts++
                        if (attempts < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueCompareResult
                    }

                    const result = await waitUntilResult(condition, isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }],
                    })
                    expect(attempts).toBe(3)
                })

                test('should use default options when not provided', async () => {
                    const result = await waitUntilResult(trueCondition)

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }],
                    })
                })
            })

            describe('given isNot is true', () => {
                const isNot = true

                test('should handle isNot flag correctly when condition is true', async () => {
                    const result = await waitUntilResult(trueCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }],
                    })
                })

                test('should handle isNot flag correctly when condition is true and wait is 0', async () => {
                    const result = await waitUntilResult(trueCondition, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }],
                    })
                })

                test('should handle isNot flag correctly when condition is false', async () => {
                    const result = await waitUntilResult(falseCondition, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...falseCompareResult, pass : true }],
                    })
                })

                test('should handle isNot flag correctly when condition is false and wait is 0', async () => {
                    const result = await waitUntilResult(falseCondition, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...falseCompareResult, pass : true }],
                    })
                })

                test('should throw error if condition throws and never recovers', async () => {
                    await expect(waitUntilResult(errorCondition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
                })

                test('should do all the attempts to succeed even with isNot true', async () => {
                    let attempts = 0
                    const condition = async () => {
                        attempts++
                        if (attempts < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueCompareResult
                    }
                    const result = await waitUntilResult(condition, isNot, { wait: 1000, interval: 50 })
                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }],
                    })
                    expect(attempts).toBe(3)
                })

            })
        })

        describe('given Browser is multi-remote and return an array of value', () => {
            const trueConditions = async () => {
                return [{ ...trueCompareResult }, { ...trueCompareResult }]
            }
            const falseConditions = async () => {
                return [{ ...falseCompareResult }, { ...falseCompareResult }]
            }
            describe('given isNot is false', () => {
                const isNot = false

                test('should return true when condition is met immediately', async () => {
                    const result = await waitUntilResult(trueConditions, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                })

                test('should return false when condition is not met and wait is 0', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...falseCompareResult, pass: false }, { ...falseCompareResult, pass: false }],
                    })
                })

                test('should return true when condition is met within wait time', async () => {
                    let attempts = 0
                    const conditions = async () => {
                        attempts++
                        return attempts >= 3 ? trueConditions() : falseConditions()
                    }

                    const result = await waitUntilResult(conditions, isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                    expect(attempts).toBeGreaterThanOrEqual(3)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 200, interval: 50 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...falseCompareResult, pass: false }, { ...falseCompareResult, pass: false }],
                    })
                })

                test('should throw error if condition throws and never recovers', async () => {
                    await expect(waitUntilResult(errorCondition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
                })

                test('should recover from errors if condition eventually succeeds', async () => {
                    let attempts = 0
                    const condition = async () => {
                        attempts++
                        if (attempts < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueConditions()
                    }

                    const result = await waitUntilResult(condition, isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                    expect(attempts).toBe(3)
                })

                test('should use default options when not provided', async () => {
                    const result = await waitUntilResult(trueConditions)

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                })
            })

            describe('given isNot is true', () => {
                const isNot = true

                test('should handle isNot flag correctly when condition is true', async () => {
                    const result = await waitUntilResult(trueConditions, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }, { ...trueCompareResult, pass : false }],
                    })
                })

                test('should handle isNot flag correctly when condition is true and wait is 0', async () => {
                    const result = await waitUntilResult(trueConditions, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }, { ...trueCompareResult, pass : false }],
                    })
                })

                test('should handle isNot flag correctly when condition is false', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...falseCompareResult, pass : true }, { ...falseCompareResult, pass : true }],
                    })
                })

                test('should handle isNot flag correctly when condition is false and wait is 0', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...falseCompareResult, pass : true }, { ...falseCompareResult, pass : true }],
                    })
                })

                test('should throw error if condition throws and never recovers', async () => {
                    await expect(waitUntilResult(errorCondition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
                })

                test('should do all the attempts to succeed even with isNot true', async () => {
                    let attempts = 0
                    const conditions = async () => {
                        attempts++
                        if (attempts < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueConditions()
                    }
                    const result = await waitUntilResult(conditions, isNot, { wait: 1000, interval: 50 })
                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }, { ...trueCompareResult, pass : false }],
                    })
                    expect(attempts).toBe(3)
                })

            })
        })

        describe('given Browser is multi-remote and we use the list of remotes to fetch each remote value', () => {
            const trueConditions: (() => Promise<CompareResult>)[] = [
                trueCondition,
                trueCondition,
            ]
            const falseConditions: (() => Promise<CompareResult>)[] = [
                falseCondition,
                falseCondition
            ]
            describe('given isNot is false', () => {
                const isNot = false

                test('should return true when condition is met immediately', async () => {
                    const result = await waitUntilResult(trueConditions, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                })

                test('should return false when condition is not met and wait is 0', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...falseCompareResult, pass: false }, { ...falseCompareResult, pass: false }],
                    })
                })

                test('should return true when condition is met within wait time', async () => {
                    let attempts1 = 0
                    const condition1 = async () => {
                        attempts1++
                        return attempts1 >= 3 ? trueCondition() : falseCondition()
                    }
                    let attempts2 = 0
                    const condition2 = async () => {
                        attempts2++
                        return attempts2 >= 3 ? trueCondition() : falseCondition()
                    }

                    const result = await waitUntilResult([condition1, condition2], isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                    expect(attempts1).toBeGreaterThanOrEqual(3)
                    expect(attempts2).toBeGreaterThanOrEqual(3)
                })

                test('should return false when condition is not met within wait time', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 200, interval: 50 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...falseCompareResult, pass: false }, { ...falseCompareResult, pass: false }],
                    })
                })

                test('should throw error if condition throws and never recovers', async () => {
                    await expect(waitUntilResult(errorCondition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
                })

                test('should recover from errors if condition eventually succeeds', async () => {
                    let attempts1 = 0
                    const condition1 = async () => {
                        attempts1++
                        if (attempts1 < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueCondition()
                    }

                    let attempts2 = 0
                    const condition2 = async () => {
                        attempts2++
                        if (attempts2 < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueCondition()
                    }

                    const result = await waitUntilResult([condition1, condition2], isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                    expect(attempts1).toBe(3)
                    expect(attempts2).toBe(3)
                })

                test('should use default options when not provided', async () => {
                    const result = await waitUntilResult(trueConditions)

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...trueCompareResult, pass : true }, { ...trueCompareResult, pass : true }],
                    })
                })
            })

            describe('given isNot is true', () => {
                const isNot = true

                test('should handle isNot flag correctly when condition is true', async () => {
                    const result = await waitUntilResult(trueConditions, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }, { ...trueCompareResult, pass : false }],
                    })
                })

                test('should handle isNot flag correctly when condition is true and wait is 0', async () => {
                    const result = await waitUntilResult(trueConditions, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }, { ...trueCompareResult, pass : false }],
                    })
                })

                test('should handle isNot flag correctly when condition is false', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 1000, interval: 100 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...falseCompareResult, pass : true }, { ...falseCompareResult, pass : true }],
                    })
                })

                test('should handle isNot flag correctly when condition is false and wait is 0', async () => {
                    const result = await waitUntilResult(falseConditions, isNot, { wait: 0 })

                    expect(result).toEqual({
                        pass: true,
                        results: [{ ...falseCompareResult, pass : true }, { ...falseCompareResult, pass : true }],
                    })
                })

                test('should throw error if condition throws and never recovers', async () => {
                    await expect(waitUntilResult(errorCondition, isNot, { wait: 200, interval: 50 })).rejects.toThrow('Test error')
                })

                test('should do all the attempts to succeed even with isNot true', async () => {
                    let attempts1 = 0
                    const condition1 = async () => {
                        attempts1++
                        if (attempts1 < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueCondition()
                    }
                    let attempts2 = 0
                    const condition2 = async () => {
                        attempts2++
                        if (attempts2 < 3) {
                            throw new Error('Not ready yet')
                        }
                        return trueCondition()
                    }

                    const result = await waitUntilResult([condition1, condition2], isNot, { wait: 1000, interval: 50 })

                    expect(result).toEqual({
                        pass: false,
                        results: [{ ...trueCompareResult, pass : false }, { ...trueCompareResult, pass : false }],
                    })
                    expect(attempts1).toBe(3)
                    expect(attempts2).toBe(3)
                })

            })
        })
    })
})
