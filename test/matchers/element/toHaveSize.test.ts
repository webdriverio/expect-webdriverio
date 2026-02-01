import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveSize } from '../../../src/matchers/element/toHaveSize.js'

vi.mock('@wdio/globals')

describe('toHaveSize', () => {
    test('wait for success', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, { beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveSize',
            expectedValue: { width: 32, height: 32 },
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveSize',
            expectedValue: { width: 32, height: 32 },
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveSize.call({}, el, { width: 32, height: 32 }, {}))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, {})

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })

        const result = await toHaveSize.call({}, el, { width: 15, height: 32 }, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, { wait: 0 })

        expect(result.pass).toBe(true)
        expect(el.getSize).toHaveBeenCalledTimes(1)
    })

    test('not - failure - pass should be true', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })
        const result = await toHaveSize.call({ isNot: true }, el, { width: 32, height: 32 }, { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have size

Expected [not]: {"height": 32, "width": 32}
Received      : {"height": 32, "width": 32}`
        )
    })

    test("should return false if sizes don't match", async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })

        const result = await toHaveSize.bind({})(el, { width: 15, height: 32 }, { wait: 1 })

        expect(result.pass).toBe(false)
    })

    test('should return true if sizes match', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue({ width: 32, height: 32 })

        const result = await toHaveSize.bind({})(el, { width: 32, height: 32 }, { wait: 1 })

        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el = await $('sel')
        el.getSize = vi.fn().mockResolvedValue(null)

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 })

        expect(result.pass).toBe(false)
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have size

Expected: {"height": 32, "width": 32}
Received: null`)
    })
})
