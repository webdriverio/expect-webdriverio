import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute.js'

vi.mock('@wdio/globals')

describe(toHaveAttribute, () => {
    let thisContext: { toHaveAttribute: typeof toHaveAttribute }
    let thisIsNotContext: { isNot: boolean, toHaveAttribute: typeof toHaveAttribute }

    beforeEach(() => {
        thisContext = { toHaveAttribute }
        thisIsNotContext = { isNot: true, toHaveAttribute }
    })

    describe('given single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockResolvedValue('Correct Value')
        })

        describe('attribute exists', () => {
            test('success when present', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined, { beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', undefined],
                    options: { beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', undefined],
                    options: { beforeAssertion, afterAssertion },
                    result
                })
            })

            test('not - failure when present for %s - pass should be true', async () => {
                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('not - failure when present for %s - pass should be true', async () => {
                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name', undefined)

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: true
Received: false`
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

            test.for([
                undefined,
                null
            ])('not - failure when present for %s - pass should be false', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue('Wrong')

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct')

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
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
                    expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: /WDIO/
Received: "Wrong"`
                    )
                })
            })
        })

        describe('attribute does not exist or does not have a value', () => {
            test.for([
                undefined,
                null
            ])('failure when not present for %s', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('failure when not present for %s', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined)

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

            test.for([
                undefined,
                null
            ])('not - success when not present for %s - pass should be false', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name', undefined)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })
        })
    })

    describe('given multiple elements', () => {
        let els: ChainablePromiseArray

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

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', undefined, { beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', undefined],
                    options: { beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', undefined],
                    options: { beforeAssertion, afterAssertion },
                    result
                })
            })

            test('failure when not present', async () => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', undefined)

                expect(result.pass).toBe(false)
            })

            describe('message shows correctly', () => {

                test('expect message', async () => {
                    els.forEach(el => {
                        vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)
                    })

                    const result = await thisContext.toHaveAttribute(els, 'attribute_name', undefined)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have attribute attribute_name

Expected: true
Received: false`
                    )
                })
            })
        })

        describe('attribute has value', () => {
            test('success with correct value', async () => {
                const result = await thisContext.toHaveAttribute(els, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

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
                    expect(result.message()).toEqual(`\
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
                    expect(result.message()).toEqual(`\
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
            ])('failure when not present for %s', async ( attributeValue) => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)
                })

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', undefined)

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
            ])('not - success when not present for %s - pass should be false', async ( attributeValue) => {
                els.forEach(el => {
                    vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)
                })

                const result = await thisIsNotContext.toHaveAttribute(els, 'attribute_name', undefined)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure when one is present for %s - pass should be true', async () => {
                vi.mocked(els[0].getAttribute).mockResolvedValue('Some Value')
                vi.mocked(els[1].getAttribute).mockResolvedValue(null as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(els, 'attribute_name', undefined)

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('failure when only one is present for %s', async () => {
                vi.mocked(els[0].getAttribute).mockResolvedValue('Some Value')
                vi.mocked(els[1].getAttribute).mockResolvedValue(null as unknown as string)

                const result = await thisContext.toHaveAttribute(els, 'attribute_name', undefined)

                expect(result.pass).toBe(false)
            })
        })

        test('fails when no elements are provided', async () => {
            const result = await thisContext.toHaveAttribute([], 'attribute_name', 'some value')

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect [] to have attribute attribute_name

Expected: "some value"
Received: undefined`)
        })
    })
})
