import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'

async function compareElement(el: WebdriverIO.Element, text: MaybeArray<string | RegExp | AsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualText = await el.getText()
    const result = Array.isArray(text) ?
        compareTextWithArray(actualText, text, options).result
        : compareText(actualText, text, options).result

    return {
        value: actualText,
        result
    }
}

export async function toHaveText(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let actualText: string | string[] | undefined
    let subject: unknown = received
    const pass = await waitUntil(
        async () => {
            const commandResult = await executeCommandWithStrategy( {
                unresolvedElements: received,
                singleElementCompare: (element, _index) => compareElement(element, expectedValue, options),
            })
            subject = commandResult.subject
            actualText = commandResult.actual

            return commandResult.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(subject, wrapExpectedWithArray(subject, actualText, expectedValue), actualText, this, verb, expectation, '', options)
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
