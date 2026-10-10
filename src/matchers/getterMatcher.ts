import { DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../constants.js'
import { expect } from 'expect'
import { compareText, compareTextOrOneOf, enhanceError, executeCommandBe, isAsymmetricMatcher, waitUntil } from '../utils.js'
import { equals } from '../jasmineUtils.js'
import { isOneOfMatcher } from './asymmetrics/oneOf.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext, WdioMultiRemoteElements } from '../types.js'
import type { CompareResult } from '../util/executeCommand.js'
import { executeCommandWithStrategy } from '../util/executeCommand.js'
import { executeBrowserCommand } from '../util/executeBrowserCommand.js'
import { fillSingleExpectedForElementArray } from '../util/elementsUtil.js'
import { withStringOptions } from '../util/expectedWithStringOptions.js'
import { buildWdioAsymmetricMatchersWithOptions } from './asymmetrics/asymmetricsUtils.js'
import { browserStringGetters, elementBooleanGetters, elementStringGetters } from './descriptors.js'
import type { ElementBooleanGetterDescriptor, ElementStringGetterDescriptor } from './descriptors.js'
import type { AssertionResult, CommandOptions, StringOptions, ToBeDisplayedOptions } from '../publicTypes/options.js'
import type { ExpectedOf } from '../publicTypes/expectWebdriverIO.js'

type StringExpected = MaybeArrayOrOneOf<ExpectedOf<'string'>>
type ReadValue = (this: unknown, argument?: unknown) => Promise<unknown>
type ElementStringGetter = keyof typeof elementStringGetters
/** The string matchers whose getter argument is given in the call, e.g. `toHaveAttribute(name, value)` */
type ArgumentFromCall = { [Name in ElementStringGetter]: (typeof elementStringGetters)[Name] extends { argument: 'fromCall' } ? Name : never }[ElementStringGetter]

/** Keep the name of the matcher, e.g. for `describe(toHaveText, ...)` */
const named = <T extends (...args: never[]) => unknown>(name: string, matcher: T): T => Object.defineProperty(matcher, 'name', { value: name })

/**
 * A string value, with the string options. A value that is not a string (`null` for a missing attribute), or no expected
 * value, is compared as is: by an asymmetric matcher (e.g. `expect.anything()`), else with `===`.
 */
const compareString = (actual: string | null, expected: StringExpected | undefined, options: StringOptions): CompareResult<string | null> => {
    if (typeof actual !== 'string' || expected === undefined || expected === null) {
        return { success: isAsymmetricMatcher(expected) ? expected.asymmetricMatch(actual) : actual === expected, actual }
    }
    // `expect.oneOf()` applies its own options, and the message shows the actual value as is
    return compareTextOrOneOf(actual, expected, options)
}

/**
 * A class value: HTML separates the classes with ASCII whitespace only (space, tab, new line, form feed, carriage return),
 * so a non-breaking space is part of a class name. Each class is compared, for plain values and asymmetric matchers alike
 * (for the full attribute, use `toHaveAttribute('class', ...)`), and one class must match one expected value.
 */
const compareClasses = (actual: string | null, expected: StringExpected | undefined, options: StringOptions): CompareResult<string | null> => {
    if (expected === undefined || typeof actual !== 'string') {
        return { success: false, actual }
    }
    const classes = actual.split(/[\t\n\f\r ]+/).filter(Boolean)
    const values = Array.isArray(expected) ? expected : [expected]
    // `compareTextOrOneOf()` lets `expect.oneOf()` apply the string options itself, so that they apply once
    return { success: classes.some((clazz) => values.some((value) => compareTextOrOneOf(clazz, value, options).success)), actual }
}

/**
 * A property value: `equals()` for a value that is not a string (an object deeply, also with an asymmetric matcher in it),
 * else as a string with the string options; `asString` compares the text of any value.
 */
const compareProperty = (actual: unknown, expected: unknown, options: StringOptions): CompareResult<unknown> => {
    const { asString = false } = options
    if (actual === null || actual === undefined || (!(expected instanceof RegExp) && typeof actual !== 'string' && !asString)) {
        return { success: equals(actual, expected), actual }
    } else if (isOneOfMatcher(expected)) {
        return { success: expected.asymmetricMatch(actual), actual }
    }
    const text = (actual as { toString(): string }).toString()
    const { success, actual: compared } = compareText(text, expected as string | RegExp | AsymmetricMatcher<string> | null | undefined, options)
    // Failure messages show the actual value as is, not trimmed, lowercased or replaced by the string options, and the compared value apart
    return { success, actual: text, compared }
}

/**
 * The body of the string matchers of `$()`, `$$()` and multi-remote elements, made from their descriptor in
 * `elementStringGetters`: the getter (with its argument) gives the actual value of each element, and the value type
 * compares it with the string options. `hookValue` is the expected value that the user gave, for the hooks.
 */
async function matchStringGetter(
    this: WdioMatcherContext,
    name: ElementStringGetter,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    argument: string | undefined,
    hookValue: unknown,
    expectedValue: unknown,
    options: StringOptions
): Promise<AssertionResult> {
    const descriptor: ElementStringGetterDescriptor = elementStringGetters[name]
    const { getter, getterGetsOptions, argumentInMessage } = descriptor
    const isClass = descriptor.value === 'class'
    const isProperty = descriptor.value === 'property'
    // A property can be an object or an array: a plain object is a value, and a list matcher on `$()` compares the property
    const allowObjectExpectedValue = isProperty && !descriptor.expectsString
    const { expectation = descriptor.expectation, verb = 'have', isNot, matcherName = name } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: hookValue,
        options,
    })

    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual, subject, context: { isSome, matchingIndexes } = {}, expected, verdict, compared } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy({
                unresolvedElements: received,
                expectedValues: expectedWithOptions,
                supportsArrayContaining: allowObjectExpectedValue ? true : 'arrayOnly',
                matcherName,
                singleElementCompare: async (element, values: StringExpected | undefined): Promise<CompareResult<unknown>> => {
                    const read = element[getter] as ReadValue
                    const actualValue = await (getterGetsOptions ? read.call(element, options) : argument === undefined ? read.call(element) : read.call(element, argument))
                    return isProperty
                        ? compareProperty(actualValue, values, options)
                        : isClass ? compareClasses(actualValue as string | null, values, options) : compareString(actualValue as string | null, values, options)
                },
                context: { isNot, iteration },
                ...(isProperty && { strictConfiguration: { allowObjectExpectedValue } }),
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const finalExpected = expected ?? fillSingleExpectedForElementArray(subject, expectedWithOptions)
    const message = isClass
        // Each class is compared, and a class has no spaces: the message never names `trimmed` from the full attribute
        ? enhanceError(subject, withStringOptions(finalExpected, verdict, options), actual, { isNot, isSome, matchingIndexes, stringOptions: { ...options, trim: false } }, verb, expectation, '', options)
        : enhanceError(subject, withStringOptions(finalExpected, verdict, options, actual), actual, { isNot, isSome, matchingIndexes, stringOptions: options, compared }, verb, expectation, argumentInMessage ? argument ?? '' : '', options)
    const result: AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue: hookValue,
        options,
        result
    })

    return result
}

