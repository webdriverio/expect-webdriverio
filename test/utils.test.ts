import { describe, test, expect, beforeEach, vi } from 'vitest'
import { compareObject, compareText, compareTextWithArray, executeCommandBe, getAsymmetricMatcherValue, isAsymmetricMatcher, isInversedStringContainingMatcher, isStringContainingMatcherLike, waitUntil } from '../src/utils'
import { jasmine } from './__mocks__/jasmine'
import type { CommandOptions } from 'expect-webdriverio'
import { $, $$ } from '@wdio/globals'
import stripAnsi from 'strip-ansi'
import { executeCommandWithStrategy } from '../src/util/executeCommand'
import { enhanceErrorBe } from '../src/util/formatMessage'

vi.mock('@wdio/globals')

vi.mock('../src/util/executeCommand', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../src/util/executeCommand')>()
    return {
        ...actual,
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
vi.mock('../src/util/elementsUtil.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../src/util/elementsUtil.js')>()
    return {
        ...actual,
        awaitElementOrArray: vi.spyOn(actual, 'awaitElementOrArray'),
    }
})

describe('utils', () => {
    describe(compareText, () => {
        test('should pass when strings match', () => {
            expect(compareText('foo', 'foo', {}).success).toBe(true)
        })

        test('should fail when strings do not match', () => {
            expect(compareText('foo', 'bar', {}).success).toBe(false)
        })

        test('should pass when trims away white space', () => {
            expect(compareText(' foo ', 'foo', {}).success).toBe(true)
        })

        test('should fail without trimming away white space', () => {
            expect(compareText(' foo ', 'foo ', { trim: false }).success).toBe(false)
        })

        test('should pass if same word but wrong case and using ignoreCase', () => {
            expect(compareText(' FOO ', 'foo', { ignoreCase: true }).success).toBe(true)
            expect(compareText(' foo ', 'FOO', { ignoreCase: true }).success).toBe(true)
        })

        test('should pass if string contains expected and using containing', () => {
            expect(compareText('qwe_AsD_zxc', 'asd', { ignoreCase: true, containing: true }).success).toBe(true)
        })

        test('should support stringContaining asymmetric matchers', () => {
            expect(compareText('foo', expect.stringContaining('oo'), {}).success).toBe(true)
            expect(compareText('foo', expect.not.stringContaining('oo'), {}).success).toBe(false)
        })

        test('should support stringMatching asymmetric matchers', () => {
            expect(compareText('foo', expect.stringMatching(/.*oo.*/), {}).success).toBe(true)
            expect(compareText('foo', expect.not.stringMatching(/.*oo.*/), {}).success).toBe(false)
        })

        test('should support stringContaining asymmetric and using ignoreCase', () => {
            expect(compareText(' FOO ', expect.stringContaining('foo'), { ignoreCase: true }).success).toBe(true)
            expect(compareText(' FOO ', expect.not.stringContaining('foo'), { ignoreCase: true }).success).toBe(false)
            expect(compareText(' Foo ', expect.stringContaining('FOO'), { ignoreCase: true }).success).toBe(true)
            expect(compareText(' Foo ', expect.not.stringContaining('FOO'), { ignoreCase: true }).success).toBe(false)
            expect(compareText(' foo ', expect.stringContaining('foo'), { ignoreCase: true }).success).toBe(true)
        })

        test('should support jasmine.stringContaining matchers and using ignoreCase', () => {
            expect(compareText(' FOO ', jasmine.stringContaining('foo'), { ignoreCase: true }).success).toBe(true)
            expect(compareText(' Foo ', jasmine.stringContaining('FOO'), { ignoreCase: true }).success).toBe(true)
            expect(compareText(' foo ', jasmine.stringContaining('foo'), { ignoreCase: true }).success).toBe(true)
        })

        test('should support jasmine.stringMatching matchers', () => {
            expect(compareText(' FOO ', jasmine.stringMatching(/.*foo.*/i), {}).success).toBe(true)
        })

        test('should apply ignoreCase to a RegExp expected value', () => {
            // ignoreCase makes the pattern case-insensitive (via the `i` flag) instead of
            // lowercasing `actual` - otherwise a matching text would be reported as not matching
            expect(compareText('Hello', /Hello/, { ignoreCase: true }).success).toBe(true)
            expect(compareText('HELLO', /hello/, { ignoreCase: true }).success).toBe(true)
            expect(compareText('Hello', /^H/, { ignoreCase: true }).success).toBe(true)
            // a genuine mismatch must still fail
            expect(compareText('Hello', /Goodbye/, { ignoreCase: true }).success).toBe(false)
        })

        test('should preserve existing RegExp flags when applying ignoreCase', () => {
            expect(compareText('Hello\nWorld', /^world$/m, { ignoreCase: true }).success).toBe(true)
            // already case-insensitive patterns keep working
            expect(compareText('Hello', /hello/i, { ignoreCase: true }).success).toBe(true)
        })

        test('should not apply ignoreCase to a RegExp when the option is off', () => {
            expect(compareText('Hello', /Hello/, {}).success).toBe(true)
            expect(compareText('Hello', /hello/, {}).success).toBe(false)
        })

        test('should match a RegExp against the original-case actual value, not a lowercased copy', () => {
            // 'İ' (Turkish dotted capital I, U+0130) expands to two code points when lowercased
            // ('i' + combining dot above), which would corrupt a length-sensitive pattern if
            // `actual` were lowercased before matching. The RegExp's own `i` flag (applied by
            // ignoreCase) already provides the case-insensitivity, so `actual` must stay as-is.
            expect(compareText('İstanbul', /^.{8}$/i, { ignoreCase: true }).success).toBe(true)
        })

        test('should preserve a sticky RegExp lastIndex when applying ignoreCase', () => {
            const pattern = /world/y
            pattern.lastIndex = 6
            // requires the ignoreCase-cloned regex to retain lastIndex 6 (String.prototype.match
            // honors it for sticky patterns) and its own `i` flag to bridge the case difference
            expect(compareText('hello WORLD', pattern, { ignoreCase: true }).success).toBe(true)
        })

        test('should not mutate the caller\'s RegExp lastIndex when the pattern already has `i`', () => {
            // withIgnoreCaseFlag always clones, even when `i` is already set, so matching never
            // mutates a `lastIndex` the caller still holds a reference to
            const pattern = /world/giy
            pattern.lastIndex = 6
            compareText('hello world', pattern, { ignoreCase: true })
            expect(pattern.lastIndex).toBe(6)
        })

        test('should apply ignoreCase to a stringMatching matcher wrapping a RegExp', () => {
            // stringMatching(regex) was still lowercasing `actual` without adding `i` to the
            // regex, so ignoreCase had no effect on it
            expect(compareText('Hello', expect.stringMatching(/Hello/), { ignoreCase: true }).success).toBe(true)
            expect(compareText('Hello', jasmine.stringMatching(/Hello/), { ignoreCase: true }).success).toBe(true)
            expect(compareText('Hello', expect.stringMatching(/Goodbye/), { ignoreCase: true }).success).toBe(false)
        })

        test('should apply ignoreCase to a stringMatching matcher wrapping a string', () => {
            // expect.stringMatching(string) treats the string as regex source (both `expect` and
            // jasmine build a RegExp from it immediately), so this is exercising the same `i`-flag
            // path as a bare RegExp, not a plain case-insensitive string comparison
            expect(compareText('Hello', expect.stringMatching('HELLO'), { ignoreCase: true }).success).toBe(true)
        })

        test('should not corrupt regex escapes when a stringMatching-like matcher stores a raw string sample', () => {
            // stringMatching's sample is regex source, never literal text - `\D` means "non-digit".
            // A matcher that (per its type contract, JasmineStringMatchingAsymmetricMatcher<string
            // | RegExp>) stores the sample as a string rather than a pre-built RegExp must still be
            // treated as regex source: lowercasing it as literal text would turn it into `\d`
            // ("digit"), inverting the match entirely.
            const rawStringSampleMatcher = {
                constructor: { name: 'StringMatching' },
                sample: '\\D+',
            }
            expect(compareText('abc', rawStringSampleMatcher as any, { ignoreCase: true }).success).toBe(true)
            expect(compareText('123', rawStringSampleMatcher as any, { ignoreCase: true }).success).toBe(false)
        })

        test('should apply ignoreCase to an inverted (not.stringMatching) matcher', () => {
            expect(compareText('Hello', expect.not.stringMatching(/Hello/), { ignoreCase: true }).success).toBe(false)
            expect(compareText('Hello', expect.not.stringMatching(/Goodbye/), { ignoreCase: true }).success).toBe(true)
        })

        test('should support undefined/null expected value', () => {
            expect(compareText(' FOO ', undefined, {}).success).toBe(false)
            expect(compareText(' FOO ', null, {}).success).toBe(false)
        })
    })

    describe(compareTextWithArray, () => {
        test('should pass if strings match in array', () => {
            expect(compareTextWithArray('foo', ['foo', 'bar'], {}).success).toBe(true)
        })

        test('should fail if string does not match in array', () => {
            expect(compareTextWithArray('foo', ['foot', 'bar'], {}).success).toBe(false)
        })

        test('should pass if white space and using trim', () => {
            expect(compareTextWithArray(' foo ', ['foo', 'bar'], { trim: true }).success).toBe(true)
        })

        test('should pass if wrong case and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', ['foO', 'bar'], { trim: true, ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', ['foO', 'BAR'], { trim: true, ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', ['foOo', 'BAR'], { trim: true, ignoreCase: true }).success).toBe(false)
            expect(compareTextWithArray(' FOO ', ['foOO', 'bar'], { trim: true, ignoreCase: true }).success).toBe(false)
        })

        test('should apply ignoreCase to RegExp entries in the array', () => {
            expect(compareTextWithArray('Hello', [/Hello/], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray('HELLO', ['nope', /hello/], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray('Hello', [/Goodbye/], { ignoreCase: true }).success).toBe(false)
        })

        test('should match RegExp entries against the original-case actual value, not a lowercased copy', () => {
            // see the equivalent compareText test for why: lowercasing 'İ' expands it to two
            // code points, corrupting a length-sensitive pattern
            expect(compareTextWithArray('İstanbul', [/^.{8}$/i], { ignoreCase: true }).success).toBe(true)
        })

        test('should preserve a sticky RegExp lastIndex when applying ignoreCase', () => {
            const pattern = /world/y
            pattern.lastIndex = 6
            expect(compareTextWithArray('hello WORLD', [pattern], { ignoreCase: true }).success).toBe(true)
        })

        test('should apply ignoreCase to a stringMatching entry wrapping a RegExp', () => {
            expect(compareTextWithArray('Hello', [expect.stringMatching(/Hello/)], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray('HELLO', ['nope', expect.stringMatching(/hello/)], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray('Hello', [expect.stringMatching(/Goodbye/)], { ignoreCase: true }).success).toBe(false)
        })

        test('should pass if string contains and using containing', () => {
            expect(compareTextWithArray('qwe_AsD_zxc', ['foo', 'ZXC'], { ignoreCase: true, containing: true }).success).toBe(true)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxc'], { ignoreCase: true, containing: true }).success).toBe(true)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxcc'], { ignoreCase: true, containing: true }).success).toBe(false)
            expect(compareTextWithArray('qwe_AsD_ZXC', ['foo', 'zxcc'], { ignoreCase: true, containing: false }).success).toBe(false)
        })

        test('should support asymmetric matchers', () => {
            expect(compareTextWithArray('foo', [expect.stringContaining('oo'), expect.stringContaining('oobb')], {}).success).toBe(true)
            expect(compareTextWithArray('foo', [expect.stringContaining('oobb'), expect.stringContaining('oo')], {}).success).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oo'), expect.stringContaining('oobb')], {}).success).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('oobb'), expect.not.stringContaining('oo')], {}).success).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('oo'), expect.not.stringContaining('oobb')], {}).success).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oobb'), expect.not.stringContaining('oo')], {}).success).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oof'), expect.not.stringContaining('oobb')], {}).success).toBe(true)
            expect(compareTextWithArray('foo', [expect.not.stringContaining('oo'), expect.not.stringContaining('foo')], {}).success).toBe(false)
        })

        test('should support asymmetric matchers and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', [expect.stringContaining('foo'), expect.stringContaining('oobb')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' FOO ', [expect.not.stringContaining('foo'), expect.stringContaining('oobb')], { ignoreCase: true }).success).toBe(false)
            expect(compareTextWithArray(' foo ', [expect.stringContaining('FOO'), expect.stringContaining('oobb')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), expect.stringContaining('oobb')], { ignoreCase: true }).success).toBe(false)
            expect(compareTextWithArray(' foo ', [expect.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).success).toBe(false)
            expect(compareTextWithArray('foo', [expect.stringContaining('FOOO'), 'FOO'], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('OO'), expect.not.stringContaining('FOOO')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOOO'), expect.not.stringContaining('OO')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOOO'), expect.not.stringContaining('OOO')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [expect.not.stringContaining('FOO'), expect.not.stringContaining('OO')], { ignoreCase: true }).success).toBe(false)
        })

        test('should support jasmine asymmetric matchers', () => {
            expect(compareTextWithArray('foo', [jasmine.stringContaining('oobb'), jasmine.stringContaining('oo')], {}).success).toBe(true)
        })

        test('should support jasmine asymmetric matchers and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', [jasmine.stringContaining('foo'), jasmine.stringContaining('oobb')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [jasmine.stringContaining('FOO'), jasmine.stringContaining('oobb')], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray(' foo ', [jasmine.stringContaining('FOO'), 'oobb'], { ignoreCase: true }).success).toBe(true)
            expect(compareTextWithArray('foo', [jasmine.stringContaining('FOOO'), 'FOO'], { ignoreCase: true }).success).toBe(true)
        })
    })

    describe(compareObject, () => {
        test('should pass if the objects are equal', () => {
            expect(compareObject({ 'foo': 'bar' }, { 'foo': 'bar' }).success).toBe(true)
        })

        test('should pass if the objects are deep equal', () => {
            expect(compareObject({ 'foo': { 'bar': 'baz' } }, { 'foo': { 'bar': 'baz' } }).success).toBe(true)
        })

        test('should fail if the objects are not equal', () => {
            expect(compareObject({ 'foo': 'bar' }, { 'baz': 'quux' }).success).toBe(false)
        })

        test('should fail if the objects are only shallow equal', () => {
            expect(compareObject({ 'foo': { 'bar': 'baz' } }, { 'foo': { 'baz': 'quux' } }).success).toBe(false)
        })

        test('should fail if the actual value is a number or array', () => {
            expect(compareObject(10, { 'foo': 'bar' }).success).toBe(false)
            expect(compareObject([{ 'foo': 'bar' }], { 'foo': 'bar' }).success).toBe(false)
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
                    expectedValues: true,
                    singleElementCompare: expect.any(Function),
                    context: { isNot: false, iteration: 0 },
                    strictConfiguration: { allowEmptyElements: false }
                })
                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), false, options)
            })

            test('should pass given WebdriverIO.Element', async () => {
                const result = await executeCommandBe.call(context, received, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: received,
                    expectedValues: true,
                    singleElementCompare: expect.any(Function),
                    context: { isNot: false, iteration: 0 },
                    strictConfiguration: { allowEmptyElements: false }
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
                    expect.objectContaining({ isNot: false, isSome: false }),
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
                            isSome: false,
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
                            isSome: false,
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
                    expectedValues: true,
                    singleElementCompare: expect.any(Function),
                    context: { isNot: false, iteration: 0 },
                    strictConfiguration: { allowEmptyElements: false }
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
                    expectedValues: true,
                    singleElementCompare: expect.any(Function),
                    context: { isNot: false, iteration: 0 },
                    strictConfiguration: { allowEmptyElements: false }
                })
                expect(command).toHaveBeenCalledTimes(2)
            })

            test('should pass given Element[]', async () => {
                const elementArray: WebdriverIO.Element[] =  await (await elements.getElements()).filter(el => el.isDisplayed())

                const result = await executeCommandBe.call(context, elementArray, command, options)

                expect(result.pass).toBe(true)
                expect(executeCommandWithStrategy).toHaveBeenCalledWith({
                    unresolvedElements: elementArray,
                    expectedValues: true,
                    singleElementCompare: expect.any(Function),
                    context: { isNot: false, iteration: 0 },
                    strictConfiguration: { allowEmptyElements: false }
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
                        expectedValues: true,
                        singleElementCompare: expect.any(Function),
                        context: { isNot: true, iteration: 0 },
                        strictConfiguration: { allowEmptyElements: false }
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
