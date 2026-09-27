import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveId } from '../../../src/matchers/element/toHaveId.js'
import type { AssertionResult } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'

import { multiRemote } from '../../../src/api/index.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
vi.mock('@wdio/globals')

describe(toHaveId, () => {

    let thisContext: { toHaveId: typeof toHaveId }

    beforeEach(() => {
        thisContext = { toHaveId }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockImplementation(async (attribute: string) => {
                if (attribute === 'id') {
                    return 'test id'
                }
                return null
            })
        })

        test('success', async () => {
            const result = await thisContext.toHaveId(el, 'test id')
            expect(result.pass).toBe(true)
        })

        describe('failure', () => {
            let result: AssertionResult
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            beforeEach(async () => {
                result = await thisContext.toHaveId(el, 'an attribute', { wait: 1, beforeAssertion, afterAssertion })
            })

            test('failure with proper failure callbacks and message', () => {
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveId',
                    expectedValue: 'an attribute',
                    options: { beforeAssertion, afterAssertion, wait: 1 }
                })
                expect(result.pass).toBe(false)
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveId',
                    expectedValue: 'an attribute',
                    options: { beforeAssertion, afterAssertion, wait: 1 },
                    result
                })

                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute id

Expected: "an attribute"
Received: "test id"`
                )
            })
        })
    })

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')
        })

        test('checks the same id or one id per element', async () => {
            const same = await thisContext.toHaveId(elements, 'some attribute', { wait: 0 })
            const perElement = await thisContext.toHaveId(elements, ['some attribute', 'some attribute'], { wait: 0 })

            expect(same.pass).toBe(true)
            expect(perElement.pass).toBe(true)
        })

        test('fails with the id of every element', async () => {
            vi.mocked(elements[1].getAttribute).mockResolvedValue('other')

            const result = await thisContext.toHaveId(elements, 'some attribute', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute id

- Expected  - 1
+ Received  + 1

  Array [
    "some attribute",
-   "some attribute",
+   "other",
  ]`)
        })
    })

    describe('given multi-remote elements', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

        test.each([
            { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel'), message: `\
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have attribute id

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "some attribute",
-   "firefox": "some attribute",
+   "firefox": "other",
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have attribute id

- Expected  - 2
+ Received  + 2

  Multi-remote values {
    "chrome": Array [
      "some attribute",
      "some attribute",
    ],
    "firefox": Array [
-     "some attribute",
-     "some attribute",
+     "other",
+     "other",
    ],
  }` },
        ])('checks the same id or one id per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getAttribute', 'other')

            const same = await thisContext.toHaveId(element, 'some attribute', { wait: 0 })
            const perInstance = await thisContext.toHaveId(element, multiRemote({ chrome: 'some attribute', firefox: 'other' }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })

        test('checks one array per instance, as the plain object shorthand, on $$()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2) as WebdriverIO.MultiRemoteElement[]
            mockMultiRemoteInstanceCommand(elements, 'firefox', 'getAttribute', 'other')

            const result = await thisContext.toHaveId(elements, { chrome: ['some attribute', 'some attribute'], firefox: ['other', 'other'] }, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('rejects one array per instance on $()', async () => {
            const element = createMultiRemoteElementMock(browsers(), 'sel')

            // @ts-expect-error an array per instance is only supported for $$()
            const result = await thisContext.toHaveId(element, { chrome: ['some attribute'], firefox: ['some attribute'] }, { wait: 0 })

            expect(result.pass).toBe(false)
        })
    })
})
