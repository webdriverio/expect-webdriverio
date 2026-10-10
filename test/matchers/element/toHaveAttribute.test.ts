import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute'
import stripAnsi from 'strip-ansi'
import { waitUntil } from '../../../src/util/waitUntil.js'
import { expect as wdioExpect } from '../../../src/index.js'

import { multiRemote } from '../../../src/api/index.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteElementsCommand, mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
vi.mock('@wdio/globals')

describe(toHaveAttribute, () => {
    let thisContext: { toHaveAttribute: typeof toHaveAttribute }
    let thisIsNotContext: { isNot: boolean, toHaveAttribute: typeof toHaveAttribute }

    beforeEach(() => {
        thisContext = { toHaveAttribute }
        thisIsNotContext = { isNot: true, toHaveAttribute }
    })

    describe('given single element', () => {
        let el: WebdriverIO.Element

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockResolvedValue('Correct Value')
        })

        describe('attribute exists', () => {
            test('success when present', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', wdioExpect.anything(), { beforeAssertion, afterAssertion, wait: 3, interval: 3 })

                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 3, interval: 3 })
                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', 'Anything'],
                    options: { beforeAssertion, afterAssertion, wait: 3, interval: 3 }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', 'Anything'],
                    options: { beforeAssertion, afterAssertion, wait: 3, interval: 3 },
                    result
                })
            })

            test('success when checking with asymmetric matcher', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', expect.stringContaining('Correct'))

                expect(result.pass).toBe(true)
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: Anything
Received: null`
                    )
                })
            })
        })

        describe('attribute has value', () => {
            test('success with correct value', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('success with RegExp and correct value', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', /cOrReCt VaLuE/i)

                expect(result.pass).toBe(true)
            })

            test('failure with wrong value', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue('Wrong Value')

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })

            test('failure with non-string attribute value as actual', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue(123 as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })

            test('failure with non-string attribute value as expected', async () => {
                // @ts-expect-error invalid type
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 123, { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue('Wrong')

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct')

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: "Correct"
Received: "Wrong"`
                    )
                })
            })

            describe('failure with RegExp, message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue('Wrong')

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name', /WDIO/)

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: /WDIO/
Received: "Wrong"`
                    )
                })
            })
        })

        describe('given attribute existence', () => {
            test.for([
                undefined,
                null
            ])('failure when not present (not expected value) for %s', async ( attributeValue ) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: Anything
Received: ${attributeValue}`
                )
            })

            test.for([
                undefined,
                null
            ])('failure when not present (not expected value but with options) for %s', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', expect.anything(), { wait: 1, interval: 1 })

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('not - success when not present for %s - pass should be false', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure when present for %s - pass should be true', async () => {
                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have attribute attribute_name

Expected [not]: Anything
Received      : "Correct Value"`
                )
            })
        })

        test('fails when no elements are provided', async () => {
            const result = await thisContext.toHaveAttribute([], 'attribute_name', 'some value')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect [] to have attribute attribute_name

Expected: ["some value"]
Received: undefined`)
        })
    })

    describe('given multiple elements', () => {
        let els: WebdriverIO.ElementArray

        beforeEach(async () => {
            els = await $$('sel')

            els.forEach(el => {
                vi.mocked(el.getAttribute).mockResolvedValue('Correct Value')
            })

            expect(els).toHaveLength(2)
        })

        describe('attribute exists', () => {
            test('success when present', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything(), { beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', 'Anything'],
                    options: { beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', 'Anything'],
                    options: { beforeAssertion, afterAssertion },
                    result
                })
            })

            test('failure when not present', async () => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything())

                expect(result.pass).toBe(false)
            })

            describe('message shows correctly', () => {

                test('expect message', async () => {
                    els.forEach(el => {
                        vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)
                    })

                    const result = await thisContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything())

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute attribute_name

- Expected  - 2
+ Received  + 2

  Array [
-   Anything,
-   Anything,
+   null,
+   null,
  ]`
                    )
                })
            })
        })

        describe('attribute has value', () => {
            test('success with correct single value', async () => {
                const result = await thisContext.toHaveAttribute(els, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('success with correct multiple value', async () => {
                const result = await thisContext.toHaveAttribute(els, 'attribute_name', ['Correct Value', 'Correct Value'], { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('success with RegExp and correct value', async () => {
                const result = await thisContext.toHaveAttribute(els, 'attribute_name', /cOrReCt VaLuE/i)

                expect(result.pass).toBe(true)
            })

            test('failure with wrong value', async () => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue('Wrong Value')
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })
            test('failure with non-string attribute value as actual', async () => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(123 as unknown as string)
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })
            test('failure with non-string attribute value as expected', async () => {
                const result = await thisContext.toHaveAttribute(els, 'attribute_name', 123 as unknown as string, { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })
            describe('message shows correctly', () => {

                test('expect message', async () => {
                    els.forEach(el => {
                        vi.mocked(el.getAttribute).mockResolvedValue('Wrong')
                    })

                    const result = await thisContext.toHaveAttribute(els, 'attribute_name', 'Correct')

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute attribute_name

- Expected  - 2
+ Received  + 2

  Array [
-   "Correct",
-   "Correct",
+   "Wrong",
+   "Wrong",
  ]`
                    )
                })
            })
            describe('failure with RegExp, message shows correctly', () => {

                test('expect message', async () => {
                    els.forEach(el => {
                        vi.mocked(el.getAttribute).mockResolvedValue('Wrong')
                    })

                    const result = await thisContext.toHaveAttribute(els, 'attribute_name', /WDIO/)

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute attribute_name

- Expected  - 2
+ Received  + 2

  Array [
-   /WDIO/,
-   /WDIO/,
+   "Wrong",
+   "Wrong",
  ]`
                    )
                })
            })
        })

        describe('attribute does not exist or does not have a value', () => {
            test.for([
                undefined,
                null
            ])('failure when not present for %s', async ( attributeValue) => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name')

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('failure when not present with expect.anything() for %s', async ( attributeValue) => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything())

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('not - success when not present for %s - pass should be false', async ( attributeValue) => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)
                })

                const result = await thisIsNotContext.toHaveAttribute(els, 'attribute_name')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test.for([
                undefined,
                null
            ])('not - success when not present with expect.anything() for %s - pass should be false', async ( attributeValue) => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)
                })

                const result = await thisIsNotContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything())

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure when one is present for %s - pass should be true', async () => {
                vi.mocked(els[0].getAttribute).mockResolvedValue('Some Value')
                vi.mocked(els[1].getAttribute).mockResolvedValue(null as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything())

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('failure when only one is present for %s', async () => {
                vi.mocked(els[0].getAttribute).mockResolvedValue('Some Value')
                vi.mocked(els[1].getAttribute).mockResolvedValue(null as unknown as string)

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', wdioExpect.anything())

                expect(result.pass).toBe(false)
            })
        })

        test('given not enough expected value', async () => {
            const result = await thisContext.toHaveAttribute(els, 'attribute_name', ['Correct Value'])

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute attribute_name

- Expected  - 0
+ Received  + 1

  Array [
    "Correct Value",
+   "Correct Value",
  ]`
            )
        })

        test('given too many expected value', async () => {
            const result = await thisContext.toHaveAttribute(els, 'attribute_name', ['Correct Value', 'Correct Value', 'Correct Value'])

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have attribute attribute_name

- Expected  - 1
+ Received  + 1

  Array [
    "Correct Value",
    "Correct Value",
-   "Correct Value",
+   undefined,
  ]`
            )
        })

        test('fails when no elements are provided', async () => {
            const result = await thisContext.toHaveAttribute([], 'attribute_name', 'some value')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect [] to have attribute attribute_name

Expected: ["some value"]
Received: undefined`)
        })
    })

    describe('given multi-remote elements', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

        test.each([
            { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel'), message: `\
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have attribute data-test

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "some attribute",
-   "firefox": "some attribute",
+   "firefox": "other",
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have attribute data-test

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
        ])('checks the same attribute or one attribute per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getAttribute', 'other')

            const same = await thisContext.toHaveAttribute(element, 'data-test', 'some attribute', { wait: 0 })
            const perInstance = await thisContext.toHaveAttribute(element, 'data-test', multiRemote({ chrome: 'some attribute', firefox: 'other' }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })

        test('checks one array per instance, as the plain object shorthand, element by element on $$()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
            mockMultiRemoteElementsCommand(elements, 'getAttribute', { chrome: ['some attribute', 'second'], firefox: ['other', 'another'] })

            const result = await thisContext.toHaveAttribute(elements, 'data-test', { chrome: ['some attribute', 'second'], firefox: ['other', 'another'] }, { wait: 0 })
            const swapped = await thisContext.toHaveAttribute(elements, 'data-test', { chrome: ['second', 'some attribute'], firefox: ['another', 'other'] }, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(swapped.pass).toBe(false)
        })

        test('rejects one array per instance on $()', async () => {
            const element = createMultiRemoteElementMock(browsers(), 'sel')

            // An array per instance is only supported for $$(): the public types reject it (test-types/)
            const result = await thisContext.toHaveAttribute(element, 'data-test', { chrome: ['some attribute'], firefox: ['some attribute'] } as never, { wait: 0 })

            expect(result.pass).toBe(false)
        })
    })
})
