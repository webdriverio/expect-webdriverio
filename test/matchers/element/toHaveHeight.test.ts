import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived } from '../../__fixtures__/utils.js'
import { toHaveHeight } from '../../../src/matchers/element/toHaveHeight.js'

vi.mock('@wdio/globals')

describe('toHaveHeight', () => {
    test('wait for success', async () => {
        const el = await $('sel')

        el.getSize = vi.fn()
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(32)
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveHeight.call({}, el, 32, { beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(3)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveHeight',
            expectedValue: 32,
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveHeight',
            expectedValue: 32,
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveHeight.call({}, el, 10, {}))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.call({}, el, 32, {})

        expect(result.message()).toEqual('Expect $(`sel`) to have height\n\nExpected: 32\nReceived: serializes to the same string')
        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.call({}, el, 10, { wait: 0 })
        expect(result.message()).toEqual('Expect $(`sel`) to have height\n\nExpected: 10\nReceived: 32')
        expect(result.pass).toBe(false)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.call({}, el, 32, { wait: 0 })

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('gte and lte', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.call({}, el, { gte: 31, lte: 33 }, { wait: 0 })

        expect(result.message()).toEqual('Expect $(`sel`) to have height\n\nExpected: ">= 31 && <= 33"\nReceived: 32')
        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('not - failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.call({}, el, 32, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if sizes don't match", async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.bind({})(el, 10, { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if sizes match', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(32)

        const result = await toHaveHeight.bind({})(el, 32, { wait: 1 })

        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(null)

        const result = await toHaveHeight.call({}, el, 50)

        expect(getExpectMessage(result.message())).toContain('to have height')
    })
})
