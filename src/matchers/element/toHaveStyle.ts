import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareStyle,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, style: MaybeArray<{ [key: string]: string; }> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<{ [key: string]: string | undefined; } | undefined>> {
    if (style === undefined) {
        return { result: false, value: undefined }
    }
    if (Array.isArray(style)) {
        const results = await Promise.all(style.map((s) => compareStyle(el, s, options)))
        const result = results.find((result) => result.result)
        return result ? result : { result: false, value: results?.[0]?.value }
    }

    return compareStyle(el, style, options)
}

export async function toHaveStyle(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<{ [key: string]: string; }>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'style', verb = 'have', isNot, matcherName = 'toHaveStyle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el
    let actualStyle

    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValues: MaybeArray<{ [key: string]: string; }> | undefined) => condition(element, expectedValues, options),
                isNot
            })
            el = result.subject
            actualStyle = result.actual

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = wrapExpectedWithArray(el, actualStyle, expectedValue)
    const message = enhanceError(el, expected, actualStyle, this, verb, expectation, '', options)

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
