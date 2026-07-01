import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import type { Size } from '../../../src/matchers/element/toHaveSize.js'
import { toHaveSize } from '../../../src/matchers/element/toHaveSize.js'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

describe(toHaveSize, async () => {
    let thisContext: { toHaveSize: typeof toHaveSize }
    let thisNotContext: { isNot: true; toHaveSize: typeof toHaveSize }

    const expectedValue: Size = { width: 32, height: 32 }
    const wrongValue: Size = { width: 15, height: 32 }

    beforeEach(async () => {
        thisContext =  { toHaveSize }
        thisNotContext = { isNot: true, ...thisContext }
    })

    describe.for([
        { element: await $('sel'), type: 'awaited ChainablePromiseElement' },
        { element: await $('sel').getElement(), type: 'awaited getElement of ChainablePromiseElement (e.g. WebdriverIO.Element)' },
        { element: $('sel'), type: 'non-awaited of ChainablePromiseElement' }
    ])('given a single element when $type', ({ element }) => {
        let el: ChainablePromiseElement | WebdriverIO.Element

        beforeEach(() => {
            el = element
            vi.mocked(el.getSize).mockResolvedValue(expectedValue as unknown as Size & number) // vitest does not support overloads function well
        })

        test('wait for success', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveSize(el, expectedValue, { beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveSize',
                expectedValue: expectedValue,
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveSize',
                expectedValue: expectedValue,
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(el.getSize).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveSize(el, expectedValue))
                .rejects.toThrow('some error')
        })

        test('success by default', async () => {
            const result = await thisContext.toHaveSize(el, expectedValue)

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure with proper error message', async () => {
            vi.mocked(el.getSize).mockResolvedValue(wrongValue as unknown as Size & number)

            const result = await thisContext.toHaveSize(el, expectedValue, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getSize).toHaveBeenCalledTimes(1)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have size

- Expected  - 1
+ Received  + 1

  Object {
    "height": 32,
-   "width": 32,
+   "width": 15,
  }`
            )
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveSize(el, expectedValue, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveSize(el, expectedValue)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have size

Expected [not]: {"height": 32, "width": 32}
Received      : {"height": 32, "width": 32}`
            )
        })

        test('should fails with custom failure message', async () => {
            vi.mocked(el.getSize).mockResolvedValue(wrongValue as unknown as Size & number)

            const result = await thisContext.toHaveSize(el, expectedValue, { wait: 1, message: 'Custom error message' })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Custom error message
Expect $(\`sel\`) to have size

- Expected  - 1
+ Received  + 1

  Object {
    "height": 32,
-   "width": 32,
+   "width": 15,
  }`
            )
        })

        // TODO bring back with PR supporting $$
        test.skip('should fails when expected is an unsupported array type', async () => {
            const result = await thisContext.toHaveSize(el, [expectedValue] as any)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have size

Expected: [{"height": 32, "width": 32}]
Received: "Expected value cannot be an array"`
            )
        })

    })
})
