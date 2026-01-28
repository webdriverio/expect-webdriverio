import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { toHaveWidth } from '../../../src/matchers/element/toHaveWidth.js'
import type { Size } from '../../../src/matchers/element/toHaveSize.js'

vi.mock('@wdio/globals')

describe(toHaveWidth, () => {

    let thisContext: { toHaveWidth: typeof toHaveWidth }
    let thisNotContext: { toHaveWidth: typeof toHaveWidth, isNot: boolean }

    beforeEach(() => {
        thisContext = { toHaveWidth }
        thisNotContext = { toHaveWidth, isNot: true }
    })

    describe('given single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getSize).mockResolvedValue(50 as unknown as Size & number) // GetSize typing is broken see fixed in https://github.com/webdriverio/webdriverio/pull/15003
        })

        test('success', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveWidth(el, 50, { beforeAssertion, afterAssertion })

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

        test('error', async () => {
            el.getSize = vi.fn().mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveWidth(el, 10))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveWidth(el, 50)

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveWidth(el, 10, { wait: 0 })

            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have width

Expected: 10
Received: 50`)
            expect(result.pass).toBe(false)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveWidth(el, 50, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('gte and lte', async () => {
            const result = await thisContext.toHaveWidth(el, { gte: 49, lte: 51 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveWidth(el, 50)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have width

Expected [not]: 50
Received      : 50`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveWidth(el, 100)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('message', async () => {
            el.getSize = vi.fn().mockResolvedValue(null)

            const result = await thisContext.toHaveWidth(el, 50)

            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have width

Expected: 50
Received: null`
            )
        })
    })

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray
        beforeEach(async () => {
            elements = await $$('sel')
        })

        test('wait for success', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveWidth(elements, 50, { beforeAssertion, afterAssertion, wait: 500 } )

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getSize).toHaveBeenCalledTimes(1))
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveWidth',
                expectedValue: 50,
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveWidth',
                expectedValue: 50,
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but failure', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockRejectedValue(new Error('some error')))

            await expect(() => thisContext.toHaveWidth(elements, 10))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisContext.toHaveWidth(elements, 50)

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getSize).toHaveBeenCalledTimes(1))
        })

        test('no wait - failure', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisContext.toHaveWidth(elements, 10, { wait: 0 })

            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have width

- Expected  - 2
+ Received  + 2

  Array [
-   10,
-   10,
+   50,
+   50,
  ]`
            )
            expect(result.pass).toBe(false)
            elements.forEach(el => expect(el.getSize).toHaveBeenCalledTimes(1))
        })

        test('no wait - success', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisContext.toHaveWidth(elements, 50, { wait: 0 })

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getSize).toHaveBeenCalledTimes(1))
        })

        test('gte and lte', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisContext.toHaveWidth(elements, { gte: 49, lte: 51 })

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getSize).toHaveBeenCalledTimes(1))
        })

        test('not - failure - pass should be true', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisNotContext.toHaveWidth(elements, 50)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have width

Expected [not]: [50, 50]
Received      : [50, 50]`
            )
        })

        test('not - failure lte - pass should be true', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisNotContext.toHaveWidth(elements, { lte: 51 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have width

Expected [not]: ["<= 51", "<= 51"]
Received      : [50, 50]`
            )
        })

        test('not - failure lte only first element - pass should be true', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisNotContext.toHaveWidth(elements, [{ lte: 51 }, 51])

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have width

Expected [not]: ["<= 51", 51]
Received      : [50, 50]`
            )
        })

        test('not - failure gte - pass should be true', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(50))

            const result = await thisNotContext.toHaveWidth(elements, { gte: 49 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have width

Expected [not]: [">= 49", ">= 49"]
Received      : [50, 50]`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveWidth(elements, 10)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('message', async () => {
            elements.forEach(el => el.getSize = vi.fn().mockResolvedValue(null))

            const result = await thisContext.toHaveWidth(elements, 50)

            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have width

- Expected  - 2
+ Received  + 2

  Array [
-   50,
-   50,
+   null,
+   null,
  ]`)
        })
    })
})
