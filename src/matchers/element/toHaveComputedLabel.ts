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
    label: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
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
    expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'computed label', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveComputedLabel',
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
        options
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
        matcherName: 'toHaveComputedLabel',
        expectedValue,
        options,
        result
    })

    return result
}
