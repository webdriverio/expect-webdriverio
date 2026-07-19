import { DEFAULT_OPTIONS } from '../../constants.js'
import type {  WdioElementOrArrayMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { compareText, compareTextOrArray, enhanceError, isAsymmetricMatcher, waitUntil, wrapExpectedWithArray } from '../../utils.js'

async function singleElementCompare(el: WebdriverIO.Element, attribute: string, value: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string | null>> {
    const actualClass = await el.getAttribute(attribute)

    if (value === undefined) {
        return { result: false, value: actualClass }
    }

    if (typeof actualClass !== 'string') {
        return { result: false, value: actualClass }
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
        return compareTextOrArray(clazz, value, options).result
    })

    return {
        result: isValueInClasses,
        value: actualClass
    }
}

export async function toHaveElementClass(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'class', verb = 'have', isNot, matcherName = 'toHaveElementClass' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const attribute = 'class'

    let el
    let attr

    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, attribute, expectedValue, options),
                isNot
            })
            el = result.subject
            attr = result.actual

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(el, wrapExpectedWithArray(el, attr, expectedValue), attr, this, verb, expectation, '', options)
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
