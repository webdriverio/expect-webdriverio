import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { toBeDisabled } from '../../../src/matchers/element/toBeDisabled.js'
import { executeCommandBe, waitUntil } from '../../../src/utils.js'

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

            const result = await thisContext.toBeDisabled(el, { beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(el.isEnabled).toHaveBeenCalledTimes(2)
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

        test('wait but error', async () => {
            vi.mocked(el.isEnabled).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toBeDisabled(el, { wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toBeDisabled(el, { wait: 1 })

            expect(result.pass).toBe(true)
            expect(el.isEnabled).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            vi.mocked(el.isEnabled).mockResolvedValue(true)

            const result = await thisContext.toBeDisabled(el, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
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

        test('not - failure', async () => {
            const result = await thisNotContext.toBeDisabled(el, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be disabled

Expected: "not disabled"
Received: "disabled"`)
        })

        test('not - success', async () => {
            const el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(true)

            const result = await thisNotContext.toBeDisabled(el, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('not - failure (with wait)', async () => {
            const el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(false)

            const result = await thisNotContext.toBeDisabled(el, { wait: 1 })

            expect(result.pass).toBe(false)
        })

        test('not - success (with wait)', async () => {
            const el = await $('sel')
            vi.mocked(el.isEnabled).mockResolvedValue(true)

            const result = await thisNotContext.toBeDisabled(el, { wait: 1 })

            expect(result.pass).toBe(true)
        })
    })

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')

            elements.forEach(element => {
                vi.mocked(element.isEnabled).mockResolvedValue(false)
            })
            expect(elements).toHaveLength(2)
        })

        test('wait for success', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toBeDisabled(elements, { beforeAssertion, afterAssertion })

            for (const element of elements) {
                expect(element.isEnabled).toHaveBeenCalledExactlyOnceWith()
            }

            expect(executeCommandBe).toHaveBeenCalledExactlyOnceWith(elements, expect.any(Function),
                {
                    'afterAssertion': afterAssertion,
                    'beforeAssertion': beforeAssertion,
                },
            )
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {})

            expect(result.pass).toBe(true)
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

        test('success with toBeDisabled and command options', async () => {
            const result = await thisContext.toBeDisabled(elements, { wait: 1 })

            elements.forEach(element => {
                expect(element.isEnabled).toHaveBeenCalledExactlyOnceWith()
            })
            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  { wait: 1 })
            expect(result.pass).toBe(true)
        })

        test('wait but failure', async () => {
            vi.mocked(elements[0].isEnabled).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toBeDisabled(elements, { wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toBeDisabled(elements, { wait: 1 })

            expect(result.pass).toBe(true)
            elements.forEach(element => {
                expect(element.isEnabled).toHaveBeenCalledTimes(1)
            })
        })

        test('no wait - failure', async () => {
            vi.mocked(elements[0].isEnabled).mockResolvedValue(true)

            const result = await thisContext.toBeDisabled(elements, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(elements[0].isEnabled).toHaveBeenCalledTimes(1)
            expect(elements[1].isEnabled).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toBeDisabled(elements, { wait: 0 })

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {
                wait: 0,
            })
            elements.forEach(element => {
                expect(element.isEnabled).toHaveBeenCalledExactlyOnceWith()
            })
            expect(result.pass).toBe(true)
        })

        test('not - failure', async () => {
            const result = await thisNotContext.toBeDisabled(elements, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to be disabled

Expected: "not disabled"
Received: "disabled"`
            )
        })

        test('not - success', async () => {
            elements.forEach(element => {
                vi.mocked(element.isEnabled).mockResolvedValue(true)
            })

            const result = await thisNotContext.toBeDisabled(elements, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('not - failure (with wait)', async () => {
            const result = await thisNotContext.toBeDisabled(elements, { wait: 1 })

            expect(result.pass).toBe(false)
        })

        test('not - success (with wait)', async () => {
            elements.forEach(element => {
                vi.mocked(element.isEnabled).mockResolvedValue(true)
            })

            const result = await thisNotContext.toBeDisabled(elements, { wait: 1 })

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), true,  {
                wait: 1,
            })
            elements.forEach(element => {
                expect(element.isEnabled).toHaveBeenCalledExactlyOnceWith()
            })
            expect(result.pass).toBe(true)
        })

        test('message when both elements fail', async () => {
            const elements = await $$('sel')

            elements.forEach(element => {
                vi.mocked(element.isEnabled).mockResolvedValue(true)
            })

            const result = await thisContext.toBeDisabled(elements, { wait: 1 })
            expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to be disabled

Expected: "disabled"
Received: "not disabled"`)
        })

        test('message when a single element fails', async () => {
            vi.mocked(elements[0].isEnabled).mockResolvedValue(true)

            const result = await thisContext.toBeDisabled(elements, { wait: 1 })
            expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to be disabled

Expected: "disabled"
Received: "not disabled"`)
        })
    })
})
