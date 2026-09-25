import { waitUntil, enhanceError, } from '../../utils.js'
import { refetchElements, synchronizeElementArray, syncronizeElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise, WdioMultiRemoteElementArray } from '../../types.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { isPerInstanceNumbers, validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import { awaitElementArray, isMultiRemoteElementArray, isMultiRemoteElements, isMultiRemoteElementsLike, isStrictlyElementArray } from '../../util/elementsUtil.js'
import { getElementsPerInstance, getGlobalMultiRemoteInstanceNames, hasSameInstanceNames, isGlobalBrowserSingleRemote, isMultiRemoteMatcher } from '../../util/multiRemoteUtils.js'

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
    expectedValue: number | ExpectWebdriverIO.NumberMatcher | MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray | Promise<WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray>,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher | MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<number | ExpectWebdriverIO.NumberMatcher>,
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
    // An empty plain `MultiRemoteElement[]` (without WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY) looks like an empty `Element[]`, but per-instance sizes tell them apart,
    // unless it is a regular `ElementArray` or a regular (non multi-remote) session, where per-instance sizes can never match
    const isEmptyWithPerInstanceSizes = Array.isArray(awaitedMultiRemote) && awaitedMultiRemote.length === 0
        && !isStrictlyElementArray(awaitedMultiRemote) && !isGlobalBrowserSingleRemote()
        && getPerInstanceSizes(expectedValue) !== undefined
    if (isMultiRemoteElementsLike(awaitedMultiRemote) || isEmptyWithPerInstanceSizes) {
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
    const perInstanceSizes = getPerInstanceSizes(expectedValue)
    // An empty plain `MultiRemoteElement[]` holds no instance names: take them from the global multi-remote browser so that
    // per-instance sizes are still strictly checked, else (without injected globals) we can only trust the expected ones.
    const instances = getMultiRemoteInstanceNames(received)
        ?? getGlobalMultiRemoteInstanceNames()
        ?? (perInstanceSizes ? Object.keys(perInstanceSizes) : [])

    let commandOptions = options
    let expected: MultiRemoteValues<NumberMatcher>
    let instanceMismatch = false
    if (perInstanceSizes) {
        instanceMismatch = !hasSameInstanceNames(perInstanceSizes, instances)
        expected = Object.fromEntries(Object.entries(perInstanceSizes).map(([name, value]) =>
            [name, validateNumberAndExtractOptions(value as number | ExpectWebdriverIO.NumberMatcher, options).numberMatcher]
        ))
    } else {
        const validated = validateNumberAndExtractOptions(expectedValue as number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher, options)
        commandOptions = validated.commandOptions
        expected = Object.fromEntries(instances.map((name) => [name, validated.numberMatcher]))
    }

    // The best-effort refetch of a plain `MultiRemoteElement[]` needs its elements' selector, so an empty refetch is
    // compared but not kept as the source of the next refetch.
    let refetchSource = received
    let elements = received
    let actual = countElementsPerInstance(elements, instances)

    const { success: pass } = await waitUntil(
        async (iteration) => {
            if (iteration > 0) {
                elements = await refetchElements(refetchSource)
                if (elements.length > 0 || !isMultiRemoteElements(refetchSource)) {
                    refetchSource = elements
                }
                actual = countElementsPerInstance(elements, instances)
            }

            if (instanceMismatch) {
                // Structural failure: fails with and without `.not`, no point retrying
                return { success: !!isNot, subject: refetchSource, actual, abort: true }
            }

            // Strict on every instance: with `.not`, no instance may match. `success` is inverted by `waitUntil` for `.not`,
            // so it must stay true while at least one instance still matches.
            const matches = (name: string) => expected[name].asymmetricMatch(actual[name])
            const success = isNot ? instances.some(matches) : instances.every(matches)
            return { success, subject: refetchSource, actual }
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    // Same as for ElementArray: once passing, the received array reflects the refetched elements
    if (pass && elements !== received) {
        synchronizeElementArray(received, elements)
    }

    const message = enhanceError(refetchSource, expected, actual, { isNot }, verb, expectation, '', commandOptions)
    return { pass, message: () => message }
}

/** One size per instance (`expect.multiRemote()` or its plain object shorthand), or `undefined` for a single size shared by every instance */
const getPerInstanceSizes = (value: unknown): MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher> | undefined => {
    if (!isPerInstanceNumbers(value)) {
        return undefined
    }
    return (isMultiRemoteMatcher(value) ? value.sample : value) as MultiRemoteValues<number | ExpectWebdriverIO.NumberMatcher>
}

/** `undefined` for an empty plain `MultiRemoteElement[]`, which holds no reference to its instances */
const getMultiRemoteInstanceNames = (elements: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray): string[] | undefined => {
    const first = (elements as WebdriverIO.MultiRemoteElement[])[0] as WebdriverIO.MultiRemoteElement | undefined
    if (first) {
        return first.instances
    }
    // Empty `MultiRemoteElementArray`: its parent (multi-remote browser or element) still knows the instances
    const parent = isMultiRemoteElementArray(elements) ? elements.parent as unknown as { instances?: string[] } : undefined
    return parent?.instances
}

const countElementsPerInstance = (elements: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray, instances: string[]): MultiRemoteValues<number> => {
    const elementsPerInstance = getElementsPerInstance(elements as WebdriverIO.MultiRemoteElement[], instances)
    return Object.fromEntries(instances.map((name) => [name, elementsPerInstance[name].length]))
}
