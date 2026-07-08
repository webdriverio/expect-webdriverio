import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, } from '@wdio/globals'
import { toBeDisabled } from '../../../src/matchers/element/toBeDisabled.js'
import stripAnsi from 'strip-ansi'
import { waitUntil } from '../../../src/utils.js'

vi.mock('@wdio/globals')

describe(toBeDisabled, () => {
    let thisContext: { toBeDisabled: typeof toBeDisabled }
    let thisNotContext: { isNot: true; toBeDisabled: typeof toBeDisabled }

    /**
     * result is inverted for toBeDisabled because it inverts isEnabled result
     * `!await el.isEnabled()`
     */
    beforeEach(async () => {
        thisContext = { toBeDisabled }
        thisNotContext = { isNot: true, toBeDisabled }
    })

    describe('given single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            thisContext = { toBeDisabled }
            thisNotContext = { isNot: true, toBeDisabled }

            el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(false)
        })

        test('wait for success', async () => {
            vi.mocked(el.isEnabled).mockResolvedValueOnce(true).mockResolvedValueOnce(false)
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toBeDisabled(el, { beforeAssertion, afterAssertion, wait: 500 })

            expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 500, interval: undefined })
            expect(result.pass).toBe(true)
            expect(el.isEnabled).toHaveBeenCalledTimes(2)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toBeDisabled',
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toBeDisabled',
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(el.isEnabled).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toBeDisabled(el))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toBeDisabled(el)

            expect(result.pass).toBe(true)
            expect(el.isEnabled).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            vi.mocked(el.isEnabled).mockResolvedValue(true)

            const result = await thisContext.toBeDisabled(el, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to be disabled

Expected: "disabled"
Received: "not disabled"`)
            expect(el.isEnabled).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toBeDisabled(el, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.isEnabled).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toBeDisabled(el)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to be disabled

Expected: "not disabled"
Received: "disabled"`)
        })

        test('not - success - pass should be false', async () => {
            const el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(true)

            const result = await thisNotContext.toBeDisabled(el)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('not - failure (with wait) - pass should be true', async () => {
            const el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(false)

            const result = await thisNotContext.toBeDisabled(el)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        })

        test('not - success (with wait) - pass should be false', async () => {
            const el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(true)

            const result = await thisNotContext.toBeDisabled(el)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })
    })
})
