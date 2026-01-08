import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import {
    compareText,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    expected: unknown | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { asString = false } = options

    const prop = await el.getProperty(property)

    // As specified in the w3c spec, cases where property does not exist
    if (prop === null || prop === undefined) {
        return { result: false, value: prop }
    }

    // Why not comparing expected and prop for null? Bug?
    if (expected === null) {
        return { result: true, value: prop }
    }

    if (!(expected instanceof RegExp) && typeof prop !== 'string' && !asString) {
        return { result: prop === expected, value: prop }
    }

    // To review the cast to be more type safe but for now let's keep the existing behavior to ensure no regression
    return compareText(prop.toString(), expected as string, options)
}

export async function toHaveElementProperty(
    received: WdioElementOrArrayMaybePromise,
    property: string,
    expectedValue: MaybeArray<unknown | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'property', verb = 'have', isNot, matcherName = 'toHaveElementProperty' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [property, expectedValue],
        options,
    })

    let el
    let prop: unknown
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received, undefined,
                async (elements) => defaultMultipleElementsIterationStrategy(
                    elements,
                    expectedValue,
                    (element, expected) => condition(element, property, expected, options)
                )
            )
            el = result.elementOrArray
            prop = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    let message: string
    if (expectedValue === undefined) {
        message = enhanceError(el, !isNot, pass, this, verb, expectation, property, options)
    } else {
        const expected = wrapExpectedWithArray(el, prop, expectedValue)
        message = enhanceError(el, expected, prop, this, verb, expectation, property, options)
    }

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: matcherName,
        expectedValue: [property, expectedValue],
        options,
        result
    })

    return result
}
