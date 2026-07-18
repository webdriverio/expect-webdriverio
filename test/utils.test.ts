import { describe, test, expect, beforeEach, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { compareObject, compareText, compareTextWithArray, executeCommandBe, getAsymmetricMatcherValue, isAsymmetricMatcher, isInversedStringContainingMatcher, isStringContainingMatcherLike, waitUntil } from '../src/utils'
import { jasmine } from './__mocks__/jasmine'
import { CommandOptions } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'
import { enhanceErrorBe } from '../src/util/formatMessage'
import { executeCommandWithStrategy } from '../src/util/executeCommand'

vi.mock('@wdio/globals')

vi.mock('../src/util/executeCommand', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../src/util/executeCommand')>()
    return {
        ...actual,
        executeCommand: vi.spyOn(actual, 'executeCommand'),
        executeCommandWithStrategy: vi.spyOn(actual, 'executeCommandWithStrategy'),
    }
})
vi.mock('../src/util/formatMessage', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../src/util/formatMessage')>()
    return {
        ...actual,
        enhanceErrorBe: vi.spyOn(actual, 'enhanceErrorBe'),
    }
})

describe('utils', () => {
    describe(compareText, () => {
        test('should pass when strings match', () => {
            expect(compareText('foo', 'foo', {}).result).toBe(true)
        })

        test('should fail when strings do not match', () => {
            expect(compareText('foo', 'bar', {}).result).toBe(false)
        })

        test('should pass when trims away white space', () => {
            expect(compareText(' foo ', 'foo', {}).result).toBe(true)
        })

        test('should fail without trimming away white space', () => {
            expect(compareText(' foo ', 'foo ', { trim: false }).result).toBe(false)
        })

        test('should pass if same word but wrong case and using ignoreCase', () => {
            expect(compareText(' FOO ', 'foo', { ignoreCase: true }).result).toBe(true)
            expect(compareText(' foo ', 'FOO', { ignoreCase: true }).result).toBe(true)
        })

        test('should pass if string contains expected and using containing', () => {
            expect(compareText('qwe_AsD_zxc', 'asd', { ignoreCase: true, containing: true }).result).toBe(true)
        })

        test('should support stringContaining asymmetric matchers', () => {
            expect(compareText('foo', expect.stringContaining('oo'), {}).result).toBe(true)
            expect(compareText('foo', expect.not.stringContaining('oo'), {}).result).toBe(false)
        })

        test('should support stringMatching asymmetric matchers', () => {
            expect(compareText('foo', expect.stringMatching(/.*oo.*/), {}).result).toBe(true)
            expect(compareText('foo', expect.not.stringMatching(/.*oo.*/), {}).result).toBe(false)
        })

        test('should support stringContaining asymmetric and using ignoreCase', () => {
            expect(compareText(' FOO ', expect.stringContaining('foo'), { ignoreCase: true }).result).toBe(true)
            expect(compareText(' FOO ', expect.not.stringContaining('foo'), { ignoreCase: true }).result).toBe(false)
            expect(compareText(' Foo ', expect.stringContaining('FOO'), { ignoreCase: true }).result).toBe(true)
            expect(compareText(' Foo ', expect.not.stringContaining('FOO'), { ignoreCase: true }).result).toBe(false)
            expect(compareText(' foo ', expect.stringContaining('foo'), { ignoreCase: true }).result).toBe(true)
        })

        test('should support jasmine.stringContaining matchers and using ignoreCase', () => {
            expect(compareText(' FOO ', jasmine.stringContaining('foo'), { ignoreCase: true }).result).toBe(true)
            expect(compareText(' Foo ', jasmine.stringContaining('FOO'), { ignoreCase: true }).result).toBe(true)
            expect(compareText(' foo ', jasmine.stringContaining('foo'), { ignoreCase: true }).result).toBe(true)
        })

        test('should support jasmine.stringMatching matchers', () => {
            expect(compareText(' FOO ', jasmine.stringMatching(/.*foo.*/i), {}).result).toBe(true)
        })
    })

    describe(compareTextWithArray, () => {
        test('should pass if strings match in array', () => {
            expect(compareTextWithArray('foo', ['foo', 'bar'], {}).result).toBe(true)
        })

        test('should fail if string does not match in array', () => {
            expect(compareTextWithArray('foo', ['foot', 'bar'], {}).result).toBe(false)
        })

        test('should pass if white space and using trim', () => {
            expect(compareTextWithArray(' foo ', ['foo', 'bar'], { trim: true }).result).toBe(true)
        })

        test('should pass if wrong case and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', ['foO', 'bar'], { trim: true, ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', ['foO', 'BAR'], { trim: true, ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', ['foOo', 'BAR'], { trim: true, ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray(' FOO ', ['foOO', 'bar'], { trim: true, ignoreCase: true }).result).toBe(false)
        })

        test('should pass if string contains and using containing', () => {
            expect(compareTextWithArray('qwe_AsD_zxc', ['foo', 'ZXC'], { ignoreCase: true, containing: true }).result).toBe(true)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxc'], { ignoreCase: true, containing: true }).result).toBe(true)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxcc'], { ignoreCase: true, containing: true }).result).toBe(false)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxcc'], { ignoreCase: true, containing: false }).result).toBe(false)
        })

        test('should support asymmetric matchers', () => {
            expect(compareTextWithArray('foo', [expect.stringContaining('oo'), expect.stringContaining('oobb')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.stringContaining('oobb'), expect.stringContaining('oo')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oo'), expect.stringContaining('oobb')], {}).result).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('oobb'), expect.not.stringContaining('oo')], {}).result).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('oo'), expect.not.stringContaining('oobb')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oobb'), expect.not.stringContaining('oo')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oof'), expect.not.stringContaining('oobb')], {}).result).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oo'), expect.not.stringContaining('foo')], {}).result).toBe(false)
        })

        test('should support asymmetric matchers and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', [expect.stringContaining('foo'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' FOO ', [expect.not.stringContaining('foo'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray(' foo ', [expect.stringContaining('FOO'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), expect.stringContaining('oobb')], { ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray(' foo ', [expect.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).result).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('FOOO'), 'FOO'], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('OO'), expect.not.stringContaining('FOOO')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOOO'), expect.not.stringContaining('OO')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOOO'), expect.not.stringContaining('OOO')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), expect.not.stringContaining('OO')], { ignoreCase: true }).result).toBe(false)
        })

        test('should support jasmine asymmetric matchers', () => {
            expect(compareTextWithArray('foo', [jasmine.stringContaining('oobb'), jasmine.stringContaining('oo')], {}).result).toBe(true)
        })

        test('should support jasmine asymmetric matchers and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', [jasmine.stringContaining('foo'), jasmine.stringContaining('oobb')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [jasmine.stringContaining('FOO'), jasmine.stringContaining('oobb')], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray(' foo ', [jasmine.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).result).toBe(true)
            expect(compareTextWithArray('foo', [jasmine.stringContaining('FOOO'), 'FOO'], { ignoreCase: true }).result).toBe(true)
        })
    })

    describe(compareObject, () => {
        test('should pass if the objects are equal', () => {
            expect(compareObject({ 'foo': 'bar' }, { 'foo': 'bar' }).result).toBe(true)
        })

        test('should pass if the objects are deep equal', () => {
            expect(compareObject({ 'foo': { 'bar': 'baz' } }, { 'foo': { 'bar': 'baz' } }).result).toBe(true)
        })

        test('should fail if the objects are not equal', () => {
            expect(compareObject({ 'foo': 'bar' }, { 'baz': 'quux' }).result).toBe(false)
        })

        test('should fail if the objects are only shallow equal', () => {
            expect(compareObject({ 'foo': { 'bar': 'baz' } }, { 'foo': { 'baz': 'quux' } }).result).toBe(false)
        })

        test('should fail if the actual value is a number or array', () => {
            expect(compareObject(10, { 'foo': 'bar' }).result).toBe(false)
            expect(compareObject([{ 'foo': 'bar' }], { 'foo': 'bar' }).result).toBe(false)
        })
    })

    describe(executeCommandBe, () => {
        let context: { isNot: boolean; expectation: string; verb: string }
        let command: (el: WebdriverIO.Element) => Promise<boolean>
        let options: CommandOptions

        beforeEach(() => {
            context = {
                isNot: false,
                expectation: 'displayed',
                verb: 'be'
            }
            command = vi.fn().mockResolvedValue(true)
            options = { wait: 0, interval: 1 }
        })

        describe('given no elements', () => {
            test('should fail given undefined', async () => {
                const result = await executeCommandBe.call(context, undefined as any, command, options)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect undefined to be displayed

Expected: "displayed"
Received: "not displayed"`)
                expect(waitUntil).toHaveBeenCalled()
            })

            test('should fail given empty array', async () => {
                const result = await executeCommandBe.call(context, [], command, options)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect [] to be displayed

Expected: "at least one result"
Received: []`)
                expect(waitUntil).toHaveBeenCalled()
            })
        })

        describe('given single element', () => {
            let received: ChainablePromiseElement

            beforeEach(() => {
                received = $('element1')
            })

            test('should pass given ChainableElement', async () => {
                const result = await executeCommandBe.call(context, received, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: received,
                    singleElementCompare: expect.any(Function),
                    isNot: false,
                    configuration: { allowEmptyElements: false }
                })
                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), false, options)
            })

            test('should pass given WebdriverIO.Element', async () => {
                const result = await executeCommandBe.call(context, received, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: received,
                    singleElementCompare: expect.any(Function),
                    isNot: false,
                    configuration: { allowEmptyElements: false }
                })
            })

            test('should fail if command returns false', async () => {
                vi.mocked(command).mockResolvedValue(false)

                const result = await executeCommandBe.call(context, received, command, options)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`element1\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)
                expect(enhanceErrorBe).toHaveBeenCalledWith(
                    await received,
                    false,
                    expect.objectContaining({ isNot: false }),
                    options
                )
            })

            describe('given isNot is true', () => {
                let negatedContext: { isNot: boolean; expectation: string; verb: string }

                beforeEach(() => {
                    // Success for `.not`
                    vi.mocked(command).mockResolvedValue(false)
                    negatedContext = {
                        expectation: 'displayed',
                        verb: 'be',
                        isNot: true
                    }
                })

                test('should succeed so pass=false since it is inverted later', async () => {
                    const result = await executeCommandBe.call(negatedContext, received, command, options)

                    expect(result.pass).toBe(false)
                    expect(enhanceErrorBe).toHaveBeenCalledWith(
                        await received,
                        false,
                        {
                            expectation: 'displayed',
                            isNot: true,
                            verb: 'be',
                        },
                        options
                    )
                    expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), true, options)
                })

                test('should failed so pass=true since it is inverted later', async () => {
                    vi.mocked(command).mockResolvedValue(true)
                    const result = await executeCommandBe.call(negatedContext, received, command, options)

                    expect(result.pass).toBe(true)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`element1\`) not to be displayed

Expected: "not displayed"
Received: "displayed"`)
                    expect(enhanceErrorBe).toHaveBeenCalledWith(
                        await received,
                        true,
                        {
                            expectation: 'displayed',
                            isNot: true,
                            verb: 'be',
                        },
                        options
                    )
                    expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), true, options)
                })
            })
        })

        describe('given multiple elements', () => {
            const elements = $$('elements')
            const selectorName = '$$(`elements`)'

            test('should pass given ChainableArray', async () => {
                const result = await executeCommandBe.call(context, elements, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: elements,
                    singleElementCompare: expect.any(Function),
                    isNot: false,
                    configuration: { allowEmptyElements: false }
                })
                expect(command).toHaveBeenCalledTimes(2)
                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), false, options)
            })

            test('should pass given ElementArray', async () => {
                const elementArray: WebdriverIO.ElementArray = await elements.getElements()

                const result = await executeCommandBe.call(context, elementArray, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: elementArray,
                    singleElementCompare: expect.any(Function),
                    isNot: false,
                    configuration: { allowEmptyElements: false }
                })
                expect(command).toHaveBeenCalledTimes(2)
            })

            test('should pass given Element[]', async () => {
                const elementArray: WebdriverIO.Element[] =  await (await elements.getElements()).filter(el => el.isDisplayed())

                const result = await executeCommandBe.call(context, elementArray, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: elementArray,
                    singleElementCompare: expect.any(Function),
                    isNot: false,
                    configuration: { allowEmptyElements: false }
                })
                expect(command).toHaveBeenCalledTimes(2)
            })

            test('should fail when first element fails', async () => {
                vi.mocked(command).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                const result = await executeCommandBe.call(context, elements, command, options)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be displayed

- Expected  - 1
+ Received  + 1

  Array [
-   "displayed",
+   "not displayed",
    "displayed",
  ]`)
            })

            test('should fail when last element fails', async () => {
                vi.mocked(command).mockResolvedValueOnce(true).mockResolvedValueOnce(false)

                const result = await executeCommandBe.call(context, elements, command, options)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be displayed

- Expected  - 1
+ Received  + 1

  Array [
    "displayed",
-   "displayed",
+   "not displayed",
  ]`)
            })

            test('should fail when all elements fail', async () => {
                vi.mocked(command).mockResolvedValue(false)

                const result = await executeCommandBe.call(context, elements, command, options)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be displayed

- Expected  - 2
+ Received  + 2

  Array [
-   "displayed",
-   "displayed",
+   "not displayed",
+   "not displayed",
  ]`)
            })

            describe('given isNot is true', () => {
                let negatedContext: { isNot: boolean; expectation: string; verb: string }

                beforeEach(() => {
                    // Success for `.not`
                    vi.mocked(command).mockResolvedValue(false)
                    negatedContext = {
                        expectation: 'displayed',
                        verb: 'be',
                        isNot: true
                    }
                })

                test('should succeed so pass=false since it is inverted later', async () => {
                    const result = await executeCommandBe.call(negatedContext, elements, command, options)

                    expect(result.pass).toBe(false)
                    expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                        unresolvedElements: elements,
                        singleElementCompare: expect.any(Function),
                        isNot: true,
                        configuration: { allowEmptyElements: false }
                    })
                    expect(command).toHaveBeenCalledTimes(2)
                    expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), true, options)
                })

                test('should fail (so pass=true since it is inverted later) when first element fails', async () => {
                    vi.mocked(command).mockResolvedValueOnce(true).mockResolvedValueOnce(false)

                    const result = await executeCommandBe.call(negatedContext, elements, command, options)

                    expect(result.pass).toBe(true)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be displayed

- Expected  - 1
+ Received  + 1

  Array [
-   "not displayed",
+   "displayed",
    "not displayed",
  ]`)
                })

                test('should fail (so pass=true since it is inverted later) when last element fails', async () => {
                    vi.mocked(command).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                    const result = await executeCommandBe.call(negatedContext, elements, command, options)

                    expect(result.pass).toBe(true)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be displayed

- Expected  - 1
+ Received  + 1

  Array [
    "not displayed",
-   "not displayed",
+   "displayed",
  ]`)
                })

                test('should fail (so pass=true since it is inverted later) when all elements fail', async () => {
                    vi.mocked(command).mockResolvedValue(true)

                    const result = await executeCommandBe.call(negatedContext, elements, command, options)

                    expect(result.pass).toBe(true)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be displayed

- Expected  - 2
+ Received  + 2

  Array [
-   "not displayed",
-   "not displayed",
+   "displayed",
+   "displayed",
  ]`)
                })
            })
        })
    })

    describe(isAsymmetricMatcher, () => {

        describe('StringContaining (Jasmine mimic)', () => {
            test('matches when substring is present', () => {
                const matcher = jasmine.stringContaining('foo')
                expect(matcher.asymmetricMatch('foobar')).toBe(true)
                expect(matcher.asymmetricMatch('barfoo')).toBe(true)
                expect(matcher.asymmetricMatch('barbaz')).toBe(false)
            })
            test('throws if expected is not a string', () => {
                // @ts-expect-error
                expect(() => jasmine.stringContaining(123)).toThrow('Expected is not a string')
            })
            test('jasmineToString and getExpectedType', () => {
                const matcher = jasmine.stringContaining('foo')
                expect(matcher.jasmineToString()).toBe('<jasmine.stringContaining("foo")>')
            })
        })

        test.for([
            expect.stringContaining('foo'),
            jasmine.stringContaining('foo')
        ])('should work with %s matcher', async (asymmetricMatcher) => {
            const isAsymmetric = isAsymmetricMatcher(asymmetricMatcher)

            expect(isAsymmetric).toBe(true)
        })
    })

    describe(isStringContainingMatcherLike, () => {
        test.for([
            expect.stringContaining('foo'),
            expect.not.stringContaining('foo'),
            jasmine.stringContaining('foo')
        ])('should work with %s matcher', async (asymmetricMatcher) => {
            const isStringContaining = isStringContainingMatcherLike(asymmetricMatcher)

            expect(isStringContaining).toBe(true)
        })
    })

    describe(isInversedStringContainingMatcher, () => {
        test.for([
            expect.stringContaining('foo'),
            jasmine.stringContaining('foo')
        ])('should work with %s matcher', async (asymmetricMatcher) => {
            const isStrictlyStringContaining = isInversedStringContainingMatcher(asymmetricMatcher)

            expect(isStrictlyStringContaining).toBe(false)
        })

        test('should work with %s matcher', async () => {
            const asymmetricMatcher = expect.not.stringContaining('foo')

            const isStrictlyStringContaining = isInversedStringContainingMatcher(asymmetricMatcher)

            expect(isStrictlyStringContaining).toBe(true)
        })
    })

    describe(getAsymmetricMatcherValue, () => {
        test.for([
            expect.stringContaining('foo'),
            expect.not.stringContaining('foo'),
            jasmine.stringContaining('foo')
        ])('should return expected value of matcher', (asymmetricMatcher) => {

            const value = getAsymmetricMatcherValue(asymmetricMatcher)

            expect(value).toBe('foo')
        })

        test('should work with jasmine object containing asymmetric matcher', () => {
            const asymmetricMatcher = jasmine.objectContaining({ foo: 'bar' })

            const value = getAsymmetricMatcherValue(asymmetricMatcher)

            expect(value).toEqual({ foo: 'bar' })
        })

        test('should work with jasmine string matching asymmetric matcher', () => {
            const asymmetricMatcher = jasmine.stringMatching(/foo/)

            const value = getAsymmetricMatcherValue(asymmetricMatcher)

            expect(value).toEqual(/foo/)
        })

        test('should return undefined when unknown matcher', () => {
            const value = getAsymmetricMatcherValue({} as any)
            expect(value).toBeUndefined()
        })

        test('should work with jasmine.anything asymmetric matcher', () => {
            const asymmetricMatcher = jasmine.anything()

            const value = getAsymmetricMatcherValue(asymmetricMatcher)

            expect(value).toBeUndefined()
        })

        test('should work with jasmine.any asymmetric matcher', () => {
            const asymmetricMatcher = jasmine.any(String)

            const value = getAsymmetricMatcherValue(asymmetricMatcher)

            expect(value).toEqual(expect.any(Function))
        })
    })
})
