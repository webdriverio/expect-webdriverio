import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'
import stripAnsi from 'strip-ansi'
import { jasmine } from '../../__mocks__/jasmine.js'

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
        test('success with when property value an object, bug?', async () => {
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

        test('should return true when property does exist by passing an not defined expected value with options', async () => {
            const result = await thisContext.toHaveElementProperty(el, 'myPropertyName', { wait: 0 })

            expect(result.pass).toBe(true)
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

Expected: "to have a defined value"
Received: "value ${propertyValue}"`
            )
        })

        test('not - should return failure (true) if property exists', async () => {
            const result = await thisIsNotContext.toHaveElementProperty(el, 'myPropertyName')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have property myPropertyName

Expected [not]: "to have a defined value"
Received      : "value iphone"`)
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
    })
})
