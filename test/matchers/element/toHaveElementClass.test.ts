import { $ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toHaveElementClass } from '../../../src/matchers/element/toHaveElementClass.js'
import type { AssertionResult } from 'expect-webdriverio'

vi.mock('@wdio/globals')

describe(toHaveElementClass, () => {

    let thisContext: { toHaveElementClass: typeof toHaveElementClass }
    // TODO have some isNot tests
    // let thisNotContext: { isNot: true; toHaveElementClass: typeof toHaveElementClass }

    beforeEach(() => {
        thisContext = { toHaveElementClass }
        // thisNotContext = { isNot: true, toHaveElementClass }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockImplementation(async (attribute: string) => {
                if (attribute === 'class') {
                    return 'some-class another-class yet-another-class'
                }
                return null as unknown as string /* casting required since wdio as bug typing see https://github.com/webdriverio/webdriverio/pull/15003 */
            })
        })

        test('success when class name is present', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveElementClass(el, 'some-class', { wait: 0, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 },
                result
            })
        })

        test('success when including surrounding spaces and asymmetric matcher', async () => {
            const result = await thisContext.toHaveElementClass(el, expect.stringContaining('some-class '), { wait: 0 })
            expect(result.pass).toBe(true)

            const result2 = await thisContext.toHaveElementClass(el, expect.stringContaining(' another-class '), { wait: 0 })
            expect(result2.pass).toBe(true)
        })

        test('success with RegExp when class name is present', async () => {
            const result = await thisContext.toHaveElementClass(el, /sOmE-cLaSs/i, { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('success if array matches with class', async () => {
            const result = await thisContext.toHaveElementClass(el, ['some-class', 'yet-another-class'], { wait: 0 })

            expect(result.pass).toBe(true)
        })

        test('failure if the classes do not match', async () => {
            const result = await thisContext.toHaveElementClass(el, 'someclass', { wait: 0, message: 'Not found!' })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Not found!
Expect $(\`sel\`) to have class

Expected: "someclass"
Received: "some-class another-class yet-another-class"`)
        })

        test('failure if array does not match with class', async () => {
            const result = await thisContext.toHaveElementClass(el, ['someclass', 'anotherclass'], { wait: 0 })

            expect(result.pass).toBe(false)
        })

        describe('options', () => {
            test('should fail when class is not a string', async () => {
                vi.mocked(el.getAttribute).mockImplementation(async () => {
                    return null as unknown as string // casting required since wdio as bug typing see
                })
                const result = await thisContext.toHaveElementClass(el, 'some-class', { wait: 0 })
                expect(result.pass).toBe(false)
            })

            test('should pass when trimming the attribute', async () => {
                vi.mocked(el.getAttribute).mockImplementation(async () => {
                    return '  some-class  '
                })
                const result = await thisContext.toHaveElementClass(el, 'some-class', { wait: 0, trim: true })
                expect(result.pass).toBe(true)
            })

            test('should pass when ignore the case', async () => {
                const result = await thisContext.toHaveElementClass(el, 'sOme-ClAsS', { wait: 0, ignoreCase: true })
                expect(result.pass).toBe(true)
            })

            test('should pass if containing', async () => {
                const result = await thisContext.toHaveElementClass(el, 'some', { wait: 0, containing: true })
                expect(result.pass).toBe(true)
            })

            test('should pass if array ignores the case', async () => {
                const result = await thisContext.toHaveElementClass(el, ['sOme-ClAsS', 'anOther-ClAsS'], { wait: 0, ignoreCase: true })
                expect(result.pass).toBe(true)
            })
        })

        describe('failure when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(el, 'test', { wait: 0 })
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have class

Expected: "test"
Received: "some-class another-class yet-another-class"` )
            })
        })

        describe('failure with RegExp when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(el, /WDIO/, { wait: 0 })
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have class

Expected: /WDIO/
Received: "some-class another-class yet-another-class"` )
            })
        })
    })
})
