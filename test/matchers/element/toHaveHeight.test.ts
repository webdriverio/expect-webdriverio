import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { toHaveHeight } from '../../../src/matchers/element/toHaveHeight.js'
import type { Size } from '../../../src/matchers/element/toHaveSize.js'
import stripAnsi from 'strip-ansi'

import { multiRemote } from '../../../src/api/index.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
vi.mock('@wdio/globals')

describe(toHaveHeight, () => {

    let thisContext: { 'toHaveHeight': typeof toHaveHeight }
    let thisNotContext: { 'toHaveHeight': typeof toHaveHeight, isNot: boolean }

    beforeEach(() => {
        thisContext = { 'toHaveHeight': toHaveHeight }
        thisNotContext = { 'toHaveHeight': toHaveHeight, isNot: true }
    })

    describe('given a single element', () => {
        let el: WebdriverIO.Element

        beforeEach(async () => {
            el = await $('sel')

            el.getSize = vi.fn().mockResolvedValue(32)
        })

        test('wait for success', async () => {
            el.getSize = vi.fn()
                .mockResolvedValueOnce(50)
                .mockResolvedValueOnce(32)
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveHeight(el, 32, { beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(2)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveHeight',
                expectedValue: 32,
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveHeight',
                expectedValue: 32,
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but failure', async () => {
            vi.mocked(el.getSize).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveHeight(el, 10))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveHeight(el, 32)

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveHeight(el, 10, { wait: 0 })

            expect(stripAnsi(result.message())).toEqual(`\
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
            const result = await thisContext.toHaveHeight(el, { gte: 31, lte: 33 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveHeight(el, 32)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have height

Expected [not]: 32
Received      : 32`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveHeight(el, 10)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('message', async () => {
            el.getSize = vi.fn().mockResolvedValue(1)

            const result = await thisContext.toHaveHeight(el, 50)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have height

Expected: 50
Received: 1`
            )
        })
    })

    describe('given multiple elements', () => {
        let elements: WebdriverIO.ElementArray

        beforeEach(async () => {
            elements = await $$('sel')
        })

        test('checks the same height or one height per element', async () => {
            const same = await thisContext.toHaveHeight(elements, 50, { wait: 0 })
            const perElement = await thisContext.toHaveHeight(elements, [50, 50], { wait: 0 })

            expect(same.pass).toBe(true)
            expect(perElement.pass).toBe(true)
        })

        test('fails with the height of every element', async () => {
            vi.mocked(elements[1].getSize).mockResolvedValue(60 as unknown as Size & number) // vitest does not support overloads function well

            const result = await thisContext.toHaveHeight(elements, 50, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have height

- Expected  - 1
+ Received  + 1

  Array [
    50,
-   50,
+   60,
  ]`)
        })
    })

    describe('given multi-remote elements', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

        test.each([
            { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel'), message: `\
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have height

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": 50,
-   "firefox": 50,
+   "firefox": 60,
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have height

- Expected  - 2
+ Received  + 2

  Multi-remote values {
    "chrome": Array [
      50,
      50,
    ],
    "firefox": Array [
-     50,
-     50,
+     60,
+     60,
    ],
  }` },
        ])('checks the same height or one height per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getSize', 60)

            const same = await thisContext.toHaveHeight(element, 50, { wait: 0 })
            const perInstance = await thisContext.toHaveHeight(element, multiRemote({ chrome: 50, firefox: 60 }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })
    })
})
