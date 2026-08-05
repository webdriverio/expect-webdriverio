import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { compareText, compareTextOrArray, enhanceError, isAsymmetricMatcher, waitUntil, wrapExpectedWithArray } from '../../utils.js'

async function singleElementCompare(el: WebdriverIO.Element, attribute: string, value: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string | null>> {
    const actualClass = await el.getAttribute(attribute)

    if (value === undefined) {
        return { success: false, actual: actualClass }
    }

    if (typeof actualClass !== 'string') {
        return { success: false, actual: actualClass }
    }

    /**
     * if value is an asymmetric matcher, no need to split class names
     * into an array and compare each of them
     */
    if (isAsymmetricMatcher(value)) {
        return compareText(actualClass, value, options)
    }

    const classes = actualClass.split(' ')
    const isValueInClasses = classes.some((clazz) => {
        return compareTextOrArray(clazz, value, options).success
    })

    return {
        success: isValueInClasses,
        actual: actualClass
    }
}

/**
 * @deprecated since v6.0.0, remove in v8.0.0
 */
export function toHaveClass(...args: unknown[]) {
    return toHaveElementClass.call(this || {}, ...args)
}

export async function toHaveElementClass(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'class', verb = 'have', isNot, matcherName = 'toHaveElementClass' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const attribute = 'class'

    const { success: pass, actual: attr, subject: el, context: { isSome } = {} } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, attribute, expectedValue, options),
                context: { isNot, iteration },
                strategy: 'NewStrictMultipleElements',
                // TODO: Replace (without breaking the API) array by oneOf/anyOf as will we should put in place for multiple elements
                strictConfiguration: { allowArrayWithSingleElement: true }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(el, wrapExpectedWithArray(el, attr, expectedValue), attr, { isNot, isSome }, verb, expectation, '', options)
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
