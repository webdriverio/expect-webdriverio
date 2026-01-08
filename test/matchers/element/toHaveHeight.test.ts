import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'
import { toHaveHeight } from '../../../src/matchers/element/toHaveHeight.js'

vi.mock('@wdio/globals')

describe(toHaveHeight, () => {

    let thisContext: { 'toHaveHeight': typeof toHaveHeight }
    let thisNotContext: { 'toHaveHeight': typeof toHaveHeight, isNot: boolean }

    beforeEach(() => {
        thisContext = { 'toHaveHeight': toHaveHeight }
        thisNotContext = { 'toHaveHeight': toHaveHeight, isNot: true }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')

            vi.mocked(el.getSize as () => Promise<number> /* typing requiring because of a bug, see https://github.com/webdriverio/webdriverio/pull/15003 */)
                .mockResolvedValue(32)
        })

        test('wait for success', async () => {
            vi.mocked(el.getSize as () => Promise<number>)
                .mockResolvedValueOnce(50)
                .mockResolvedValueOnce(32)
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveHeight(el, 32, { beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(2)
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
            vi.mocked(el.getSize).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveHeight(el, 10, { wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveHeight(el, 32, { wait: 1 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveHeight(el, 10, { wait: 0 })

            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have height

Expected: 10
Received: 32`
            )
            expect(result.pass).toBe(false)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveHeight(el, 32, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('gte and lte', async () => {
            const result = await thisContext.toHaveHeight(el, { gte: 31, lte: 33 }, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('not - failure', async () => {
            const result = await thisNotContext.toHaveHeight(el, 32, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have height

Expected [not]: 32
Received      : 32`
            )
        })

        test('not - success', async () => {
            const result = await thisNotContext.toHaveHeight(el, 10, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(el.getSize as () => Promise<number>).mockResolvedValue(1)

            const result = await thisContext.toHaveHeight(el, 50, { wait: 1 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have height

Expected: 50
Received: 1`
            )
        })
    })
})
