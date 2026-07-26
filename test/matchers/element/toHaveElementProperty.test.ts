import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'
import stripAnsi from 'strip-ansi'
import { jasmine } from '../../__mocks__/jasmine.js'
import { waitUntil } from '../../../src/utils.js'
import { expect as wdioExpect } from '../../../src/index.js'

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

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', 'iPhone', { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion })

            expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0, interval: undefined })
            expect(result.pass).toBe(true)
            expect(el.getProperty).toHaveBeenCalledTimes(1)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementProperty',
                expectedValue: ['myPropertyName', 'iPhone'],
                options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveElementProperty',
                expectedValue: ['myPropertyName', 'iPhone'],
                options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion },
                result
            })
        })

        test('success with when property value is number and expected is the same number', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', 5)

            expect(result.pass).toBe(true)
        })

        test('fail with when property value is number and expected is the not same number', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', 10)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: 10
Received: 5`
            )
        })

        test('fail with when property value is number and expected is a string without asString option', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', '5')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: "5"
Received: 5`
            )
        })

        test('success with when property value is number and expected is a string with asString option', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', '5', { asString: true })

            expect(result.pass).toBe(true)
        })

        // TODO Need deep equality to support array and object properly
        test('success with when property value is a plain bject, bug?', async () => {
            vi.mocked(el.getProperty).mockResolvedValue( { foo: 'bar' } )

            // @ts-expect-error -- object not working for now, to support later
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', { foo: 'bar' } )

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: {"foo": "bar"}
Received: {"foo": "bar"}`
            )
        })

        test('failure and unsupported type when property value is an array', async () => {
            vi.mocked(el.getProperty).mockResolvedValue( { foo: 'bar' } )

            // @ts-expect-error -- object not working for now, to support later
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', [{ foo: 'bar' }])
            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: [{"foo": "bar"}]
Received: {"foo": "bar"}`
            )
        })

        test('assymeric match with vitest asymmetrics matcher', async () => {
            // Casting since we use vitest asymmetrics matcher instead of wdio one and TypeScript show a deprecation
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', expect.stringContaining('phone') as AsymmetricMatcher<string>)
            expect(result.pass).toBe(true)
        })

        test('assymeric match with jasmine matcher', async () => {
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', jasmine.stringContaining('phone'))
            expect(result.pass).toBe(true)
        })

        test('not - success - should return pass=false if values dont match', async () => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName', 'foobar')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('not - failure - should return true if values match', async () => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName', 'iphone')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have property myPropertyName

