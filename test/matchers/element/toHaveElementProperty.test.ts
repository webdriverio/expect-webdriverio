import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'

vi.mock('@wdio/globals')

describe(toHaveElementProperty, () => {
    const thisContext = { toHaveElementProperty }
    const thisIsNotContext = { isNot: true, toHaveElementProperty }

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(() => {
            el = $('sel')
            vi.mocked(el.getProperty).mockResolvedValue('iphone')
        })

        test('ignore case of stringified value', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveElementProperty(el, 'property', 'iPhone', { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(el.getProperty).toHaveBeenCalledTimes(1)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveElementProperty',
                expectedValue: ['property', 'iPhone'],
                options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveElementProperty',
                expectedValue: ['property', 'iPhone'],
                options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion },
                result
            })
        })

        test('success with when property value is number', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'property', 5)

            expect(result.pass).toBe(true)
        })

        // TODO Need deep equality to support array and object properly
        test('success with when property value is an array, bug?', async () => {
            vi.mocked(el.getProperty).mockResolvedValue([5])

            const result = await thisContext.toHaveElementProperty(el, 'property', [5])

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have property property

Expected: [5]
Received: [5]`
            )
        })

        // TODO Need deep equality to support array and object properly
        test('success with when property value an object, bug?', async () => {
            vi.mocked(el.getProperty).mockResolvedValue( { foo: 'bar' } )

            // @ts-expect-error -- object not working for now, to support later
            const result = await thisContext.toHaveElementProperty(el, 'property', { foo: 'bar' } )

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have property property

Expected: {"foo": "bar"}
Received: {"foo": "bar"}`
            )
        })

        test('assymeric match', async () => {
            const result = await thisContext.toHaveElementProperty(el, 'property', expect.stringContaining('phone'))
            expect(result.pass).toBe(true)
        })

        test('not - success - should return pass=false if values dont match', async () => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'property', 'foobar')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('not - failure - should return true if values match', async () => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'property', 'iphone')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have property property

