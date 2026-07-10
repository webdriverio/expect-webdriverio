import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'

async function condition(el: WdioElementOrArrayMaybePromise, text: MaybeArray<string | RegExp | AsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualTextArray: string[] = []
    const resultArray: boolean[] = []
    let checkAllValuesMatchCondition: boolean

    if (Array.isArray(el)){
        for (const element of el){
            const actualText = await element.getText()
            actualTextArray.push(actualText)
            const result = Array.isArray(text)
                ? compareTextWithArray(actualText, text, options).result
                : compareText(actualText, text, options).result
            resultArray.push(result)
        }
        checkAllValuesMatchCondition = resultArray.every(Boolean)
    } else {
        const actualText = await (el as WebdriverIO.Element).getText()
        actualTextArray.push(actualText)
        checkAllValuesMatchCondition = Array.isArray(text)
            ? compareTextWithArray(actualText, text, options).result
            : compareText(actualText, text, options).result
    }

    return {
        value: actualTextArray.length === 1 ? actualTextArray[0] : actualTextArray,
        result: checkAllValuesMatchCondition
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

    let elements = 'getElement' in received
        ? await received?.getElement()
        : 'getElements' in received
            ? await received?.getElements()
            : received
    let actualText

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, elements, condition, options, [expectedValue, options])
            elements = result.el
            actualText = result.values

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(elements, wrapExpectedWithArray(elements, actualText, expectedValue), actualText, this, verb, expectation, '', options)
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
