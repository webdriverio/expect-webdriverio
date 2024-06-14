import { DEFAULT_OPTIONS } from '../../constants.js';
import { WdioElementMaybePromise, WdioElementsMaybePromise } from '../../types.js';
import {
    compareText, compareTextWithArray,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js';

async function condition(el: WebdriverIO.Element | WebdriverIO.ElementArray, text: string | RegExp | Array<string | RegExp> | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions) {
    const actualTextArray = []
    const resultArray = []
    let actualText, checkAllValuesMatchCondition

    if(Array.isArray(el)){
        for(const element of el){
            actualText = await element.getText()
            actualTextArray.push(actualText)
            const result = Array.isArray(text)
                ? compareTextWithArray(actualText, text, options).result
                : compareText(actualText, text, options).result
            resultArray.push(result)
        }
    checkAllValuesMatchCondition = resultArray.every(result => result)
    }
    else{
        actualText = await (el as WebdriverIO.Element).getText()
        actualTextArray.push(actualText);
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
    received: WdioElementMaybePromise | WdioElementsMaybePromise,
    expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'text', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveText',
        expectedValue,
        options,
    })

    let el = await received
    let actualText

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
        el = result.el
        actualText = result.values

        return result.success
    }, isNot, options)

    const message = enhanceError(el, wrapExpectedWithArray(el, actualText, expectedValue), actualText, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveText',
        expectedValue,
        options,
        result
    })

    return result
}

/**
 * @deprecated
 */
export function toHaveTextContaining(el: WebdriverIO.Element, text: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    return toHaveText.call(this, el, text, {
        ...options,
        containing: true
    })
}
