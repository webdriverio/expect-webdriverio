import { DEFAULT_OPTIONS } from '../../constants.js'
import type {  WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import { compareText, compareTextWithArray, enhanceError, isAsymmetricMatcher, waitUntil, wrapExpectedWithArray } from '../../utils.js'

async function singleElementStrategyCompare(el: WebdriverIO.Element, attribute: string, value: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualClass = await el.getAttribute(attribute)
    if (typeof actualClass !== 'string') {
        return { result: false }
    }

    /**
     * if value is an asymmetric matcher, no need to split class names
     * into an array and compare each of them
     */
    if (isAsymmetricMatcher(value)) {
        return compareText(actualClass, value, options)
    }

    const classes = actualClass.split(' ')
    const isValueInClasses = classes.some((t) => {
        return Array.isArray(value)
            ? compareTextWithArray(t, value, options).result
            : compareText(t, value, options).result
    })

    return {
        result: isValueInClasses,
        value: actualClass
    }
}

async function multipleElementsStrategyCompare(el: WebdriverIO.Element, attribute: string, value: string | RegExp | WdioAsymmetricMatcher<string>, options: ExpectWebdriverIO.StringOptions) {
    const actualClass = await el.getAttribute(attribute)
    if (typeof actualClass !== 'string') {
        return { result: false }
    }

    /**
     * if value is an asymmetric matcher, no need to split class names
     * into an array and compare each of them
     */
    if (isAsymmetricMatcher(value)) {
        return compareText(actualClass, value, options)
    }

    const classes = actualClass.split(' ')
    const isValueInClasses = classes.some((t) => compareText(t, value, options).result)

    return {
        result: isValueInClasses,
        value: actualClass,
    }
}

export async function toHaveElementClass(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'class', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveElementClass',
        expectedValue,
        options,
    })

    const attribute = 'class'

    let el
    let attr

    const pass = await waitUntil(async () => {
        const result = await executeCommand(received, (element) =>
            singleElementStrategyCompare(element, attribute, expectedValue, options),
        (elements) => defaultMultipleElementsIterationStrategy(elements,
            expectedValue,
            (element, value) => multipleElementsStrategyCompare(element, attribute, value, options))
        )
        el = result.elementOrArray
        attr = result.valueOrArray

        return result
    },
    isNot,
    { wait: options.wait, interval: options.interval })

    const message = enhanceError(el, wrapExpectedWithArray(el, attr, expectedValue), attr, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveElementClass',
        expectedValue,
        options,
        result
    })

    return result
}