Expected [not]: "iphone"
Received      : "iphone"`)
        })

        test('with RegExp should return true if values match', async () => {
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', /iPhOnE/i)

            expect(result.pass).toBe(true)
        })

        test.for([
            { expectedValue: null },
            { expectedValue: undefined }
        ]
        )('should return true when property does exist by passing an not defined expected value - deprecated', async ( { expectedValue }) => {
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', expectedValue)

            expect(result.pass).toBe(true)
        })

        describe('when using any/anything asymmetric matchers', () => {
            test('should return true when property does exist by passing the anything() asymmetric matcher', async () => {
                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('should return true when property does exist by passing the jasmine anything() asymmetric matcher', async () => {
                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', jasmine.anything(), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('should return false when property does not exist by passing the jasmine anything() asymmetric matcher', async () => {
                vi.mocked(el.getProperty).mockResolvedValue(null)
                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', jasmine.anything(), { wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: "<jasmine.anything>"
Received: null`
                )
            })

            test.for([
                { actualValue: null },
                { actualValue: undefined }
            ]
            )('should return false when property does not exist by passing the anything() asymmetric matcher', async ({ actualValue }) => {
                vi.mocked(el.getProperty).mockResolvedValue(actualValue)

                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: Anything
Received: ${actualValue}`
                )
            })

            test('should return true when property does exist by passing the any(String) asymmetric matcher', async () => {
                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', wdioExpect.any(String), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('should return be false when property does exist but not a number and by passing the any(Number) asymmetric matcher', async () => {
                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', wdioExpect.any(Number), { wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: Any<Number>
Received: "iphone"`)
            })

            test('should return be true when property does exist but not a number and by passing the any(Number) asymmetric matcher', async () => {
                vi.mocked(el.getProperty).mockResolvedValue(5)

                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', wdioExpect.any(Number), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('not - should succeed (pass=false) when property does not exists and using .not', async () => {
                vi.mocked(el.getProperty).mockResolvedValue(null)

                const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })
        })

        test.for([
            { expectedValue: null },
            { expectedValue: undefined }
        ]
        )('not - should return failure (true) if property exists by passing not defined expected value when isNot is true - deprecated', async ( { expectedValue }) => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName', expectedValue)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        })

        test('should return true when property does exist', async () => {
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName')

            expect(result.pass).toBe(true)
        })

        test.for([
            { propertyValue: null },
            { propertyValue: undefined }
        ]
        )('should return false when property does not exist', async ({ propertyValue }) => {
            vi.mocked(el.getProperty).mockResolvedValue(propertyValue)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: Anything
Received: ${propertyValue}`
            )
        })

        test('not - should return failure (true) if property exists', async () => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have property myPropertyName

Expected [not]: Anything
Received      : "iphone"`)
        })

        test.for([
            { propertyValue: null },
            { propertyValue: undefined }
        ]
        )('not - should return success (false) when property does not exist', async ({ propertyValue }) => {
            vi.mocked(el.getProperty).mockResolvedValue(propertyValue)

            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('should return false for undefined input', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(undefined)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', 'iphone')

            expect(result.pass).toBe(false)
        })

        test('should return false for null input', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(null)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', 'iphone')

            expect(result.pass).toBe(false)
        })

        test('should return false if value is non-string', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', 'Test Value')

            expect(result.pass).toBe(false)
        })

        test('not - success - should return pass=false if value is non-string', async () => {
            vi.mocked(el.getProperty).mockResolvedValue(5)

            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName', 'Test Value')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        describe('failure with RegExp when value does not match', () => {
            test('failure', async () => {
                const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', /WDIO/)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: /WDIO/
Received: "iphone"`)
            })
        })

        test('should return false if value is an array of strings - tsc failure, not supported', async () => {
            vi.mocked(el.getProperty).mockResolvedValue('Test Value')

            /// @ts-expect-error -- array of strings not supported for single element, to support later
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', ['Test Value'])
            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property myPropertyName

Expected: ["Test Value"]
Received: "Test Value"`)
        })

        test('not - should fails (pass=true) if value is an array of strings - tsc failure, not supported', async () => {
            vi.mocked(el.getProperty).mockResolvedValue('Test Value')

            /// @ts-expect-error -- array of strings not supported for single element, to support later
            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName', ['Test Value'])
            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have property myPropertyName

Expected [not]: ["Test Value"]
Received      : "Test Value"`)
        })

    })

    describe('given multiple elements', () => {
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
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['property', 'iPhone'],
                    options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
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
                expect(stripAnsi(result.message())).toEqual(`\
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
                    expect(stripAnsi(result.message())).toEqual(`\
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

            describe('when using any/anything asymmetric matchers', () => {
                test('should return true when property does exist by passing the anything() asymmetric matcher', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return false when property does not exist by passing the anything() asymmetric matcher', async () => {
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have property myPropertyName

- Expected  - 1
+ Received  + 1

  Array [
    Anything,
-   Anything,
+   null,
  ]`
                    )
                })

                test('should return true when property does exist by passing the any(String) asymmetric matcher', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.any(String), { wait: 0 })

                    expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0, interval: undefined })
                    expect(result.pass).toBe(true)
                })

                test('should return be false when property does exist but not a number and by passing the any(Number) asymmetric matcher', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.any(Number), { wait: 0 })

                    expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0, interval: undefined })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have property myPropertyName