Expected [not]: "iphone"
Received      : "iphone"`)
        })

        test('with RegExp should return true if values match', async () => {
            const result = await thisContext.toHaveElementProperty(el, 'property', /iPhOnE/i)

            expect(result.pass).toBe(true)
        })

        test('should return false for undefined input', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(undefined)

            const result = await thisContext.toHaveElementProperty(el, 'property', 'iphone')

            expect(result.pass).toBe(false)
        })

        test('should return false for null input', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(null)

            const result = await thisContext.toHaveElementProperty(el, 'property', 'iphone')

            expect(result.pass).toBe(false)
        })

        //TODO: False when expecting null and value is null, sounds like a bug?
        test('should return true? if value is null', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(null)

            const result = await thisContext.toHaveElementProperty(el, 'property', null)

            expect(result.pass).toBe(false)
        })

        test('should return false if value is non-string', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'property', 'Test Value')

            expect(result.pass).toBe(false)
        })

        test('not - success - should return pass=false if value is non-string', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisIsNotContext.toHaveElementProperty(el, 'property', 'Test Value')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        describe('failure with RegExp when value does not match', () => {
            test('failure', async () => {
                const result = await thisContext.toHaveElementProperty(el, 'property', /WDIO/)

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have property property

Expected: /WDIO/
Received: "iphone"`)
            })
        })
    })

    describe('given a multiple element', () => {
        let els: ChainablePromiseArray

        beforeEach(async () => {
            els = await $$('sel')
            els.forEach(element =>
                vi.mocked(element.getProperty).mockResolvedValue('iphone')
            )
            expect(els).toHaveLength(2)
        })

        describe('given a single expected value', () => {
            test('ignore case of stringified value', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveElementProperty(els, 'property', 'iPhone', { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                els.forEach(el =>
                    expect(el.getProperty).toHaveBeenCalledTimes(1)
                )
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['property', 'iPhone'],
                    options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['property', 'iPhone'],
                    options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion },
                    result
                })
            })

            test('asymeric match', async () => {
                const result = await thisContext.toHaveElementProperty(els, 'property', expect.stringContaining('phone'))
                expect(result.pass).toBe(true)
            })

            test('not - success - should return pass=false if values dont match', async () => {
                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', 'foobar')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure - should return pass=true if values match', async () => {
                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', 'iphone')

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have property property

Expected [not]: ["iphone", "iphone"]
Received      : ["iphone", "iphone"]`
                )
            })

            test('with RegExp should return true if values match', async () => {
                const result = await thisContext.toHaveElementProperty(els, 'property', /iPhOnE/i)

                expect(result.pass).toBe(true)
            })

            test('should return false for null input', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(undefined)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', 'iphone')

                expect(result.pass).toBe(false)
            })

            // True when return non null value but passing null as expected? Sounds like a bug
            test('should return true if value is null', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue('Test Value')
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', null)

                expect(result.pass).toBe(true)
            })

            test('should return false if expected is string and actual is non-string', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(5)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', 'Test Value')

                expect(result.pass).toBe(false)
            })

            test('should return true if equal values but with type number', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(5)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', 5)

                expect(result.pass).toBe(true)
            })

            describe('failure with RegExp when value does not match', () => {
                test('failure', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'property', /WDIO/)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have property property

- Expected  - 2
+ Received  + 2

  Array [
-   /WDIO/,
-   /WDIO/,
+   "iphone",
+   "iphone",
  ]`)
                })
            })
        })

        describe('given a multiple expected values', () => {
            test('ignore case of stringified value', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveElementProperty(els, 'property', ['iPhone', 'iPhone'], { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                els.forEach(el =>
                    expect(el.getProperty).toHaveBeenCalledTimes(1)
                )
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['property', ['iPhone', 'iPhone']],
                    options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['property', ['iPhone', 'iPhone']],
                    options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion },
                    result
                })
            })

            test('assymeric match', async () => {
                const result = await thisContext.toHaveElementProperty(els, 'property', [expect.stringContaining('phone'), expect.stringContaining('phone')])
                expect(result.pass).toBe(true)
            })

            test('not - success - should return false if values dont match', async () => {
                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', ['foobar', 'foobar'])

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure - should return true if values match', async () => {
                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', ['iphone', 'iphone'])

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have property property

Expected [not]: ["iphone", "iphone"]
Received      : ["iphone", "iphone"]`
                )
            })

            test('with RegExp should return true if values match', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue('iPhone')
                )
                const result = await thisContext.toHaveElementProperty(els, 'property', [/iPhOnE/i, /iPhOnE/i])

                expect(result.pass).toBe(true)
            })

            test('should return false for null input and expected value not null', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(null)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', ['iphone', 'iphone'])

                expect(result.pass).toBe(false)
                expect(result.message()).toContain(`\
Expect $$(\`sel\`) to have property property

- Expected  - 2
+ Received  + 2

  Array [
-   "iphone",
-   "iphone",
+   null,
+   null,
  ]`
                )
            })

            // TODO: This should pass, sounds like a bug?
            test.skip('should return true if value is null and expected are null', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(null)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', [null, null])

                expect(result.pass).toBe(true)
            })

            test('not - success - should return false if actual value is null and expected is not null', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(null)
                )

                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', ['yo', 'yo'])

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('should return false if actual value is non-string and expected is string', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(5)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', ['Test Value', 'Test Value'])

                expect(result.pass).toBe(false)
            })

            test('should return true if all are equal number types', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(5)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property', [5, 5])

                expect(result.pass).toBe(true)
            })

            describe('failure with RegExp when value does not match', () => {
                test('failure', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'property', /WDIO/)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have property property

- Expected  - 2
+ Received  + 2

  Array [
-   /WDIO/,
-   /WDIO/,
+   "iphone",
+   "iphone",
  ]`)
                })
            })
        })
    })
})
