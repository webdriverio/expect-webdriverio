import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareText,
    compareTextWithArray,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(
    el: WebdriverIO.Element,
    label: string | RegExp | AsymmetricMatcher<string> | Array<string | RegExp>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualLabel = await el.getComputedLabel()
    if (Array.isArray(label)) {
        return compareTextWithArray(actualLabel, label, options)
    }
    return compareText(actualLabel, label, options)
}

export async function toHaveComputedLabel(
    received: WdioElementMaybePromise,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | Array<string | RegExp>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'computed label', verb = 'have', isNot, matcherName = 'toHaveComputedLabel' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el = await received?.getElement()
    let actualLabel

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
            el = result.el as WebdriverIO.Element
            actualLabel = result.values

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualLabel, expectedValue),
        actualLabel,
        this,
        verb,
        expectation,
        '',
        options
    )

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