- Expected  - 2
+ Received  + 2

  Array [
-   Any<Number>,
-   Any<Number>,
+   "iphone",
+   "iphone",
  ]`)
                })

                test('should return be true when property does exist but not a number and by passing the any(Number) asymmetric matcher', async () => {
                    els.forEach(el =>
                        vi.mocked(el.getProperty).mockResolvedValue(5)
                    )

                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.any(Number), { wait: 0 })

                    expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0, interval: undefined })
                    expect(result.pass).toBe(true)
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
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['property', ['iPhone', 'iPhone']],
                    options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
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
                expect(stripAnsi(result.message())).toEqual(`\
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
                expect(stripAnsi(result.message())).toContain(`\
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

            test('should return true if value is null and expected existance', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(null)
                )

                const result = await thisContext.toHaveElementProperty(els, 'property')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toContain(`\
Expect $$(\`sel\`) to have property property

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

            test('not - should succeed (pass=false) if value is null and not expecting existance', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(null)
                )

                const result = await thisIsNotContext.toHaveElementProperty(els, 'property')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - success - should return false if actual value is null and expected is not null', async () => {
                els.forEach(el =>
                    vi.mocked(el.getProperty).mockResolvedValue(null)
                )

                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', ['yo', 'yo'])

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - success - should return false if actual value are not expected', async () => {
                vi.mocked(els[0].getProperty).mockResolvedValue('no1')
                vi.mocked(els[1].getProperty).mockResolvedValue('no2')

                const result = await thisIsNotContext.toHaveElementProperty(els, 'property', ['yo1', 'yo2'])

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
                    expect(stripAnsi(result.message())).toEqual(`\
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

            describe('should fail if there is less expected values than elements', () => {
                test('failure', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'property', ['iphone'])

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have property property

- Expected  - 0
+ Received  + 1

  Array [
    "iphone",
+   "iphone",
  ]`)
                })
            })

            describe('should fail if there is more expected values than elements', () => {
                test('failure', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'property', ['iphone', 'iphone', 'iphone'])

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have property property

- Expected  - 1
+ Received  + 1

  Array [
    "iphone",
    "iphone",
-   "iphone",
+   undefined,
  ]`)
                })
            })

            describe('when using any/anything asymmetric matchers', () => {
                test('should return true when property does exist by passing the anything() asymmetric matcher with options', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return true when property does exist by passing nothing', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName')

                    expect(result.pass).toBe(true)
                })

                test('should return true when property does exist by passing the anything() asymmetric matcher', async () => {
                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', [wdioExpect.anything(), wdioExpect.any(String)], { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return false when property does not exist by passing the anything() asymmetric matcher', async () => {
                    vi.mocked(els[0].getProperty).mockResolvedValue(undefined)
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', [wdioExpect.anything(), wdioExpect.any(String)], { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have property myPropertyName

- Expected  - 2
+ Received  + 2

  Array [
-   Anything,
-   Any<String>,
+   undefined,
+   null,
  ]`
                    )
                })

                test('should return true when one property exists but not the other', async () => {
                    vi.mocked(els[0].getProperty).mockResolvedValue('iphone')
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisContext.toHaveElementProperty(els, 'myPropertyName', ['iphone', null], { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('not - should succeed (pass=false) when property does not exist by using not', async () => {
                    vi.mocked(els[0].getProperty).mockResolvedValue(undefined)
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisIsNotContext.toHaveElementProperty(els, 'myPropertyName')

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('not - should succeed (pass=false) when property does not exist by using not but with options', async () => {
                    vi.mocked(els[0].getProperty).mockResolvedValue(undefined)
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisIsNotContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('not - should fails (pass=true) when property does exist by using not but with options', async () => {
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisIsNotContext.toHaveElementProperty(els, 'myPropertyName', wdioExpect.anything(), { wait: 0 })

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) not to have property myPropertyName

Expected [not]: [Anything, Anything]
Received      : ["iphone", null]`)
                })

                test('not - should fails (pass=true) when property does exist by using not but with options and jasmine.anything()', async () => {
                    vi.mocked(els[1].getProperty).mockResolvedValue(null)

                    const result = await thisIsNotContext.toHaveElementProperty(els, 'myPropertyName', jasmine.anything(), { wait: 0 })

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) not to have property myPropertyName

Expected [not]: ["<jasmine.anything>", "<jasmine.anything>"]
Received      : ["iphone", null]`)
                })
            })
        })
    })
})
