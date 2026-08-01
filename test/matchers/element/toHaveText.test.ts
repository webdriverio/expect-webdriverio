import { $, $$ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toHaveText } from '../../../src/matchers/element/toHaveText.js'
import type { ChainablePromiseArray } from 'webdriverio'
import { $Factory, chainableElementArrayFactory, elementArrayFactory, elementFactory, notFoundElementFactory } from '../../__mocks__/@wdio/globals.js'
import { waitUntil } from '../../../src/utils.js'
import stripAnsi from 'strip-ansi'
import { setFeatureFlags, some } from '../../../src/index.js'
import { expect as wdioExpect } from '../../../src/index.js'

vi.mock('@wdio/globals')

describe(toHaveText, async () => {
    let thisContext: { toHaveText: typeof toHaveText; isNot?: boolean }
    let thisNotContext: { toHaveText: typeof toHaveText; isNot: true }

    beforeEach(() => {
        thisContext = { toHaveText }
        thisNotContext = { toHaveText, isNot: true }
    })

    describe.for([
        { element: await $('sel'), title: 'awaited ChainablePromiseElement' },
        { element: await $('sel').getElement(), title: 'awaited getElement of ChainablePromiseElement (e.g. WebdriverIO.Element)' },
        { element: $('sel'), title: 'non-awaited of ChainablePromiseElement' }
    ])('given a single element when $title', ({ element }) => {
        let el: ChainablePromiseElement | WebdriverIO.Element

        const selectorName = '$(`sel`)'

        beforeEach(async () => {
            el = element
            vi.mocked(el.getText).mockResolvedValue('WebdriverIO')
        })

        test('wait for success', async () => {
            vi.mocked(el.getText).mockResolvedValueOnce('').mockResolvedValueOnce('').mockResolvedValueOnce('webdriverio')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(3)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveText',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveText',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(el.getText).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, wait: 0 }))
                .rejects.toThrow('some error')
        })

        test('success and trim actual text by default', async () => {
            vi.mocked(el.getText).mockResolvedValue(' WebdriverIO ')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0, interval: undefined })
            expect(result.pass).toBe(true)
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveText(el, 'WebdriverIO', { ignoreCase: true, wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            vi.mocked(el.getText).mockResolvedValue('Not WebdriverIO')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`
            )
        })

        test('not, with no trim - failure - pass should be true', async () => {
            vi.mocked(el.getText).mockResolvedValue(' WebdriverIO ')

            const result = await thisNotContext.toHaveText(el, ' WebdriverIO ', { trim: false, wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: " WebdriverIO "
Received      : " WebdriverIO "`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveText(el, 'not WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('should return true if texts strictly match without trimming', async () => {
            const result = await thisContext.toHaveText(el, 'WebdriverIO', { trim: false, wait: 0 })

            expect(result.pass).toBe(true)
        })

        test("should return false if texts don't match when trimming is disabled", async () => {
            const result = await thisContext.toHaveText(el, 'foobar', { trim: false, wait: 0 })
            expect(result.pass).toBe(false)
        })

        test('should return true if actual text + single replacer matches the expected text', async () => {
            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { wait: 0, replace: ['Web', 'Browser'] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + replace (string) matches the expected text', async () => {
            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { wait: 0, replace: [['Web', 'Browser']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text + replace (regex) matches the expected text', async () => {
            const result = await thisContext.toHaveText(el, 'BrowserdriverIO', { wait: 0, replace: [[/Web/, 'Browser']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text starts with expected text', async () => {
            const result = await thisContext.toHaveText(el, 'Web', { wait: 0, atStart: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text ends with expected text', async () => {
            const result = await thisContext.toHaveText(el, 'IO', { wait: 0, atEnd: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual text contains the expected text at the given index', async () => {
            const result = await thisContext.toHaveText(el, 'iverIO', { wait: 0, atIndex: 5 })

            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(el.getText).mockResolvedValue('')

            const result = await thisContext.toHaveText(el, 'WebdriverIO', { wait: 0 })

            expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: "WebdriverIO"
Received: ""`
            )
        })

        test('success if one of the values in the array matches with text and ignoreCase', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'Webdriverio'], { wait: 0, ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values of oneOf does match with text', async () => {
            const result = await thisContext.toHaveText(el, wdioExpect.oneOf('WDIO', 'WebdriverIO'))

            expect(result.pass).toBe(true)
        })

        test('success if one of the values of oneOf does match with text and ignore case', async () => {
            const result = await thisContext.toHaveText(el, wdioExpect.oneOf('WDIO', 'Webdriverio'), { ignoreCase: true })

            expect(result.pass).toBe(true)
        })

        test('failures if all the values of oneOf does not match with text', async () => {
            const result = await thisContext.toHaveText(el, wdioExpect.oneOf('WDIO', 'notMatching'),  { ignoreCase: true, trim: true, atStart: true, atEnd: true, atIndex: 1, wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have text

Expected: startingWithOneOf<"WDIO", "notMatching">
Received: "WebdriverIO"`
            )
        })

        test('not - failures if all the values of oneOf does not match with text', async () => {
            const result = await thisNotContext.toHaveText(el, wdioExpect.oneOf('WDIO', 'WebdriverIO'),  { ignoreCase: true, trim: true, atStart: true, atEnd: true, atIndex: 1, wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have text

Expected [not]: startingWithOneOf<"WDIO", "WebdriverIO">
Received      : "WebdriverIO"`
            )
        })

        test('success if one of the values in the array matches with text and trim - deprecated (TODO)', async () => {

            vi.mocked(el.getText).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveText(el, ['WDIO', 'WebdriverIO', 'toto'], { wait: 0, trim: true })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and replace (string)', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [['Web', 'Browser']] })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and replace (regex)', async () => {

            const result = await thisContext.toHaveText(el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [[/Web/g, 'Browser']] })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('success if one of the values in the array matches with text and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'browserdriverio', 'toto'], {
                replace: [
                    [/Web/g, 'Browser'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
            })

            expect(result.pass).toBe(true)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('failure if one of the values in the array does not match with text', async () => {
            const result = await thisContext.toHaveText(el, ['WDIO', 'Webdriverio'], { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getText).toHaveBeenCalledTimes(1)
        })

        test('should return true if actual text contains the expected text', async () => {
            const result = await thisContext.toHaveText(el, expect.stringContaining('iverIO'), {})

            expect(result.pass).toBe(true)
        })

        test('should return false if actual text does not contain the expected text', async () => {
            const result = await thisContext.toHaveText(el, expect.stringContaining('WDIO'), { wait: 0 })

            expect(result.pass).toBe(false)
        })

        test('should return true if actual text contains one of the expected texts', async () => {
            const result = await thisContext.toHaveText(el, [expect.stringContaining('iverIO'), expect.stringContaining('WDIO')], {})

            expect(result.pass).toBe(true)
        })

        test('should return false if actual text does not contain the expected texts', async () => {
            const result = await thisContext.toHaveText(el, [expect.stringContaining('EXAMPLE'), expect.stringContaining('WDIO')], { wait: 0 })

            expect(result.pass).toBe(false)
        })

        describe('with RegExp', () => {
            beforeEach(async () => {
                vi.mocked(el.getText).mockResolvedValue('This is example text')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveText(el, /ExAmplE/i)

                expect(result.pass).toBe(true)
            })

            test('success if one of the values in the array matches with RegExp', async () => {
                const result = await thisContext.toHaveText(el, ['WDIO', /ExAmPlE/i])

                expect(result.pass).toBe(true)
            })

            test('success if one of the values in the array matches with text', async () => {
                const result = await thisContext.toHaveText(el, ['This is example text', /Webdriver/i])

                expect(result.pass).toBe(true)
            })

            test('success if one of the values in the array matches with text and ignoreCase', async () => {
                const result = await thisContext.toHaveText(el, ['ThIs Is ExAmPlE tExT', /Webdriver/i], {
                    ignoreCase: true,
                })

                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveText(el, /Webdriver/i, { wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: /Webdriver/i
Received: "This is example text"`
                )
            })

            test('failure if one of the values in the array does not match with text', async () => {
                const result = await thisContext.toHaveText(el, ['WDIO', /Webdriver/i], { wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: ["WDIO", /Webdriver/i]
Received: "This is example text"`
                )
            })
        })
    })

    describe('Legacy multiple elements compare behavior', async () => {
        describe('given multiple elements', () => {
            let els: ChainablePromiseArray
            const selectorName = '$$(`sel`)'

            beforeEach(async () => {
                els = await $$('sel')
            })

            describe('given single expected values', () => {
                beforeEach(async () => {
                    const awaitedEls = await els
                    expect(awaitedEls.length).toBe(2)

                    awaitedEls.forEach(el => vi.mocked(el.getText).mockResolvedValue('WebdriverIO'))
                })

                test('should return true if the received element array matches the expected text array', async () => {
                    const result = await thisContext.toHaveText(els, 'WebdriverIO', { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                    const result = await thisContext.toHaveText(els, 'webdriverio', { ignoreCase: true, wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return true if actual texts contains space since we trim by default', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' WebdriverIO ')

                    const result = await thisContext.toHaveText( els, 'WebdriverIO', { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return false if the received element array does not match the expected text array', async () => {
                    const result = await thisContext.toHaveText(els, 'webdriverio', { wait: 0 })

                    expect(result.pass).toBe(false)
                })

                test('should return false and show custom failure message correctly', async () => {
                    const result = await thisContext.toHaveText(els, 'webdriverio', { message: 'Test', wait: 0 })

                    // selectorName is buggy, to be fixed later with $$ support
                    // Expected vs received is wierd, to be fixed later with $$ support
                    expect(stripAnsi(result.message())).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
+   "WebdriverIO",
+   "WebdriverIO",
  ]`
                    )
                })

                test('should return false and show a correct custom failure message', async () => {
                    const result = await thisContext.toHaveText( els, 'webdriverio', { message: 'Test', wait: 0 })

                    expect(stripAnsi(result.message())).toMatch(/Test\nExpect .* to have text/)
                })

                describe('when using .not', () => {
                    test('should succeed (pass=false) if none of the received elements match the expected text', async () => {
                        const result = await thisNotContext.toHaveText(els, 'NotHaveThisText')

                        expect(result.pass).toBe(false)
                    })

                    test('should fails (pass=true) if all the received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, 'WebdriverIO')

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "WebdriverIO"]
Received      : ["WebdriverIO", "WebdriverIO"]`
                        )

                    })

                    test('should fails (pass=true) if the first received element in the array matches the expected text array', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, 'WebdriverIO1')

                        expect(result.pass).toBe(false) // Incorrect, should be true since the first element matches the expected text, but the second does not. This test needs clarification on expected behavior.
                    })

                    test('should fails (pass=true) if the second received element in the array matches the expected text array', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, 'WebdriverIO2')

                        expect(result.pass).toBe(false) // Incorrect, should be true since the second element matches the expected text, but the first does not. This test needs clarification on expected behavior.
                    })

                    test('should fails (pass=true) if all elements match the expected Regex', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, /WebdriverIO.*/i)

                        expect(result.pass).toBe(true)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: [/WebdriverIO.*/i, /WebdriverIO.*/i]
Received      : ["WebdriverIO1", "WebdriverIO2"]`
                        )
                    })

                    test('should succeed (pass=false) if none elements match the expected Regex', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, /NotMatching.*/i)

                        expect(result.pass).toBe(false)
                    })

                    test('should succeed (pass=false) if one elements match the expected Regex', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, /WebdriverIO2.*/i)

                        expect(result.pass).toBe(false) // Incorrect, should be true since the second element matches the expected Regex, but the first does not. This test needs clarification on expected behavior.
                    })
                })
            })

            describe('given multiples expected values', () => {
                beforeEach(async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue('Get Started')
                })

                test('should return true if the received elements', async () => {
                    const result = await thisContext.toHaveText(els, ['WebdriverIO', 'Get Started'], { wait: 0 })
                    expect(result.pass).toBe(true)
                })

                test('should not support oneOf in array under legacy behavior', async () => {
                    await expect(
                        // @ts-expect-error
                        thisContext.toHaveText(els, [wdioExpect.oneOf('WebdriverIO', 'Get Started'), wdioExpect.oneOf('WebdriverIO', 'Get Started')], { wait: 0 })
                    ).rejects.toThrow('OneOf is not supported in array under legacy behavior. Please enable `useToHaveTextStrictMultiElementsCompareStrategy` feature flag to use the new strict index based matching strategy with `expect.oneOf()`.')
                })

                test('should return true if actual texts contains space since we trim by default', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                    const result = await thisContext.toHaveText( els, ['WebdriverIO', 'Get Started'], { wait: 0 })

                    // For single element we trim by default but not for multiple elements, sounds like a bug - Legacy behavior!
                    expect(result.pass).toBe(false)
                })

                test('should return true if actual texts contains space since with explicit trim', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                    const result = await thisContext.toHaveText( els, ['WebdriverIO', 'Get Started'], { trim: true })

                    expect(result.pass).toBe(true)
                })

                test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                    const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { ignoreCase: true, wait: 0 })
                    expect(result.pass).toBe(true)
                })

                test('should return false if the received element array does not match the expected text array', async () => {
                    const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { wait: 0 })

                    expect(result.pass).toBe(false)
                })

                test('should return false if the second received element array does not match the second expected text in the array', async () => {
                    const result = await thisContext.toHaveText(els, ['WebdriverIO', 'get started'], { wait: 0 })

                    expect(result.pass).toBe(false)
                    // Buggy error message to fix later with $$ support
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 1

  Array [
    "WebdriverIO",
-   "get started",
+   "Get Started",
  ]`
                    )
                })

                test('should return false and display proper custom error message', async () => {
                    const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { message: 'Test', wait: 0 })

                    expect(result.pass).toBe(false)
                    // Buggy error message to fix later with $$ support
                    expect(stripAnsi(result.message())).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "get started",
+   "WebdriverIO",
+   "Get Started",
  ]`
                    )
                })

                test('should return false and show a correct custom failure message', async () => {
                    const result = await thisContext.toHaveText( els, 'webdriverio', { message: 'Test', wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toMatch(/Test\nExpect .* to have text/)
                })

                test('should not support some modifiers', async () => {
                    await expect(thisContext.toHaveText(some(els), 'webdriverio', { wait: 0 })).rejects.toThrow('some(elements) works only when enabling `useToHaveTextStrictMultiElementsCompareStrategy`')
                })

                describe('when using .not', () => {
                    test('should succeed (pass=false) if none of the received elements match the expected text', async () => {
                        const result = await thisNotContext.toHaveText(els, ['NotHaveThisText1', 'NotHaveThisText2'])

                        expect(result.pass).toBe(false)
                    })

                    test('should fails (pass=true) if all the received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, ['WebdriverIO', 'Get Started'])

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "Get Started"]
Received      : ["WebdriverIO", "Get Started"]`
                        )

                    })

                    test('should fails (pass=true) if all the received element in the array matches the expected text array even out of order', async () => {
                        const result = await thisNotContext.toHaveText(els, ['Get Started', 'WebdriverIO'])

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["Get Started", "WebdriverIO"]
Received      : ["WebdriverIO", "Get Started"]`
                        )
                    })

                    test('should fails (pass=true) if the first received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, ['WebdriverIO', 'NotMatchingText'])

                        expect(result.pass).toBe(false) // Incorrect, should be true since the first element matches the expected text, but the second does not. This test needs clarification on expected behavior.
                    })

                    test('should fails (pass=true) if the second received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, ['NotMatchingText', 'WebdriverIO'])

                        expect(result.pass).toBe(false) // Incorrect, should be true since the second element matches the expected text, but the first does not. This test needs clarification on expected behavior.
                    })

                    test('should fails (pass=true) if all elements match the expected Regex', async () => {
                        const result = await thisNotContext.toHaveText(els, [/WebdriverI.*/i, /Get Starte.*/i])

                        expect(result.pass).toBe(true)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: [/WebdriverI.*/i, /Get Starte.*/i]
Received      : ["WebdriverIO", "Get Started"]`
                        )
                    })

                    test('should succeed (pass=false) if none elements match the expected Regex', async () => {
                        const result = await thisNotContext.toHaveText(els, [/NotMatching.*/i, /NotMatching2.*/i])

                        expect(result.pass).toBe(false)
                    })

                    test('should succeed (pass=false) if one elements match the expected Regex', async () => {
                        const result = await thisNotContext.toHaveText(els, [/NotMatching.*/i, /WebdriverIO.*/i])

                        expect(result.pass).toBe(false) // Incorrect, should be true since the second element matches the expected Regex, but the first does not. This test needs clarification on expected behavior.
                    })
                })
            })
        })

        describe('Edge cases', () => {

            test('given exact text but with space in it should work by default', async () => {
                const element = $('sel')

                const result = await thisContext.toHaveText(element, ' Valid Text ')

                expect(result.pass).toBe(false) // to review in major version to be true
            })

            test.each([
                { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
            ])('should fail with proper error message when actual is an empty of $name', async ({ elements, selectorName }) => {
                const result = await thisContext.toHaveText(elements, 'webdriverio')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: ["webdriverio"]
Received: undefined`)
            })

            test.each([
                { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
            ])('not - should succeed when actual is an empty of $name - legacy behavior to deprecate!', async ({ elements }) => {
                const result = await thisNotContext.toHaveText(elements, 'webdriverio')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('given element is not found then it throws error when an element does not exists', async () => {
                const element: WebdriverIO.Element = notFoundElementFactory('sel')

                await expect(thisContext.toHaveText(element, 'webdriverio')).rejects.toThrow("Can't call getText on element with selector sel because element wasn't found")
            })

            test('given element from out of bound ChainableArray, then it throws error when an element does not exists', async () => {
                const element: ChainablePromiseElement = $$('elements')[3]

                await expect(thisContext.toHaveText(element, 'webdriverio')).rejects.toThrow('Index out of bounds! $$(elements) returned only 2 elements.')
            })

            test.each([
                { actual: undefined, selectorName: 'undefined' },
                { actual: null, selectorName: 'null' },
                { actual: true, selectorName: 'true' },
                { actual: 5, selectorName: '5' },
                { actual: 'test', selectorName: 'test' },
                { actual: Promise.resolve(true), selectorName: 'true' },
                { actual: {}, selectorName: '{}' },
                { actual: ['1', '2'], selectorName: '["1","2"]' },
            ])('should have pass false with proper error message when actual is unsupported type of $actual', async ({ actual, selectorName }) => {
                const result = await thisContext.toHaveText(actual as any, 'webdriverio')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: "webdriverio"
Received: undefined`)
            })

            test('given only one element in array when failures', async () => {
                const elements = chainableElementArrayFactory('elements', 1)
                vi.mocked((elements)[0].getText).mockResolvedValue('webdriverio')

                const results = await thisContext.toHaveText(elements, 'NotMatchingText')

                expect(results.pass).toBe(false)
                expect(stripAnsi(results.message())).toEqual(`\
Expect $$(\`elements\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "NotMatchingText",
+   "webdriverio",
  ]`
                )
            })

            test('given the first element getText fails to retrieve', async () => {
                const elements = $$('elements')

                vi.mocked((elements)[0].getText).mockRejectedValue(new Error('Unable to retrieve text for first element'))
                vi.mocked((elements)[1].getText).mockResolvedValue('webdriverio')

                await expect(thisContext.toHaveText(elements, 'webdriverio')).rejects.toThrow('Unable to retrieve text for first element')
            })

            test('given the second element getText fails to retrieve', async () => {
                const elements = $$('elements')

                vi.mocked((elements)[0].getText).mockResolvedValue('webdriverio')
                vi.mocked((elements)[1].getText).mockRejectedValue(new Error('Unable to retrieve text for second element'))

                await expect(thisContext.toHaveText(elements, 'webdriverio')).rejects.toThrow('Unable to retrieve text for second element')
            })

            test('given all elements getText fails to retrieve', async () => {
                const elements = $$('elements')

                vi.mocked((elements)[0].getText).mockRejectedValue(new Error('Unable to retrieve text for first element'))
                vi.mocked((elements)[1].getText).mockRejectedValue(new Error('Unable to retrieve text for second element'))

                await expect(thisContext.toHaveText(elements, 'webdriverio')).rejects.toThrow('Unable to retrieve text for first element')
            })

            test('given an arrays of array of expected values', async () => {
                const elements = $$('elements')

                elements.forEach(el => vi.mocked(el.getText).mockResolvedValue('webdriverio'))

                // @ts-expect-error -- array of array of expected values is not supported, but we want to test that it fails gracefully
                const results = await thisContext.toHaveText(elements, [['webdriverIO'], ['webdriverIO']])
                expect(results.pass).toBe(false)
                expect(stripAnsi(results.message())).toEqual(`\
Expect $$(\`elements\`) to have text

- Expected  - 6
+ Received  + 2

  Array [
-   Array [
-     "webdriverIO",
-   ],
-   Array [
-     "webdriverIO",
-   ],
+   " Valid Text ",
+   " Valid Text ",
  ]`)
            })

            describe('Long promises', () => {

                describe("given element's text takes more time then the configured wait to be retrieved", () => {

                    test('given element text takes more time then the configured wait then it should fail', async () => {
                        const element: ChainablePromiseElement = $('elements')
                        vi.mocked((await element).getText).mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve('0'), 500)))
                            .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve('1'), 500)))

                        const result = await thisContext.toHaveText(element, '1', { wait: 1, interval: 1 })

                        expect(result.pass).toBe(false)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`elements\`) to have text

Expected: "1"
Received: "0"`)
                    })
                })

                describe('given element itself takes more time then the configured wait to be retrieved', () => {

                    test('given element take time to be found, and first getText match then it should work', async () => {
                        const element: ChainablePromiseElement = $Factory(elementFactory('slowElement'), 500)

                        const result = await thisContext.toHaveText(element, 'Valid Text', { wait: 250, interval: 100 })

                        expect(result.pass).toBe(true)
                    })

                    test('given element take time to be found, and match only on second getText try then it should fails when using non-awaited version', async () => {
                        const element = elementFactory('slowElement')
                        element.getText = vi.fn()
                            .mockResolvedValueOnce('Invalid Text')
                            .mockResolvedValueOnce('Valid Text')

                        const nonAwaitedElement: ChainablePromiseElement = $Factory(element, 500)

                        const result = await thisContext.toHaveText(nonAwaitedElement, 'Valid Text', { wait: 250, interval: 100 })

                        expect(result.pass).toBe(false)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`slowElement\`) to have text

Expected: "Valid Text"
Received: "Invalid Text"`)
                    })

                    test('given element take time to be found, but match only on second try then it should succeeds when using awaited version', async () => {
                        const element = elementFactory('slowElement')
                        element.getText = vi.fn()
                            .mockResolvedValueOnce('Invalid Text')
                            .mockResolvedValueOnce('Valid Text')

                        const awaitedElement: ChainablePromiseElement = await $Factory(element, 500)

                        const result = await thisContext.toHaveText(awaitedElement, 'Valid Text', { wait: 250, interval: 100 })

                        expect(result.pass).toBe(true)
                    })
                })
            })
        })
    })

    describe('New Strict multiple elements compare behavior', async () => {
        beforeEach(async () => {
            setFeatureFlags({ useToHaveTextStrictMultiElementsCompareStrategy: true })
        })

        describe.for([
            { elements: await $$('sel'), title: 'awaited ChainablePromiseArray' },
            { elements: await $$('sel').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },
            { elements: await $$('sel').filter((t) => t.isEnabled()), title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },
            { elements: $$('sel'), title: 'non-awaited of ChainablePromiseArray' },
            { elements: $$('sel').getElements(), title: 'non-awaited getElements of ChainablePromiseArray' },
            { elements: $$('sel').filter((t) => t.isEnabled()), title: 'non-awaited filtered ChainablePromiseArray (e.g. Promise<WebdriverIO.Element[]>)' },
        ])('given multiple elements when $title', ({ elements, title }) => {
            let els: ChainablePromiseArray | WebdriverIO.ElementArray | WebdriverIO.Element[] | Promise<WebdriverIO.Element[]> | Promise<WebdriverIO.ElementArray>

            const selectorName = title.includes('WebdriverIO.Element[]') ? '[$(`sel`),$(`dev`)]': '$$(`sel`)'

            beforeEach(async () => {
                els = elements as ChainablePromiseArray | WebdriverIO.ElementArray | WebdriverIO.Element[] | Promise<WebdriverIO.Element[]> | Promise<WebdriverIO.ElementArray>

                const awaitedEls = await els
                awaitedEls[0] = await $('sel')
                awaitedEls[1] = await $('dev')
            })

            describe('given single expected values', () => {
                beforeEach(async () => {
                    const awaitedEls = await els
                    expect(awaitedEls.length).toBe(2)

                    awaitedEls.forEach(el => vi.mocked(el.getText).mockResolvedValue('WebdriverIO'))
                })

                test('should return true if the received element array matches the expected text array', async () => {
                    const result = await thisContext.toHaveText(els, 'WebdriverIO', { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                    const result = await thisContext.toHaveText(els, 'webdriverio', { ignoreCase: true, wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return true if actual texts contains space since we trim by default', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' WebdriverIO ')

                    const result = await thisContext.toHaveText( els, 'WebdriverIO', { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return false if the received element array does not match the expected text array', async () => {
                    const result = await thisContext.toHaveText(els, 'webdriverio', { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
+   "WebdriverIO",
+   "WebdriverIO",
  ]`
                    )
                })

                test('should return false and show custom failure message correctly', async () => {
                    const result = await thisContext.toHaveText(els, 'webdriverio', { message: 'Test', wait: 0 })

                    expect(stripAnsi(result.message())).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
+   "WebdriverIO",
+   "WebdriverIO",
  ]`
                    )
                })

                test('should return false and show a correct custom failure message', async () => {
                    const result = await thisContext.toHaveText( els, 'webdriverio', { message: 'Test', wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
+   "WebdriverIO",
+   "WebdriverIO",
  ]`
                    )
                })

                describe('when using .not', () => {
                    test('should succeed (pass=false) if none of the received elements match the expected text', async () => {
                        const result = await thisNotContext.toHaveText(els, 'NotHaveThisText')

                        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                    })

                    test('should fails (pass=true) if all the received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, 'WebdriverIO')

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "WebdriverIO"]
Received      : ["WebdriverIO", "WebdriverIO"]`
                        )

                    })

                    test('should fails (pass=true) if the first received element in the array matches the expected text array', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, 'WebdriverIO1')

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO1", "WebdriverIO1"]
Received      : ["WebdriverIO1", "WebdriverIO2"]`
                        )
                    })

                    test('should fails (pass=true) if the second received element in the array matches the expected text array', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, 'WebdriverIO2')

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO2", "WebdriverIO2"]
Received      : ["WebdriverIO1", "WebdriverIO2"]`
                        )
                    })

                    test('should fails (pass=true) if all elements match the expected Regex', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, /WebdriverIO.*/i)

                        expect(result.pass).toBe(true)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: [/WebdriverIO.*/i, /WebdriverIO.*/i]
Received      : ["WebdriverIO1", "WebdriverIO2"]`
                        )
                    })

                    test('should succeed (pass=false) if none elements match the expected Regex', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, /NotMatching.*/i)

                        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                    })

                    test('should fails (pass=true) if one elements match the expected Regex', async () => {
                        const awaitedEls = await els
                        vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO1')
                        vi.mocked(awaitedEls[1].getText).mockResolvedValue('WebdriverIO2')

                        const result = await thisNotContext.toHaveText(els, /WebdriverIO2.*/i)

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: [/WebdriverIO2.*/i, /WebdriverIO2.*/i]
Received      : ["WebdriverIO1", "WebdriverIO2"]`
                        )
                    })
                })
            })

            describe('given multiples expected values', () => {
                beforeEach(async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue('WebdriverIO')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue('Get Started')
                })

                test('should return true if the received elements', async () => {
                    const result = await thisContext.toHaveText(els, ['WebdriverIO', 'Get Started'], { wait: 0 })
                    expect(result.pass).toBe(true)
                })

                test('should return true if actual texts contains space since we trim by default', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                    const result = await thisContext.toHaveText( els, ['WebdriverIO', 'Get Started'], { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('should return true if actual texts contains space when expected is an array of string per element since we trim by default', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                    // @ts-expect-error -- array of array is not supported yet!
                    const result = await thisContext.toHaveText( els, [['WebdriverIO'], ['Get Started']])

                    expect(result.pass).toBe(false)
                })

                test('should return true if actual texts contains space since with explicit trim', async () => {
                    const awaitedEls = await els
                    vi.mocked(awaitedEls[0].getText).mockResolvedValue(' WebdriverIO ')
                    vi.mocked(awaitedEls[1].getText).mockResolvedValue(' Get Started ')

                    const result = await thisContext.toHaveText( els, ['WebdriverIO', 'Get Started'], { trim: true })

                    expect(result.pass).toBe(true)
                })

                test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
                    const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { ignoreCase: true, wait: 0 })
                    expect(result.pass).toBe(true)
                })

                test('should return false if the received element array does not match the expected text array', async () => {
                    const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { wait: 0 })

                    expect(result.pass).toBe(false)
                })

                test('should return false if the second received element array does not match the second expected text in the array', async () => {
                    const result = await thisContext.toHaveText(els, ['WebdriverIO', 'get started'], { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

- Expected  - 1
+ Received  + 1

  Array [
    "WebdriverIO",
-   "get started",
+   "Get Started",
  ]`
                    )
                })

                test('should return false and display proper custom error message', async () => {
                    const result = await thisContext.toHaveText(els, ['webdriverio', 'get started'], { message: 'Test', wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Test
Expect ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "get started",
+   "WebdriverIO",
+   "Get Started",
  ]`
                    )
                })

                test('should return false and show a correct custom failure message', async () => {
                    const result = await thisContext.toHaveText( els, 'webdriverio', { message: 'Test', wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toMatch(/Test\nExpect .* to have text/)
                })

                describe('when using .not modifier', () => {
                    test('should succeed (pass=false) if none of the received elements match the expected text', async () => {
                        const result = await thisNotContext.toHaveText(els, ['NotHaveThisText1', 'NotHaveThisText2'])

                        expect(result.pass).toBe(false)
                    })

                    test('should fails (pass=true) if all the received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, ['WebdriverIO', 'Get Started'])

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "Get Started"]
Received      : ["WebdriverIO", "Get Started"]`
                        )

                    })

                    test('should succeed (pass=true) if all the received element in the array could match the expected text array but is in the wrong order', async () => {
                        const result = await thisNotContext.toHaveText(els, ['Get Started', 'WebdriverIO'])

                        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                    })

                    test('should fails (pass=true) if the first received element in the array matches the expected text array', async () => {
                        const result = await thisNotContext.toHaveText(els, ['WebdriverIO', 'NotMatchingText'])

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["WebdriverIO", "NotMatchingText"]
Received      : ["WebdriverIO", "Get Started"]`
                        )
                    })

                    test('should succeed (pass=false) if only the first element in the array matches the expected second text array (index & order matter)', async () => {
                        const result = await thisNotContext.toHaveText(els, ['NotMatchingText', 'WebdriverIO'])

                        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                    })

                    test('should fails (pass=true) if all elements match the expected Regex', async () => {
                        const result = await thisNotContext.toHaveText(els, [/WebdriverI.*/i, /Get Starte.*/i])

                        expect(result.pass).toBe(true)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: [/WebdriverI.*/i, /Get Starte.*/i]
Received      : ["WebdriverIO", "Get Started"]`
                        )
                    })

                    test('should succeed (pass=false) if none elements match the expected Regex', async () => {
                        const result = await thisNotContext.toHaveText(els, [/NotMatching.*/i, /NotMatching2.*/i])

                        expect(result.pass).toBe(false)
                    })

                    test('should succeed (pass=false) if one elements match the expected Regex', async () => {
                        const result = await thisNotContext.toHaveText(els, [/NotMatching.*/i, /Get Starte.*/i])

                        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: [/NotMatching.*/i, /Get Starte.*/i]
Received      : ["WebdriverIO", "Get Started"]`
                        )
                    })
                })

                describe('when using some() modifier', () => {
                    test('should succeed when using some() modifier and only one element matches', async () => {
                        vi.mocked((await els)[0].getText).mockResolvedValue('Does not match')
                        vi.mocked((await els)[1].getText).mockResolvedValue('webdriverio')

                        const result = await thisContext.toHaveText( some(els), 'webdriverio')

                        expect(result.pass).toBe(true)
                    })

                    test('should fails with `some` text when no element matches', async () => {
                        vi.mocked((await els)[0].getText).mockResolvedValue('Does not match')
                        vi.mocked((await els)[1].getText).mockResolvedValue('Also does not match')

                        const result = await thisContext.toHaveText( some(els), 'webdriverio')

                        expect(result.pass).toBe(false)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect some of ${selectorName} to have text

- Expected  - 2
+ Received  + 2

  Array [
-   "webdriverio",
-   "webdriverio",
+   "Does not match",
+   "Also does not match",
  ]`
                        )
                    })
                })
            })
        })

        describe('Edge cases', () => {

            // TODO review in next major version to trim by default for multiple elements as well, to be consistent with single element behavior
            test('given exact text but with space in it should work by default', async () => {
                const element = $('sel')

                const result = await thisContext.toHaveText(element, ' Valid Text ')

                expect(result.pass).toBe(false) // to review in major version to be true
            })

            test.each([
                { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
            ])('should fail with proper error message when actual is an empty of $name', async ({ elements, selectorName }) => {
                const result = await thisContext.toHaveText(elements, 'webdriverio')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: ["webdriverio"]
Received: undefined`)
            })

            test.each([
                { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
            ])('not - should fails (pass=true) when actual is an empty of $name - legacy behavior to deprecate!', async ({ elements, selectorName }) => {
                const result = await thisNotContext.toHaveText(elements, 'webdriverio')

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to have text

Expected [not]: ["webdriverio"]
Received      : undefined`
                )
            })

            // TODO view later to handle this case more gracefully
            test('given element is not found then it throws error when an element does not exists', async () => {
                const element: WebdriverIO.Element = notFoundElementFactory('sel')

                await expect(thisContext.toHaveText(element, 'webdriverio')).rejects.toThrow("Can't call getText on element with selector sel because element wasn't found")
            })

            // TODO view later to handle this case more gracefully
            test('given element from out of bound ChainableArray, then it throws error when an element does not exists', async () => {
                const element: ChainablePromiseElement = $$('elements')[3]

                await expect(thisContext.toHaveText(element, 'webdriverio')).rejects.toThrow('Index out of bounds! $$(elements) returned only 2 elements.')
            })

            // Throws with wierd and differrent error message!
            test.each([
                { actual: undefined, selectorName: 'undefined' },
                { actual: null, selectorName: 'null' },
                { actual: true, selectorName: 'true' },
                { actual: 5, selectorName: '5' },
                { actual: 'test', selectorName: 'test' },
                { actual: Promise.resolve(true), selectorName: 'true' },
                { actual: {}, selectorName: '{}' },
                { actual: ['1', '2'], selectorName: '["1","2"]' },
            ])('should have pass false with proper error message when actual is unsupported type of $actual', async ({ actual, selectorName }) => {
                const result = await thisContext.toHaveText(actual as any, 'webdriverio')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to have text

Expected: "webdriverio"
Received: undefined`)
            })

            test('given only one element in array when failures', async () => {
                const elements = chainableElementArrayFactory('elements', 1)
                vi.mocked((elements)[0].getText).mockResolvedValue('webdriverio')

                const results = await thisContext.toHaveText(elements, 'NotMatchingText')

                expect(results.pass).toBe(false)
                expect(stripAnsi(results.message())).toEqual(`\
Expect $$(\`elements\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
-   "NotMatchingText",
+   "webdriverio",
  ]`
                )
            })

            test('given the first element getText fails to retrieve', async () => {
                const elements = $$('elements')

                vi.mocked((elements)[0].getText).mockRejectedValue(new Error('Unable to retrieve text for first element'))
                vi.mocked((elements)[1].getText).mockResolvedValue('webdriverio')

                await expect(thisContext.toHaveText(elements, 'webdriverio')).rejects.toThrow('Unable to retrieve text for first element')
            })

            test('given the second element getText fails to retrieve', async () => {
                const elements = $$('elements')

                vi.mocked((elements)[0].getText).mockResolvedValue('webdriverio')
                vi.mocked((elements)[1].getText).mockRejectedValue(new Error('Unable to retrieve text for second element'))

                await expect(thisContext.toHaveText(elements, 'webdriverio')).rejects.toThrow('Unable to retrieve text for second element')
            })

            test('given all elements getText fails to retrieve', async () => {
                const elements = $$('elements')

                vi.mocked((elements)[0].getText).mockRejectedValue(new Error('Unable to retrieve text for first element'))
                vi.mocked((elements)[1].getText).mockRejectedValue(new Error('Unable to retrieve text for second element'))

                await expect(thisContext.toHaveText(elements, 'webdriverio')).rejects.toThrow('Unable to retrieve text for first element')
            })

            test('given not enough expected value', async () => {
                const elements = await $$('elements')

                elements.forEach((el) => vi.mocked(el.getText).mockResolvedValue('webdriverio'))

                const result = await thisContext.toHaveText(elements, ['webdriverio'])

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`elements\`) to have text

- Expected  - 0
+ Received  + 1

  Array [
    "webdriverio",
+   "webdriverio",
  ]`
                )
            })

            test('given too many expected value', async () => {
                const elements = await $$('elements')

                elements.forEach((el) => vi.mocked(el.getText).mockResolvedValue('webdriverio'))

                const result = await thisContext.toHaveText(elements, ['webdriverio', 'webdriverio', 'webdriverio'])

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`elements\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
    "webdriverio",
    "webdriverio",
-   "webdriverio",
+   undefined,
  ]`
                )
            })

            test('not - given not enough expected value', async () => {
                const elements = await $$('elements')

                elements.forEach((el) => vi.mocked(el.getText).mockResolvedValue('webdriverio'))

                const result = await thisNotContext.toHaveText(elements, ['notWebdriverio'])

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`elements\`) not to have text

- Expected [not]  - 1
+ Received        + 2

  Array [
-   "notWebdriverio",
+   "webdriverio",
+   "webdriverio",
  ]`
                )
            })

            test('not - given too many expected value', async () => {
                const elements = await $$('elements')

                elements.forEach((el) => vi.mocked(el.getText).mockResolvedValue('webdriverio'))

                const result = await thisNotContext.toHaveText(elements, ['NotWebdriverio', 'NotWebdriverio', 'NotWebdriverio'])

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`elements\`) not to have text

Expected [not]: ["NotWebdriverio", "NotWebdriverio", "NotWebdriverio"]
Received      : ["webdriverio", "webdriverio", undefined]`
                )
            })

            test('should support oneOf in array under strict behavior', async () => {
                const elements = await $$('elements')

                vi.mocked((elements)[0].getText).mockResolvedValue('WebdriverIO')
                vi.mocked((elements)[1].getText).mockResolvedValue('Get Started')

                // @ts-expect-error -- TODO fix typing soon!
                const result = await thisContext.toHaveText(elements, [wdioExpect.oneOf('WebdriverIO', 'Get Started'), wdioExpect.oneOf('WebdriverIO', 'Get Started')], { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('failures if all the values of oneOf does not match with text', async () => {
                const elements = await $$('elements')

                vi.mocked((elements)[0].getText).mockResolvedValue('WDIO')
                vi.mocked((elements)[1].getText).mockResolvedValue('WebdriverIO')

                const result = await thisContext.toHaveText(elements, wdioExpect.oneOf('WDIO', 'notMatching'),  { ignoreCase: true, trim: true, atStart: true, atEnd: true, atIndex: 1, wait: 0 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`elements\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
    startingWithOneOf<"WDIO", "notMatching">,
-   startingWithOneOf<"WDIO", "notMatching">,
+   "WebdriverIO",
  ]`
                )
            })

            test('not - failures if all the values of oneOf does not match with text', async () => {
                const elements = await $$('elements')

                vi.mocked((elements)[0].getText).mockResolvedValue('WDIO')
                vi.mocked((elements)[1].getText).mockResolvedValue('WebdriverIO')

                const result = await thisNotContext.toHaveText(elements, wdioExpect.oneOf('WDIO', 'WebdriverIO'),  { ignoreCase: true, trim: true, atStart: true, atEnd: true, atIndex: 1, wait: 0 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`elements\`) not to have text

Expected [not]: [startingWithOneOf<"WDIO", "WebdriverIO">, startingWithOneOf<"WDIO", "WebdriverIO">]
Received      : ["WDIO", "WebdriverIO"]`
                )
            })

            test('should be able to reuse oneOf matcher in multiple tests', async () => {
                const elements = await $$('elements')

                vi.mocked((elements)[0].getText).mockResolvedValue('WDIO')
                vi.mocked((elements)[1].getText).mockResolvedValue('WebdriverIO')

                const matcher = wdioExpect.oneOf('DIO', 'ebdriverIO')

                const resutls = await Promise.all([
                    // assertion A: options injected → { containing: true }
                    thisContext.toHaveText(elements, matcher, { containing: true }),
                    // assertion B: options injected → { atStart: true }  ← overwrites matcher.options
                    thisContext.toHaveText(elements, matcher, { atStart: true }),
                ])

                expect(resutls[0].pass).toBe(true)
                expect(resutls[1].pass).toBe(false)
            })

            describe('Long promises', () => {

                describe("given element's text takes more time then the configured wait to be retrieved", () => {

                    test('given element text takes more time then the configured wait then it should fail', async () => {
                        const element: ChainablePromiseElement = $('elements')
                        vi.mocked((await element).getText).mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve('0'), 500)))
                            .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve('1'), 500)))

                        const result = await thisContext.toHaveText(element, '1', { wait: 1, interval: 1 })

                        expect(result.pass).toBe(false)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`elements\`) to have text

Expected: "1"
Received: "0"`)
                    })
                })

                describe('given element itself takes more time then the configured wait to be retrieved', () => {

                    test('given element take time to be found, and first getText match then it should work', async () => {
                        const element: ChainablePromiseElement = $Factory(elementFactory('slowElement'), 500)

                        const result = await thisContext.toHaveText(element, 'Valid Text', { wait: 250, interval: 100 })

                        expect(result.pass).toBe(true)
                    })

                    test('given element take time to be found, and match only on second getText try then it should fails when using non-awaited version', async () => {
                        const element = elementFactory('slowElement')
                        element.getText = vi.fn()
                            .mockResolvedValueOnce('Invalid Text')
                            .mockResolvedValueOnce('Valid Text')

                        const nonAwaitedElement: ChainablePromiseElement = $Factory(element, 500)

                        const result = await thisContext.toHaveText(nonAwaitedElement, 'Valid Text', { wait: 250, interval: 100 })

                        expect(result.pass).toBe(false)
                        expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`slowElement\`) to have text

Expected: "Valid Text"
Received: "Invalid Text"`)
                    })

                    test('given element take time to be found, but match only on second try then it should succeeds when using awaited version', async () => {
                        const element = elementFactory('slowElement')
                        element.getText = vi.fn()
                            .mockResolvedValueOnce('Invalid Text')
                            .mockResolvedValueOnce('Valid Text')

                        const awaitedElement: ChainablePromiseElement = await $Factory(element, 500)

                        const result = await thisContext.toHaveText(awaitedElement, 'Valid Text', { wait: 250, interval: 100 })

                        expect(result.pass).toBe(true)
                    })
                })
            })
        })
    })
})
