import { waitUntil, enhanceError, } from '../../utils.js'
import { refetchElements, synchronizeElementArray, syncronizeElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise, WdioMultiRemoteElementArray } from '../../types.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import { awaitElementArray, isMultiRemoteElementArray, isMultiRemoteElementsLike, isStrictlyElementArray } from '../../util/elementsUtil.js'
import { hasSameInstanceNames, isMultiRemoteValues } from '../../util/multiRemoteUtils.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * @deprecated since v6.0.0, remove in v8.0.0. Use `toBeElementsArrayOfSize` with NumberMatcher instead. This matcher will be removed in version 8.0.0.
 */
export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-Remote `$$()`: the size is checked per browser instance.
 */
export async function toBeElementsArrayOfSize(
    received: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray | Promise<WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray>,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher | MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray | Promise<WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray>,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher | MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher>,
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
    if (isMultiRemoteElementsLike(awaitedMultiRemote)) {
        const result = await multiRemoteElementsArrayOfSize(awaitedMultiRemote, expectedValue, options, { context: this, verb, expectation })
        await options.afterAssertion?.({ matcherName, expectedValue, options, result })
        return result
    }

    const  { numberMatcher: expectedNumber, commandOptions } = validateNumberAndExtractOptions(expectedValue as ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher, options)
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
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    if (pass && originalLength !== undefined && elements !== received && (isStrictlyElementArray(received) || received instanceof Promise) && isStrictlyElementArray(elements)) {
        await syncronizeElements(received, elements)
    }

    const actual = originalLength
    const message = enhanceError(elements ?? other, expectedNumber, actual, this, verb, expectation, '', commandOptions)

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
 * Multi-remote `$$()` (plain `MultiRemoteElement[]` or `MultiRemoteElementArray`): strictly checks the element count of
 * every browser instance, against either one size shared by all instances or one size per instance.
 * Browsers returning a different count are zipped by index by WebdriverIO, so counts are taken per instance.
 */
const multiRemoteElementsArrayOfSize = async (
    received: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
    expectedValue: unknown,
    options: ExpectWebdriverIO.CommandOptions,
    { context, verb, expectation }: { context: ExpectWebdriverIO.MatcherContext, verb: string, expectation: string }
): Promise<ExpectWebdriverIO.AssertionResult> => {
    const { isNot } = context
    const instances = getMultiRemoteInstanceNames(received)

    let commandOptions = options
    let expected: MultiRemoteValues<NumberMatcher>
    let instanceMismatch = false
    if (isMultiRemoteValues(expectedValue, instances)) {
        instanceMismatch = !hasSameInstanceNames(expectedValue, instances)
        expected = Object.fromEntries(Object.entries(expectedValue).map(([name, value]) =>
            [name, validateNumberAndExtractOptions(value as number | ExpectWebdriverIO.NumberMatcher, options).numberMatcher]
        ))
    } else {
        const validated = validateNumberAndExtractOptions(expectedValue as number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher, options)
        commandOptions = validated.commandOptions
        expected = Object.fromEntries(instances.map((name) => [name, validated.numberMatcher]))
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

            const success = instances.every((name) => expected[name].asymmetricMatch(actual[name]))
            return { success, subject: elements, actual }
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    // Same as for ElementArray: once passing, the received array reflects the refetched elements
    if (pass && elements !== received) {
        synchronizeElementArray(received, elements)
    }

    const message = enhanceError(elements, expected, actual, { isNot }, verb, expectation, '', commandOptions)
    return { pass, message: () => message }
}

const getMultiRemoteInstanceNames = (elements: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray): string[] => {
    const first = (elements as WebdriverIO.MultiRemoteElement[])[0] as WebdriverIO.MultiRemoteElement | undefined
    if (first) {
        return first.instances
    }
    // Empty `MultiRemoteElementArray`: its parent (multi-remote browser or element) still knows the instances
    const parent = isMultiRemoteElementArray(elements) ? elements.parent as unknown as { instances?: string[] } : undefined
    return parent?.instances ?? []
}

const countElementsPerInstance = (elements: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray, instances: string[]): MultiRemoteValues<number> => {
    // Plain loop to bypass the asynchronous iterators of `MultiRemoteElementArray`
    const multiRemoteElements = elements as WebdriverIO.MultiRemoteElement[]
    return Object.fromEntries(instances.map((name) => {
        let count = 0
        for (let index = 0; index < multiRemoteElements.length; index++) {
            if (hasInstance(multiRemoteElements[index], name)) {
                count++
            }
        }
        return [name, count]
    }))
}

/** Zipped `$$()` results hold no element for an instance that returned fewer elements, and `getInstance` then throws */
const hasInstance = (element: WebdriverIO.MultiRemoteElement, name: string): boolean => {
    try {
        return !!element.getInstance(name)
    } catch {
        return false
    }
}
