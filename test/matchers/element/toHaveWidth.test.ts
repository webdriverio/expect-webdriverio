import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived } from '../../__fixtures__/utils.js'
import { toHaveWidth } from '../../../src/matchers/element/toHaveWidth.js'

vi.mock('@wdio/globals')

describe('toHaveWidth', () => {
    test('wait for success', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveWidth.call({}, el, 50, { beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveWidth',
            expectedValue: 50,
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveWidth',
            expectedValue: 50,
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveWidth.call({}, el, 10, {}))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.call({}, el, 50, {})

        expect(result.message()).toEqual('Expect $(`sel`) to have width\n\nExpected: 50\nReceived: serializes to the same string')
        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.call({}, el, 10, { wait: 0 })

        expect(result.message()).toEqual('Expect $(`sel`) to have width\n\nExpected: 10\nReceived: 50')
        expect(result.pass).toBe(false)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.call({}, el, 50, { wait: 0 })

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('gte and lte', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.call({}, el, { gte: 49, lte: 51 }, { wait: 0 })

        expect(result.message()).toEqual('Expect $(`sel`) to have width\n\nExpected: ">= 49 && <= 51"\nReceived: 50')
        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('not - failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.call({}, el, 50, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if sizes don't match", async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.bind({})(el, 10, { wait: 1 })

        expect(result.pass).toBe(false)
    })

    test('should return true if sizes match', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(50)

        const result = await toHaveWidth.bind({})(el, 50, { wait: 1 })

        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(null)

        const result = await toHaveWidth.call({}, el, 50)

        expect(getExpectMessage(result.message())).toContain('to have width')
    })
})
