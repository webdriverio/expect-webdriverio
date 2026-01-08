import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveId } from '../../../src/matchers/element/toHaveId.js'
import type { AssertionResult } from 'expect-webdriverio'

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
                return null as unknown as string // casting to fix typing issue, see https://github.com/webdriverio/webdriverio/pull/15003
            })
        })

        test('success', async () => {
            const result = await thisContext.toHaveId(el, 'test id', { wait: 1 })
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
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveId',
                    expectedValue: 'an attribute',
                    options: { beforeAssertion, afterAssertion, wait: 1 }
                })
                expect(result.pass).toBe(false)
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveId',
                    expectedValue: 'an attribute',
                    options: { beforeAssertion, afterAssertion, wait: 1 },
                    result
                })

                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have attribute id

Expected: "an attribute"
Received: "test id"`
                )
            })
        })
    })
})
