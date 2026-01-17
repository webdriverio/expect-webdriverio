import { waitUntil, enhanceError, } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise } from '../../types.js'
import { validateNumberOptions } from '../../util/numberOptionsUtil.js'
import { awaitElementArray } from '../../util/elementsUtil.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'elements array of size', verb = 'be', matcherName = 'toBeElementsArrayOfSize', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher, numberCommandOptions } = validateNumberOptions(expectedValue)

    // eslint-disable-next-line prefer-const
    let { elements, other } = await awaitElementArray(received)

    const wait = numberCommandOptions?.wait ?? options.wait ?? DEFAULT_OPTIONS.wait
    const originalLength =  elements ? elements.length : undefined

    const pass = await waitUntil(
        async () => {
            if (!elements) {
                return false
            }

            // Verify is size match first before refetching elements
            const isPassing = numberMatcher.equals(elements.length)
            if (isPassing) {
                return isPassing
            }

            // TODO should we do this on other matchers??
            elements = await refetchElements(elements, wait, true)
            return false
        },
        isNot,
        { wait, interval: numberCommandOptions?.interval ?? options.interval }
    )

    // TODO By using `(await received).push(elements[index])` we could update Promises of arrays, should we support that?
    if (Array.isArray(received) && pass && originalLength !== undefined && elements) {
        for (let index = originalLength; index < elements.length; index++) {
            received.push(elements[index])
        }
    }

    const actual = originalLength
    const message = enhanceError(elements ?? other, numberMatcher, actual, this, verb, expectation, '', { ...numberCommandOptions, ...options })

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
