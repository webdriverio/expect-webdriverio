import { waitUntil, enhanceError, } from '../../utils.js'
import { refetchElements, synchronizeElementArray, syncronizeElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise, WdioMultiRemoteElementArray, WdioMatcherContext } from '../../types.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberMatcher } from '../../util/numberOptionsUtil.js'
import { awaitElementArray, isMultiRemoteElementArray, isStrictlyElementArray } from '../../util/elementsUtil.js'
import { getElementsPerInstance, hasSameInstanceNames, isMultiRemoteMatcher } from '../../util/multiRemoteUtils.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-Remote `$$()`: the size is checked per browser instance.
 */
export async function toBeElementsArrayOfSize(
    received: WdioMultiRemoteElementArray | Promise<WdioMultiRemoteElementArray>,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher | ExpectWebdriverIO.MultiRemotePartialMatcher<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toBeElementsArrayOfSize(
    this: WdioMatcherContext,
    received: WdioElementsMaybePromise | WdioMultiRemoteElementArray | Promise<WdioMultiRemoteElementArray>,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher | ExpectWebdriverIO.MultiRemotePartialMatcher<number | ExpectWebdriverIO.NumberMatcher>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'elements array of size', verb = 'be', isNot, matcherName = 'toBeElementsArrayOfSize' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    // eslint-disable-next-line prefer-const
    let { elements, other } = await awaitElementArray(received as WdioElementsMaybePromise)

    const awaitedMultiRemote = other ?? elements
    if (isMultiRemoteElementArray(awaitedMultiRemote)) {
        const result = await multiRemoteElementsArrayOfSize(awaitedMultiRemote, expectedValue, options, { context: this, verb, expectation })
        await options.afterAssertion?.({ matcherName, expectedValue, options, result })
        return result
    }

    const expectedNumber = validateNumberMatcher(expectedValue as number | ExpectWebdriverIO.NumberMatcher)
    const originalLength =  elements ? elements.length : undefined

    const { success: pass } = await waitUntil(
        async (iteration) => {
            if (!elements) {
                return { success: false, subject: elements, actual: undefined, abort: true }
            } else if (iteration > 0) {
                elements = await refetchElements(elements)
            }

            // Verify if size match first before refetching elements
            const isPassing = expectedNumber.asymmetricMatch(elements.length)
            if (isPassing) {
                return { success: isPassing, subject: elements, actual: elements.length }
            }

            return { success: false, subject: elements, actual: elements.length }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    if (pass && originalLength !== undefined && elements !== received && (isStrictlyElementArray(received) || received instanceof Promise) && isStrictlyElementArray(elements)) {
        await syncronizeElements(received, elements)
    }

    const actual = originalLength
    const message = enhanceError(elements ?? other, expectedNumber, actual, this, verb, expectation, '', options)

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

/**
 * Multi-remote `$$()` (`MultiRemoteElementArray`): strictly checks the element count of
 * every browser instance, against either one size shared by all instances or one size per instance.
 * Browsers returning a different count are zipped by index by WebdriverIO, so counts are taken per instance.
 */
const multiRemoteElementsArrayOfSize = async (
    received: WdioMultiRemoteElementArray,
    expectedValue: unknown,
    options: ExpectWebdriverIO.CommandOptions,
    { context, verb, expectation }: { context: ExpectWebdriverIO.MatcherContext, verb: string, expectation: string }
): Promise<ExpectWebdriverIO.AssertionResult> => {
    const { isNot } = context
    const perInstanceSizes = getPerInstanceSizes(expectedValue)
    const { instances } = received.parent

    let expected: MultiRemoteValues<NumberMatcher>
    let instanceMismatch = false
    if (perInstanceSizes) {
        instanceMismatch = !hasSameInstanceNames(perInstanceSizes, instances)
        expected = Object.fromEntries(Object.entries(perInstanceSizes).map(([name, value]) =>
            [name, validateNumberMatcher(value)]
        ))
    } else {
        const numberMatcher = validateNumberMatcher(expectedValue as number | ExpectWebdriverIO.NumberMatcher)
        expected = Object.fromEntries(instances.map((name) => [name, numberMatcher]))
    }

    let elements = received
    let actual = countElementsPerInstance(elements, instances)

    const { success: pass } = await waitUntil(
        async (iteration) => {
            if (iteration > 0) {
                elements = await refetchElements(elements)
                actual = countElementsPerInstance(elements, instances)
            }

            if (instanceMismatch) {
                // Structural failure: fails with and without `.not`, no point retrying
                return { success: !!isNot, subject: elements, actual, abort: true }
            }

            // Strict on every instance: with `.not`, no instance may match. `success` is inverted by `waitUntil` for `.not`,
            // so it must stay true while at least one instance still matches.
            const matches = (name: string) => expected[name].asymmetricMatch(actual[name])
            const success = isNot ? instances.some(matches) : instances.every(matches)
            return { success, subject: elements, actual }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    // Same as for ElementArray: once passing, the received array reflects the refetched elements
    if (pass && elements !== received) {
        synchronizeElementArray(received, elements)
    }

    const message = enhanceError(elements, expected, actual, { isNot }, verb, expectation, '', options)
    return { pass, message: () => message }
}

/** One size per instance with `expect.multiRemote()`, or `undefined` for a single size shared by every instance */
const getPerInstanceSizes = (value: unknown): MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher> | undefined => {
    return isMultiRemoteMatcher(value) ? value.sample as MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher> : undefined
}

const countElementsPerInstance = (elements: WdioMultiRemoteElementArray, instances: string[]): MultiRemoteValues<number> => {
    const elementsPerInstance = getElementsPerInstance(elements, instances)
    return Object.fromEntries(instances.map((name) => [name, elementsPerInstance[name].length]))
}
