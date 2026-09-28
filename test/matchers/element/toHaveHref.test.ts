import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveHref } from '../../../src/matchers/element/toHaveHref.js'
import type { AssertionResult } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'

import { multiRemote } from '../../../src/api/index.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteElementsCommand, mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
vi.mock('@wdio/globals')

describe(toHaveHref, () => {

    let thisContext: { 'toHaveHref': typeof toHaveHref }

    beforeEach(() => {
        thisContext = { 'toHaveHref': toHaveHref }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockResolvedValue('https://www.example.com')
        })

        test('success when contains', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveHref(el, 'https://www.example.com', { wait: 0, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveHref',
                expectedValue: 'https://www.example.com',
                options: { beforeAssertion, afterAssertion, wait: 0 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveHref',
                expectedValue: 'https://www.example.com',
                options: { beforeAssertion, afterAssertion, wait: 0 },
                result
            })
        })

        describe('failure when doesnt contain', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveHref(el, 'an href')
            })

            test('failure with proper failure message', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute href

Expected: "an href"
Received: "https://www.example.com"`
                )
            })
        })
    })

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')
        })

        test('checks the same href or one href per element', async () => {
            const same = await thisContext.toHaveHref(elements, 'some attribute', { wait: 0 })
            const perElement = await thisContext.toHaveHref(elements, ['some attribute', 'some attribute'], { wait: 0 })

            expect(same.pass).toBe(true)
            expect(perElement.pass).toBe(true)
        })

        test('fails with the href of every element', async () => {
            vi.mocked(elements[1].getAttribute).mockResolvedValue('other')

            const result = await thisContext.toHaveHref(elements, 'some attribute', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute href

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
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have attribute href

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "some attribute",
-   "firefox": "some attribute",
+   "firefox": "other",
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have attribute href

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
        ])('checks the same href or one href per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getAttribute', 'other')

            const same = await thisContext.toHaveHref(element, 'some attribute', { wait: 0 })
            const perInstance = await thisContext.toHaveHref(element, multiRemote({ chrome: 'some attribute', firefox: 'other' }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })

        test('checks one array per instance, as the plain object shorthand, element by element on $$()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2) as unknown as WebdriverIO.MultiRemoteElement[]
            mockMultiRemoteElementsCommand(elements, 'getAttribute', { chrome: ['some attribute', 'second'], firefox: ['other', 'another'] })

            const result = await thisContext.toHaveHref(elements, { chrome: ['some attribute', 'second'], firefox: ['other', 'another'] }, { wait: 0 })
            const swapped = await thisContext.toHaveHref(elements, { chrome: ['second', 'some attribute'], firefox: ['another', 'other'] }, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(swapped.pass).toBe(false)
        })

        test('rejects one array per instance on $()', async () => {
            const element = createMultiRemoteElementMock(browsers(), 'sel')

            // @ts-expect-error an array per instance is only supported for $$()
            const result = await thisContext.toHaveHref(element, { chrome: ['some attribute'], firefox: ['some attribute'] }, { wait: 0 })

            expect(result.pass).toBe(false)
        })
    })
})
