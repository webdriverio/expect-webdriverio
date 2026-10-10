import { DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../constants.js'
import { compareTextOrOneOf, enhanceError, executeCommandBe, waitUntil } from '../utils.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../types.js'
import type { CompareResult } from '../util/executeCommand.js'
import { executeCommandWithStrategy } from '../util/executeCommand.js'
import { executeBrowserCommand } from '../util/executeBrowserCommand.js'
import { fillSingleExpectedForElementArray } from '../util/elementsUtil.js'
import { withStringOptions } from '../util/expectedWithStringOptions.js'
import { buildWdioAsymmetricMatchersWithOptions } from './asymmetrics/asymmetricsUtils.js'
import { browserStringGetters, elementBooleanGetters, elementStringGetters } from './descriptors.js'
import type { ElementBooleanGetterDescriptor } from './descriptors.js'
import type { AssertionResult, CommandOptions, StringOptions, ToBeDisplayedOptions } from '../publicTypes/options.js'
import type { ExpectedOf } from '../publicTypes/expectWebdriverIO.js'

type StringExpected = MaybeArrayOrOneOf<ExpectedOf<'string'>>
type ReadString = (this: unknown, options?: StringOptions) => Promise<string>

/** Keep the name of the matcher, e.g. for `describe(toHaveText, ...)` */
const named = <T extends (...args: never[]) => unknown>(name: string, matcher: T): T => Object.defineProperty(matcher, 'name', { value: name })

/**
 * A string matcher of `$()`, `$$()` and multi-remote elements, made from its descriptor in `elementStringGetters`: the
 * getter gives the actual value of each element, and `compareTextOrOneOf()` compares it with the string options.
 */
export const elementStringGetterMatcher = <Options extends StringOptions>(name: keyof typeof elementStringGetters) => {
    const { getter, expectation: defaultExpectation, ...descriptor } = elementStringGetters[name]
    const getterGetsOptions = 'getterGetsOptions' in descriptor && descriptor.getterGetsOptions

    return named(name, async function (
        this: WdioMatcherContext,
        received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
        expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<ExpectedOf<'string'>>,
        options: Options = DEFAULT_OPTIONS as Options
    ): Promise<AssertionResult> {
        const { expectation = defaultExpectation, verb = 'have', isNot, matcherName = name } = this

        await options.beforeAssertion?.({
            matcherName,
            expectedValue,
            options,
        })

        const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

        const { success: pass, actual, subject, context: { isSome, matchingIndexes } = {}, expected, verdict, compared } = await waitUntil(
            async (iteration) => {
                return await executeCommandWithStrategy({
                    unresolvedElements: received,
                    expectedValues: expectedWithOptions,
                    supportsArrayContaining: 'arrayOnly',
                    matcherName,
                    singleElementCompare: async (element, values: StringExpected | undefined): Promise<CompareResult<string>> => {
                        const read = element[getter] as ReadString
                        const actualValue = await (getterGetsOptions ? read.call(element, options) : read.call(element))
                        return compareTextOrOneOf(actualValue, values, options)
                    },
                    context: { isNot, iteration },
                })
            },
            isNot,
            { wait: options.wait, interval: options.interval }
        )

        const finalExpected = expected ?? fillSingleExpectedForElementArray(subject, expectedWithOptions)
        const message = enhanceError(subject, withStringOptions(finalExpected, verdict, options, actual), actual, { isNot, isSome, matchingIndexes, stringOptions: options, compared }, verb, expectation, '', options)
        const result: AssertionResult = {
            pass,
            message: (): string => message
        }

        await options.afterAssertion?.({
            matcherName,
            expectedValue,
            options,
            result
        })

        return result
    })
}

/**
 * A string matcher of the browser, a browsing context and the multi-remote browser, made from its descriptor in
 * `browserStringGetters`.
 */
export const browserStringGetterMatcher = (name: keyof typeof browserStringGetters) => {
    const { getter, expectation: defaultExpectation, ...descriptor } = browserStringGetters[name]
    const showContextUrl = 'showContextUrl' in descriptor ? descriptor.showContextUrl : undefined

    return named(name, async function (
        this: ExpectWebdriverIO.MatcherContext,
        browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext | WebdriverIO.MultiRemoteBrowser,
        expectedValue: MultiRemoteValuesOrOneOf<ExpectedOf<'string'>>,
        options: StringOptions = DEFAULT_OPTIONS
    ): Promise<AssertionResult> {
        const { expectation = defaultExpectation, verb = 'have', isNot, matcherName = name } = this

        await options.beforeAssertion?.({
            matcherName,
            expectedValue,
            options,
        })

        // Apply the string options to `expect.oneOf()`, also when nested in per-instance values
        const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

        const { success: pass, actual, subject, expected, verdict, compared } = await waitUntil(
            async () => {
                return await executeBrowserCommand({
                    browser,
                    isNot,
                    expectedValue: expectedWithOptions,
                    compare: async (target, value: ExpectedOf<'string'> | undefined): Promise<CompareResult<string>> => {
                        const actualValue = await (target[getter] as ReadString).call(target)
                        return compareTextOrOneOf(actualValue, value, options)
                    },
                })
            },
            isNot,
            { wait: options.wait, interval: options.interval }
        )

        const message = enhanceError(subject, withStringOptions(expected, verdict, options, actual), actual, { isNot, browserTargetType: 'window', showContextUrl, stringOptions: options, compared }, verb, expectation, '', options)
        const result: AssertionResult = {
            pass,
            message: () => message
        }

        await options.afterAssertion?.({
            matcherName,
            expectedValue,
            options,
            result
        })

        return result
    })
}

/**
 * A boolean matcher of `$()`, `$$()` and multi-remote elements, made from its descriptor in `elementBooleanGetters`: the
 * getter gives the state of each element, and `executeCommandBe()` checks that it is `true`.
 */
export const elementBooleanGetterMatcher = <Options extends CommandOptions>(name: keyof typeof elementBooleanGetters) => {
    const { getter, expectation, verb, inverse, getterArgument, displayOptions, allowEmptyElements, aliasOf }: ElementBooleanGetterDescriptor = elementBooleanGetters[name]

    return named(name, async function (
        this: WdioMatcherContext,
        received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
        options: Options = (displayOptions ? DEFAULT_OPTIONS_TO_BE_DISPLAYED : DEFAULT_OPTIONS) as Options
    ): Promise<AssertionResult> {
        // `executeCommandBe()` reads the state, the verb and the empty list rule in the context. An alias replaces them
        this.expectation = aliasOf ? expectation : this.expectation || expectation
        if (verb !== undefined) {
            this.verb = aliasOf ? verb : this.verb || verb
        }
        if (allowEmptyElements) {
            this.allowEmptyElements = true
        }
        if (aliasOf) {
            this.matcherName ??= name
        }
        const { matcherName = name } = this

        await options.beforeAssertion?.({
            matcherName,
            options,
        })

        // `toBeDisplayed`: the display options, with their defaults, go to the getter, and the rest are the command options
        const { withinViewport, contentVisibilityAuto, opacityProperty, visibilityProperty, ...commandOptions }: ToBeDisplayedOptions =
            displayOptions ? { ...DEFAULT_OPTIONS_TO_BE_DISPLAYED, ...options } : options
        const argument = displayOptions ? { withinViewport, contentVisibilityAuto, opacityProperty, visibilityProperty } : getterArgument

        const result = await executeCommandBe.call(this, received, async (element) => {
            const read = element?.[getter] as ((this: WebdriverIO.Element, argument?: object) => Promise<boolean>) | undefined
            const state = argument === undefined ? read?.call(element) : read?.call(element, argument)
            return inverse ? !await state : state as Promise<boolean>
        }, displayOptions ? commandOptions : options)

        await options.afterAssertion?.({
            matcherName,
            options,
            result
        })

        return result
    })
}
