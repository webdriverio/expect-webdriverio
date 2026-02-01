import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { toBeDisabled } from '../../../src/matchers/element/toBeDisabled.js'

vi.mock('@wdio/globals')

describe('toBeDisabled', () => {
    /**
     * result is inverted for toBeDisplayed because it inverts isEnabled result
     * `!await el.isEnabled()`
     */
    test('wait for success', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false)
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toBeDisabled.call({}, el, { beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.isEnabled).toHaveBeenCalledTimes(3)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toBeDisabled',
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toBeDisabled',
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toBeDisabled.call({}, el))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(false)

        const result = await toBeDisabled.call({}, el)
        expect(result.pass).toBe(true)
        expect(el.isEnabled).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(true)

        const result = await toBeDisabled.call({}, el, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(el.isEnabled).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(false)

        const result = await toBeDisabled.call({}, el, { wait: 0 })

        expect(result.pass).toBe(true)
        expect(el.isEnabled).toHaveBeenCalledTimes(1)
    })

    test('not - failure - pass should be true', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(false)

        const result = await toBeDisabled.call({ isNot: true }, el, { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be disabled

Expected: "not disabled"
Received: "disabled"`
        )
    })

    test('not - success - pass should be false', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(true)

        const result = await toBeDisabled.call({ isNot: true }, el, { wait: 0 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('not - failure (with wait) - pass should be true', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(false)

        const result = await toBeDisabled.call({ isNot: true }, el, { wait: 1 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be disabled

Expected: "not disabled"
Received: "disabled"`
        )
    })

    test('not - success (with wait) - pass should be false', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(true)

        const result = await toBeDisabled.call({ isNot: true }, el, { wait: 1 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('message', async () => {
        const el = await $('sel')
        el.isEnabled = vi.fn().mockResolvedValue(true)

        const result = await toBeDisabled.call({}, el)
        expect(result.pass).toBe(false)
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) to be disabled

Expected: "disabled"
Received: "not disabled"`
        )
    })
})
