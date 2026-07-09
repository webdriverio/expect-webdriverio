import { $ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toHaveElementClass } from '../../../src/matchers/element/toHaveElementClass.js'
import type { AssertionResult } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

describe(toHaveElementClass, () => {

    let thisContext: { toHaveElementClass: typeof toHaveElementClass }
    let thisNotContext: { isNot: true; toHaveElementClass: typeof toHaveElementClass }

    beforeEach(() => {
        thisContext = { toHaveElementClass }
        thisNotContext = { isNot: true, toHaveElementClass }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockImplementation(async (attribute: string) => {
                if (attribute === 'class') {
                    return 'some-class another-class yet-another-class'
                }
                return null
            })
        })

        test('success when class name is present', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveElementClass(el, 'some-class', { wait: 0, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementClass',
                expectedValue: 'some-class',
                options: { beforeAssertion, afterAssertion, wait: 0 },
                result
            })
        })

        test('success when including surrounding spaces and asymmetric matcher', async () => {
            const result = await thisContext.toHaveElementClass(el, expect.stringContaining('some-class '))
            expect(result.pass).toBe(true)

            const result2 = await thisContext.toHaveElementClass(el, expect.stringContaining(' another-class '))
            expect(result2.pass).toBe(true)
        })

        test('success with multiple asymmetric matcher', async () => {
            const result = await thisContext.toHaveElementClass(el, [expect.stringContaining('some-class'), expect.stringContaining('another-class')])

            expect(result.pass).toBe(true)
        })

        test('failure with multiple asymmetric matcher', async () => {
            const result = await thisContext.toHaveElementClass(el, [expect.stringContaining('notsome-class'), expect.stringContaining('notanother-class')], { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have class

Expected: [StringContaining "notsome-class", StringContaining "notanother-class"]
Received: "some-class another-class yet-another-class"`
            )
        })

        test('success with RegExp when class name is present', async () => {
            const result = await thisContext.toHaveElementClass(el, /sOmE-cLaSs/i)

            expect(result.pass).toBe(true)
        })

        test('success if array matches with class', async () => {
            const result = await thisContext.toHaveElementClass(el, ['some-class', 'yet-another-class'])

            expect(result.pass).toBe(true)
        })

        test('failure if the classes do not match', async () => {
            const result = await thisContext.toHaveElementClass(el, 'someclass', { wait: 0, message: 'Not found!' })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Not found!
Expect $(\`sel\`) to have class

Expected: "someclass"
Received: "some-class another-class yet-another-class"`)
        })

        test('failure if array does not match with class', async () => {
            const result = await thisContext.toHaveElementClass(el, ['someclass', 'anotherclass'])

            expect(result.pass).toBe(false)
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveElementClass(el, ['not-class', 'not-another-class'])

            expect(result.pass).toBe(false) // success, boolean is inverted later
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveElementClass(el, ['some-class', 'not-another-class'], { wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later
        })

        describe('options', () => {
            test('should fail when class is not a string', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue(null)

                const result = await thisContext.toHaveElementClass(el, 'some-class')

                expect(result.pass).toBe(false)
            })

            test('should pass when trimming the attribute', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue('  some-class  ')

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
                result = await thisContext.toHaveElementClass(el, 'test')
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have class

Expected: "test"
Received: "some-class another-class yet-another-class"` )
            })
        })

        describe('failure with RegExp when class name is not present', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveElementClass(el, /WDIO/)
            })

            test('failure', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have class

Expected: /WDIO/
Received: "some-class another-class yet-another-class"` )
            })
        })
    })
})
