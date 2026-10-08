import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { compareTextOrOneOf, enhanceError, waitUntil, wrapExpectedWithArray } from '../../utils.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'

async function singleElementCompare(el: WebdriverIO.Element, attribute: string, value: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string | null>> {
    const actualClass = await el.getAttribute(attribute)

    if (value === undefined) {
        return { success: false, actual: actualClass }
    }

    if (typeof actualClass !== 'string') {
        return { success: false, actual: actualClass }
    }

    // HTML separates the classes with any whitespace. Each class is compared, for plain values and asymmetric matchers
    // alike: for the full attribute, use `toHaveAttribute('class', ...)`
    const classes = actualClass.split(/\s+/).filter(Boolean)
    const values = Array.isArray(value) ? value : [value]
    // `compareTextOrOneOf()` lets `expect.oneOf()` apply the string options itself, so that they apply once
    const isValueInClasses = classes.some((clazz) => values.some((expected) => compareTextOrOneOf(clazz, expected, options).success))

    return {
        success: isValueInClasses,
        actual: actualClass
    }
}

export async function toHaveElementClass(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'class', verb = 'have', isNot, matcherName = 'toHaveElementClass' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const attribute = 'class'
    // Apply the string options (`ignoreCase`, `trim`, `containing`...) to `expect.oneOf()`, as the other matchers do
    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: attr, subject: el, context: { isSome } = {}, expected } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: true,
                expectedValues: expectedWithOptions,
                singleElementCompare: (element, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, attribute, expectedValue, options),
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(el, expected ?? wrapExpectedWithArray(el, attr, expectedWithOptions), attr, { isNot, isSome }, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
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
}