/**
 * A string matcher with no getter argument, or a fixed one (`toHaveId` is `getAttribute('id')`):
 * `toHaveX(expectedValue, options)`. The hooks get the expected value alone.
 */
export const elementStringGetterMatcher = <Options extends StringOptions>(name: Exclude<ElementStringGetter, ArgumentFromCall>) => {
    const { argument } = elementStringGetters[name] as ElementStringGetterDescriptor
    const fixedArgument = typeof argument === 'object' ? argument.fixed : undefined

    return named(name, async function (
        this: WdioMatcherContext,
        received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
        expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<ExpectedOf<'string'>>,
        options: Options = DEFAULT_OPTIONS as Options
    ): Promise<AssertionResult> {
        return matchStringGetter.call(this, name, received, fixedArgument, expectedValue, expectedValue, options)
    })
}

/**
 * A string matcher whose getter argument is given in the call: `toHaveAttribute(name, expectedValue, options)`. With no
 * expected value, the value exists (`expect.anything()`). The hooks get `[name, expectedValue]`, as the user gave them.
 */
export const elementArgumentGetterMatcher = (name: ArgumentFromCall) => named(name, async function (
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements,
    argument: string,
    // Internal: the public types (src/publicTypes/) type the value of each matcher
    value?: unknown,
    options: StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    return matchStringGetter.call(this, name, received, argument, [argument, value], value ?? expect.anything(), options)
})

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
                        const actualValue = await (target[getter] as (this: unknown) => Promise<string>).call(target)
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
