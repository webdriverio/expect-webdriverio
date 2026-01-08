import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { compareNumbers, compareObject, compareText, compareTextWithArray, executeCommandBe } from '../src/utils'
import { awaitElements } from '../src/util/elementsUtil'
import * as waitUntilModule from '../src/util/waitUntil'
import { enhanceErrorBe } from '../src/util/formatMessage'
import type { CommandOptions } from 'expect-webdriverio'
import { elementFactory } from './__mocks__/@wdio/globals'
import { executeCommand } from '../src/util/executeCommand'
import { $ } from '@wdio/globals'

vi.mock('../src/util/executeCommand', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../src/util/executeCommand')>()
    return {
        ...actual,
        executeCommand: vi.spyOn(actual, 'executeCommand'),
    }
})
vi.mock('../src/util/formatMessage', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../src/util/formatMessage')>()
    return {
        ...actual,
        enhanceErrorBe: vi.spyOn(actual, 'enhanceErrorBe'),
    }
})
vi.mock('../src/util/elementsUtil.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../src/util/elementsUtil.js')>()
    return {
        ...actual,
        awaitElements: vi.spyOn(actual, 'awaitElements'),
        map: vi.spyOn(actual, 'map'),
    }
})

describe('utils', () => {
    describe(compareText, () => {
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

    describe(compareTextWithArray, () => {
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

    describe(compareNumbers, () => {
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

    describe(compareObject, () => {
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

    // TODO dprevost to review
    describe.skip(executeCommandBe, () => {
        let context: { isNot: boolean; expectation: string; verb: string }
        let command: () => Promise<boolean>
        let options: CommandOptions

        beforeEach(() => {
            context = {
                isNot: false,
                expectation: 'displayed',
                verb: 'be'
            }
            command = vi.fn().mockResolvedValue(true)
            options = { wait: 1000, interval: 100 }

            // vi.mocked(waitUntilModule.waitUntil).mockImplementation(async (callback, _isNot, _options) => {
            //     return await callback()
            // })
        })

        afterEach(() => {
            vi.clearAllMocks()
        })

        test('should fail immediately if no elements are found', async () => {
            vi.mocked(awaitElements).mockResolvedValue({
                elements: undefined,
                isSingleElement: false,
                isElementLikeType: false
            })

            const result = await executeCommandBe.call(context, undefined as any, command, options)

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect undefined to be displayed

Expected: "displayed"
Received: "not displayed"`)
            expect(waitUntilModule.waitUntil).not.toHaveBeenCalled()
        })

        describe('given single element', () => {
            let received = $('element1')
            beforeEach(() => {
                received = $('element1')
            })

            test('should pass given executeCommandWithArray returns success', async () => {
                // vi.mocked(executeCommandWithArray).mockResolvedValue({ success: true, elements: [element], values: undefined })

                const result = await executeCommandBe.call(context, received, command, options)

                expect(result.pass).toBe(true)
                expect(awaitElements).toHaveBeenCalledWith(received)
                expect(waitUntilModule.waitUntil).toHaveBeenCalled()
            })

            test('should pass options to waitUntil', async () => {
                await executeCommandBe.call(context, received, command, options)

                expect(waitUntilModule.waitUntil).toHaveBeenCalledWith(
                    expect.any(Function),
                    false,
                    { wait: options.wait, interval: options.interval }
                )
            })

            test('should fail given executeCommandWithArray returns failure', async () => {
                vi.mocked(executeCommand).mockResolvedValue({ success: false, elementOrArray: [], valueOrArray: undefined, results: [false, false] })

                const result = await executeCommandBe.call(context, received, command, options)

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`element1\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
                expect(enhanceErrorBe).toHaveBeenCalledWith(
                    received,
                    expect.objectContaining({ isNot: false }),
                    'be',
                    'displayed',
                    options
                )
            })

            test('should propagate isNot to waitUntil and enhanceErrorBe when isNot is true', async () => {
                const isNot = true
                const negatedContext = { ...context, isNot }
                vi.mocked(executeCommand).mockResolvedValue({ success: true, elementOrArray: [], valueOrArray: undefined, results: [true, true] })

                await executeCommandBe.call(negatedContext, received, command, options)

                expect(waitUntilModule.waitUntil).toHaveBeenCalledWith(
                    expect.any(Function),
                    true,
                    expect.any(Object)
                )
                expect(enhanceErrorBe).toHaveBeenCalledWith(
                    received,
                    expect.objectContaining({ isNot: true }),
                    'be',
                    'displayed',
                    options
                )
            })
        })

        describe('given multiple elements', () => {

            describe('given element[]', () => {
                const element1 = elementFactory('element1')
                const element2 = elementFactory('element2')
                const received = [element1, element2]

                test('should pass given executeCommandWithArray returns success', async () => {
                    vi.mocked(executeCommand).mockResolvedValue({ success: true, elementOrArray: [], valueOrArray: undefined, results: [true, true] })

                    const result = await executeCommandBe.call(context, received, command, options)

                    expect(result.pass).toBe(true)
                    expect(awaitElements).toHaveBeenCalledWith(received)
                    expect(waitUntilModule.waitUntil).toHaveBeenCalled()
                })

                test('should fail given executeCommandWithArray returns failure', async () => {
                    vi.mocked(executeCommand).mockResolvedValue({ success: false, elementOrArray: [], valueOrArray: undefined, results: [false, false] })

                    const result = await executeCommandBe.call(context, received, command, options)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
Expect $(\`element1\`), $(\`element2\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
                    expect(enhanceErrorBe).toHaveBeenCalledWith(
                        [element1, element2],
                        expect.objectContaining(context),
                        context.verb,
                        context.expectation,
                        options
                    )
                })
            })
        })
    })

})
