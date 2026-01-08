import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveChildren } from '../../../src/matchers/element/toHaveChildren'
import { waitUntil } from '../../../src/util/waitUntil'
import { $$Factory } from '../../__mocks__/@wdio/globals'
import type { ChainablePromiseArray } from 'webdriverio'

vi.mock('@wdio/globals')

describe(toHaveChildren, () => {
    const thisContext = { toHaveChildren }
    const thisNotContext = { isNot: true, toHaveChildren }

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
        })

        test('no value - success - default to gte 1 and with command options', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveChildren(el, undefined, { wait: 0, interval: 100, beforeAssertion, afterAssertion })

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  { wait: 0, interval: 100 })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveChildren',
                options: { wait: 0, interval: 100, beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveChildren',
                options: { wait: 0, interval: 100, beforeAssertion, afterAssertion },
                result
            })
        })

        test('use numberOption wait and internal', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveChildren(el, { eq: 2, wait: 0, interval: 100 }, { beforeAssertion, afterAssertion } )

            expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  { wait: 0, interval: 100 })
            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveChildren',
                options: { beforeAssertion, afterAssertion },
                expectedValue: { eq: 2, wait: 0, interval: 100 }

            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveChildren',
                options: { beforeAssertion, afterAssertion },
                result,
                expectedValue: { eq: 2, wait: 0, interval: 100 }
            })
        })

        test('success - If no options passed in + children exists', async () => {
            const result = await thisContext.toHaveChildren(el)
            expect(result.pass).toBe(true)
        })

        test('fails - If no options passed in + children do not exist', async () => {
            vi.mocked(el.$$).mockReturnValueOnce($$Factory('./child', 0))

            const result = await thisContext.toHaveChildren(el, undefined, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have children

Expected: ">= 1"
Received: 0`
            )
        })

        test('exact number value', async () => {
            const result = await thisContext.toHaveChildren(el, 2, { wait: 1 })

            expect(result.pass).toBe(true)
        })

        test('exact value', async () => {
            const result = await thisContext.toHaveChildren(el, { eq: 2, wait: 1 })

            expect(result.pass).toBe(true)
        })

        test('gte value', async () => {
            const result = await thisContext.toHaveChildren(el, { gte: 2 }, { wait: 1 })

            expect(result.pass).toBe(true)
        })

        test('exact value - failure', async () => {
            const result = await thisContext.toHaveChildren(el, { eq: 3 }, { wait: 1 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have children

Expected: 3
Received: 2`
            )
        })

        test('lte value - failure', async () => {
            const result = await thisContext.toHaveChildren(el, { lte: 1 }, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have children

Expected: "<= 1"
Received: 2`
            )
        })

        test('.not exact value - failure', async () => {
            const result = await thisNotContext.toHaveChildren(el, { eq: 2 }, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have children

Expected [not]: 2
Received      : 2`
            )
        })

        test('.not lte value - failure', async () => {
            const result = await thisNotContext.toHaveChildren(el, { lte: 2 }, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have children

Expected [not]: "<= 2"
Received      : 2`
            )
        })

        test('.not exact value - success', async () => {
            const result = await thisNotContext.toHaveChildren(el, { eq: 3 }, { wait: 1 })

            expect(result.pass).toBe(true)
        })
    })

    describe('given a multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')
        })

        describe('given a single expected value', () => {
            test('no value - success - default to gte 1 and with command options', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveChildren(elements, undefined, { wait: 0, interval: 100, beforeAssertion, afterAssertion })

                expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  { wait: 0, interval: 100 })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveChildren',
                    options: { wait: 0, interval: 100, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveChildren',
                    options: { wait: 0, interval: 100, beforeAssertion, afterAssertion },
                    result
                })
            })

            test('use numberOption wait and internal', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveChildren(elements, { eq: 2, wait: 0, interval: 100 }, { beforeAssertion, afterAssertion } )

                expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  { wait: 0, interval: 100 })
                expect(result.pass).toBe(true)
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveChildren',
                    options: { beforeAssertion, afterAssertion },
                    expectedValue: { eq: 2, wait: 0, interval: 100 }

                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveChildren',
                    options: { beforeAssertion, afterAssertion },
                    result,
                    expectedValue: { eq: 2, wait: 0, interval: 100 }
                })
            })

            test('success - If no options passed in + children exists', async () => {
                const result = await thisContext.toHaveChildren(elements)
                expect(result.pass).toBe(true)
            })

            // TODO failure message show 2 expected missing while only one should, to enhance later
            test('fails - If no options passed in + children do not exist', async () => {
                vi.mocked(elements[0].$$).mockReturnValueOnce($$Factory('./child', 0))

                const result = await thisContext.toHaveChildren(elements, undefined, { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to have children

- Expected  - 2
+ Received  + 2

  Array [
-   ">= 1",
-   ">= 1",
+   0,
+   2,
  ]`
                )
            })

            test('exact number value', async () => {
                const result = await thisContext.toHaveChildren(elements, 2, { wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('exact value', async () => {
                const result = await thisContext.toHaveChildren(elements, { eq: 2, wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('gte value', async () => {
                const result = await thisContext.toHaveChildren(elements, { gte: 2 }, { wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('exact value - failure', async () => {
                const result = await thisContext.toHaveChildren(elements, { eq: 3 }, { wait: 1 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to have children

- Expected  - 2
+ Received  + 2

  Array [
-   3,
-   3,
+   2,
+   2,
  ]`
                )
            })

            test('lte value - failure', async () => {
                const result = await thisContext.toHaveChildren(elements, { lte: 1 }, { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to have children

- Expected  - 2
+ Received  + 2

  Array [
-   "<= 1",
-   "<= 1",
+   2,
+   2,
  ]`
                )
            })

            test('.not exact value - failure', async () => {
                const result = await thisNotContext.toHaveChildren(elements, { eq: 2 }, { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to have children

Expected [not]: [2, 2]
Received      : [2, 2]`
                )
            })

            test('.not lte value - failure', async () => {
                const result = await thisNotContext.toHaveChildren(elements, { lte: 2 }, { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to have children

- Expected [not]  - 2
+ Received        + 2

  Array [
-   "<= 2",
-   "<= 2",
+   2,
+   2,
  ]`
                )
            })
            test('.not exact value - success', async () => {
                const result = await thisNotContext.toHaveChildren(elements, { eq: 3 }, { wait: 1 })

                expect(result.pass).toBe(true)
            })
        })

        describe('given a multiple expected value', () => {
            test('exact number value', async () => {
                const result = await thisContext.toHaveChildren(elements, [2, 2], { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('exact value', async () => {
                const result = await thisContext.toHaveChildren(elements, [{ eq: 2 },  { eq: 2 }], { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('gte value', async () => {
                const result = await thisContext.toHaveChildren(elements, [{ gte: 2 }, { gte: 2 }], { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('gte & lte value', async () => {
                const result = await thisContext.toHaveChildren(elements, [{ gte: 2 }, { lte: 2 }], { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('exact value - failure', async () => {
                const result = await thisContext.toHaveChildren(elements, [{ eq: 3 }, { eq: 3 }], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to have children

- Expected  - 2
+ Received  + 2

  Array [
-   3,
-   3,
+   2,
+   2,
  ]`
                )
            })

            test('lte value - failure', async () => {
                const result = await thisContext.toHaveChildren(elements, [{ lte: 1 }, { lte: 1 }], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to have children

- Expected  - 2
+ Received  + 2

  Array [
-   "<= 1",
-   "<= 1",
+   2,
+   2,
  ]`
                )
            })

            test('lte & gte value - failure', async () => {
                const result = await thisContext.toHaveChildren(elements, [{ lte: 1 }, { gte: 1 }], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to have children

- Expected  - 2
+ Received  + 2

  Array [
-   "<= 1",
-   ">= 1",
+   2,
+   2,
  ]`
                )
            })

            test('.not exact value - failure', async () => {
                const result = await thisNotContext.toHaveChildren(elements, [{ eq: 2 }, { eq: 2 }], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to have children

Expected [not]: [2, 2]
Received      : [2, 2]`)
            })

            test('.not lte value - failure', async () => {
                const result = await thisNotContext.toHaveChildren(elements, [{ lte: 2 }, { lte: 2 }], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to have children

- Expected [not]  - 2
+ Received        + 2

  Array [
-   "<= 2",
-   "<= 2",
+   2,
+   2,
  ]`)
            })

            test('.not lte & gte value - failure', async () => {
                const result = await thisNotContext.toHaveChildren(elements, [{ lte: 2 }, { gte: 2 }], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to have children

- Expected [not]  - 2
+ Received        + 2

  Array [
-   "<= 2",
-   ">= 2",
+   2,
+   2,
  ]`)
            })

            test('.not exact value - success', async () => {
                const result = await thisNotContext.toHaveChildren(elements, [{ eq: 3 }, { eq: 3 }], { wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('.not exact value on one element - success or pass?', async () => {
                const result = await thisNotContext.toHaveChildren(elements, [{ eq: 2 }, { eq: 3 }], { wait: 1 })

                expect(result.pass).toBe(false)
            })
        })
    })
})
