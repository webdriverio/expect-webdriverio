import { equals } from '../jasmineUtils.js'
import { isArrayContainingMatcher } from '../utils.js'
import { isSomeWrapper } from '../matchers/modifiers/some.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, MaybeArray, WdioElements, WdioMultiRemoteElements, WdioMultiRemoteElementArray, MaybeArrayOrMultiRemoteValuesWithArray, MultiRemoteValuesWithArray } from '../types.js'
import { awaitElementOrArray, isElement, isMultiRemoteElement, isMultiRemoteElementArray, isMultiRemoteElementLike, isMultiRemoteElements, isMultiRemoteElementsLike, isStrictlyElementArray } from './elementsUtil.js'
import { getElementsPerInstance, getPerInstanceValues, hasSameInstanceNames } from './multiRemoteUtils.js'
import { refreshElementArray } from './refetchElements.js'

export type StrategyType = 'LegacyLooseMultipleElements' | 'NewStrictMultipleElements'
export type CompareResult<Actual> = { success: boolean; actual: Actual }
export type MultiRemoteCompareResult<Actual> = { success: boolean; actual: Actual, multiRemoteBrowserName: string }
export type StrategyResult<Actual, Subject = WebdriverIO.Element | WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Browser | unknown, Expected = unknown> = {
    subject: Subject;
    expected?: Expected;
    abort?: boolean;
    context?: { isSome: boolean };
} & CompareResult<Actual | MultiRemoteValues<Actual> | undefined>

/**
 * Fetch element(s) and route them to the appropriate comparison strategy.
 * Acts as a router to dispatch the elements to either the legacy or new comparison strategy.
 *
 * @param unresolvedElements awaited or non-awaited element(s) to be resolved and compared
 * @param singleElementCompare compare a single element with expected value(s)
 * @param isNot indicates if the assertion is inverted (e.g., using `.not`)
 * @param strategy the strategy type to use (defaults to 'NewStrictMultipleElements')
 * @param configuration configuration options for the strategy
 * @returns An object containing the subject, success status, actual values, and results of the comparison
 */
export async function executeCommandWithStrategy<Actual, Expected>( {
    unresolvedElements,
    expectedValues,
    singleElementCompare,
    context: { isNot, iteration },
    strategy = 'NewStrictMultipleElements',
    supportsArrayContaining = false,
    strictConfiguration = { allowEmptyElements: false, allowArrayWithSingleElement: false }
} :{
    unresolvedElements: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements | unknown
    expectedValues: MaybeArrayOrMultiRemoteValues<Expected> | unknown
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>
    context: { isNot: boolean, iteration: number },
    strategy?: StrategyType,
    /** Compare collection snapshots using singleElementCompare(element, undefined). 'arrayOnly' rejects scalar subjects. */
    supportsArrayContaining?: boolean | 'arrayOnly',
    /**
     * - allowEmptyElements: an empty element set passes instead of failing (e.g. `.not.toExist()`)
     * - allowArrayWithSingleElement: a single element is compared against an array (e.g. classes)
     * - allowObjectExpectedValue: the expected value itself can be a plain object (e.g. styles), so for multi-remote a plain
     *   object is always a literal and per-instance values require `expect.multiRemote()`
     */
    strictConfiguration?: { allowEmptyElements?: boolean, allowArrayWithSingleElement?: boolean, allowObjectExpectedValue?: boolean }
}
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> {
    const isSome = isSomeWrapper(unresolvedElements)
    const actualReceived = isSome ? unresolvedElements.elements : unresolvedElements

    if (supportsArrayContaining && !isSome && isArrayContainingMatcher(expectedValues)) {
        const { selector, elements, other } = await awaitElementOrArray(unresolvedElements)
        if (isMultiRemoteElementsLike(elements)) {
            return multiRemoteArrayContainingStrategy(elements, expectedValues, singleElementCompare, iteration)
        }
        if (elements) {
            if (iteration > 0 && isStrictlyElementArray(elements)) {
                await refreshElementArray(elements)
            }

            // Reuse each matcher's value extraction, including command-specific options.
            const settled = await Promise.allSettled(Array.from(elements).map(async (element, index) => {
                return singleElementCompare(element, undefined, index)
            }))
            const actual = settled.map((result) => {
                if (result.status === 'rejected') {
                    throw result.reason
                }
                return result.value.actual
            })
            return {
                subject: elements,
                actual,
                success: equals(actual, expectedValues),
                abort: elements.length === 0 && !isStrictlyElementArray(elements),
            }
        }
        if (!isElement(selector) || supportsArrayContaining === 'arrayOnly') {
            return { subject: selector ?? other, actual: undefined, success: !!isNot, abort: true }
        }
        // A scalar element may itself have an array-valued property.
        // SAFETY: Opted-in matchers accept asymmetric expectations; only the collection's sample type differs from Expected.
        return { subject: selector, ...await singleElementCompare(selector, expectedValues as MaybeArray<Expected>) }
    }

    if (strategy === 'LegacyLooseMultipleElements') {
        if (isSome) {
            throw new Error('some(elements) works only when enabling `useToHaveTextStrictMultiElementsCompareStrategy`')
        }
        return legacyMultipleElementResultsStrategy(actualReceived, expectedValues, singleElementCompare, isNot)
    }

    // Default new strategy for single & multiple element results, which is more consistent and less ambigious than the legacy strategy.
    return multipleElementResultsStrategy(actualReceived, expectedValues, singleElementCompare, { isNot, isSome, iteration }, strictConfiguration)
}

/**
 * `arrayContaining` on a multi-remote `$$()`: every instance's own collection of values must satisfy it.
 */
const multiRemoteArrayContainingStrategy = async <Actual, Expected>(
    elements: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
    expectedValues: unknown,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>,
    iteration: number
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> => {
    const currentElements = iteration > 0 ? await refreshElementArray(elements) : elements

    const multiRemoteElements = currentElements as unknown as WebdriverIO.MultiRemoteElement[]
    if (multiRemoteElements.length === 0) {
        // See empty case of `multipleElementResultsStrategy`: a static empty array cannot be refetched
        return { subject: elements, actual: undefined, success: false, abort: !isMultiRemoteElementArray(elements) && !isMultiRemoteElements(elements) }
    }

    const { instances } = multiRemoteElements[0]
    const elementsPerInstance = getElementsPerInstance(multiRemoteElements, instances)
    const actual: MultiRemoteValues<Actual[]> = Object.fromEntries(await Promise.all(instances.map(async (instance) => {
        // Reuse each matcher's value extraction, including command-specific options.
        const results = await Promise.all(elementsPerInstance[instance].map((element, index) => singleElementCompare(element, undefined, index)))
        return [instance, results.map((result) => result.actual)]
    })))

    return {
        subject: elements,
        actual,
        success: instances.every((instance) => equals(actual[instance], expectedValues)),
        expected: Object.fromEntries(instances.map((instance) => [instance, expectedValues])),
    }
}

/**
 * Legacy multiple element comparison strategy.
 *
 * Previous multi-element compare mechanism that started with `toHaveText` matcher.
 * Flaws:
 * - If there is no element or an empty array, it returns success with `.not` even though there are no elements' value to compare against.
 * - When asserting with `.not` to not have a given text, if at least one element does not have the text, it returns success even though other elements may have the text.
 *
 * @deprecated The above behavior can be confusing, yielding ambiguous results.
 * Kept for backward compatibility, to not be breaking but still be able to rollout the below new strategy.
 */
export const legacyMultipleElementResultsStrategy = async <Expected, Actual>(
    unresolvedElements: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | unknown,
    expectedValues: MaybeArray<Expected> | undefined,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>,
    _isNot?: boolean,

): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> => {
    const { selector, other, isEmptyElements } = await awaitElementOrArray(unresolvedElements)
    // Checked once awaited to also catch a non-awaited `$()`/`$$()`. Throwing, since failing with `success: false` would pass under `.not`
    if (isMultiRemoteElementLike(selector)) {
        throw new Error('Multi-remote elements works only when enabling `useToHaveTextStrictMultiElementsCompareStrategy`')
    }
    const subject = selector ?? other
    if (!selector || isEmptyElements) {
        return {
            subject: subject,
            success: false,
            actual: undefined,
            abort: true,
        }
    }

    if (isElement(selector)) {
        const compareResult = await singleElementCompare(selector, expectedValues)
        return {
            subject,
            ...compareResult,
        }
    }

    const settled = await Promise.allSettled(
        // Former `toHaveText` mechanism was to pass all the expected values (when an array) to each element and not an index-based expected value like the new strategy. This is kept for backward compatibility with the legacy strategy.
        Array.from(selector).map((element: WebdriverIO.Element, index: number) => singleElementCompare(element, expectedValues, index))
    )
    // Re-throw the first rejection so waitUntil surfaces the real error message
    const firstRejection = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (firstRejection) {
        throw firstRejection.reason
    }
    const results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<Actual>>).value)

    return {
        subject,
        success: results.length > 0 && results.every((res) => res.success === true),
        actual: results.map(({ actual: value }) => value),
    }
}

/**
 * Modern multiple element comparison strategy.
 *
 * Handles element arrays consistently:
 * - By default, if there is no element or an empty array, it returns a failure result.
 * - For a standard successful result, all elements must pass the compare strategy.
 * - For `.not` assertions, it ensures that all elements fail the compare strategy to pass.
 *
 * In rare cases (e.g., matchers using `isExisting`), the strategy can be configured via
 * `allowEmptyElements` to let an empty element set pass the assertion instead of failing.
 */
export const multipleElementResultsStrategy = async <Actual, Expected>(
    unresolvedElements: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements | unknown,
    expectedValues: MaybeArrayOrMultiRemoteValues<Expected> | undefined,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>,
    { isNot, isSome, iteration }: { isNot: boolean; isSome: boolean; iteration: number },
    { allowEmptyElements = false, allowArrayWithSingleElement = false, allowObjectExpectedValue = false } = {}
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValues<Actual>>> => {
    const { selector, other, multiRemoteSelector } = await awaitElementOrArray(unresolvedElements)

    // Only these arrays can be refetched: a plain `MultiRemoteElement[]` best effort through its elements' selector
    const isRefetchable = isStrictlyElementArray(selector) || isMultiRemoteElementArray(selector) || isMultiRemoteElements(selector)

    let currentElements: unknown = selector
    if (iteration > 0 && (isStrictlyElementArray(selector) || isMultiRemoteElementsLike(selector))) {
        // WARNING: This synchronize the element's array with the latest refetched elements and so altering selector state!
        // Except for an empty best-effort refetch, returned without being synchronized to keep refetching.
        currentElements = await refreshElementArray(selector)
    }

    const subject = multiRemoteSelector ?? selector ?? other

    // --- Empty / no element case ---
    if (!currentElements || (Array.isArray(currentElements) && currentElements.length === 0)) {
        return {
            subject,
            /**
             * Empty with no negation → retry (false).
             * Empty + .not + default matchers → terminal failure (true): nothing to compare against.
             * Empty + .not.toExist() → pass immediately (false): no element means it doesn't exist.
             */
            success: isNot ? !allowEmptyElements : false,
            actual: undefined,
            // Abort only when we cannot refetch (non-ElementArray): no point retrying a static empty array.
            abort: !allowEmptyElements && !isRefetchable,
            context: { isSome },
        }
    }

    // Multi-remote per-instance values can never match a non multi-remote element(s)
    const isUnexpectedPerInstanceValues = !multiRemoteSelector && !isMultiRemoteElementsLike(selector)
        && getPerInstanceValues(expectedValues, { allowObjectExpectedValue }) !== undefined

    // --- Single element case ---
    if (isElement(selector)) {

        // Array of expected values is unsupported for a single element in the new strict strategy.
        const forceFailure = (!allowArrayWithSingleElement && Array.isArray(expectedValues)) || isUnexpectedPerInstanceValues

        const compareResult = await singleElementCompare(selector, forceFailure ? undefined : expectedValues as MaybeArray<Expected>)
        const success = forceFailure ? !!isNot : compareResult.success

        return { subject, success, actual: compareResult.actual, abort: forceFailure, context: { isSome } }
    }

    // --- Multi-remote $() single element & $$() multiple elements cases ---
    if (multiRemoteSelector || isMultiRemoteElementsLike(selector)) {
        return multiRemoteElementsResultsStrategy<Actual, Expected>(
            subject,
            multiRemoteSelector ?? selector as WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
            expectedValues,
            singleElementCompare,
            { isNot, isSome },
            { allowArrayWithSingleElement, allowObjectExpectedValue }
        )
    }

    // --- Multiple elements $$() case ---
    // `selector` is a plain element array here: the multi-remote cases above already handled both a bare `MultiRemoteElement` and `isMultiRemoteElementsLike`.
    const elementsSelector = selector as WdioElements
    const lengthMismatch = Array.isArray(expectedValues) && expectedValues.length !== elementsSelector.length

    if (isUnexpectedPerInstanceValues) {
        const results = await Promise.all(Array.from(elementsSelector).map((element, index) => singleElementCompare(element, undefined, index)))
        return { subject, success: !!isNot, abort: true, actual: results.map(({ actual }) => actual), context: { isSome } }
    }

    const settled = await Promise.allSettled(
        Array.from(elementsSelector).map(async (element: WebdriverIO.Element, index: number) => {
            const indexedExpected = Array.isArray(expectedValues) ? expectedValues[index] : expectedValues
            /**
             * Force per-element failure when: expected is a nested array (unsupported) or this index
             * is beyond the expected array bounds. Still call compare to get the actual value for the
             * error message, but ignore its success.
             */
            const forceElementFailure = Array.isArray(indexedExpected)
                || (lengthMismatch && Array.isArray(expectedValues) && index >= expectedValues.length)

            const compareResult = await singleElementCompare(element, forceElementFailure ? undefined : indexedExpected as MaybeArray<Expected>, index)
            return forceElementFailure ? { success: false, actual: compareResult.actual } : compareResult
        })
    )

    const firstRejection = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (firstRejection) {throw firstRejection.reason}

    const results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<Actual>>).value)

    // Pad actuals for display when expected has more entries than actual elements.
    if (Array.isArray(expectedValues) && expectedValues.length > elementsSelector.length) {
        results.push(...Array(expectedValues.length - elementsSelector.length).fill({ success: false, actual: undefined }))
    }

    const actual = results.map(({ actual }) => actual)

    /**
     * Length mismatch is an immediate structural failure (positive) / pass (.not): no need to
     * evaluate element results — the arrays can never match as-is.
     */
    if (lengthMismatch) {
        return { subject, success: !!isNot, actual, context: { isSome } }
    }

    return { subject, success: computeSuccess([results], { isNot, isSome }), actual, context: { isSome } }
}

/**
 * Multi-remote strict strategy, for a `$()` single element or a `$$()` array (plain `MultiRemoteElement[]` or
 * `MultiRemoteElementArray`, whose items are `MultiRemoteElement` at runtime in both cases).
 *
 * Every instance is compared on its own elements (WebdriverIO zips `$$()` results by index, so instances may have
 * found a different number of elements) against either one expected value shared by all instances or one expected
 * value per instance. Structural errors fail with and without `.not` (`success: isNot`) while still comparing what we
 * can so the failure message shows every available actual value:
 * - per-instance values that do not name exactly the instances, or an unsupported array: can never pass, so abort;
 * - an expected array whose length differs from the instance's element count: elements may change, so keep retrying.
 */
const multiRemoteElementsResultsStrategy = async <Actual, Expected>(
    subject: unknown,
    multiRemoteSelector: WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
    expectedValues: MaybeArrayOrMultiRemoteValues<Expected> | undefined,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>,
    { isNot, isSome }: { isNot: boolean; isSome: boolean },
    { allowArrayWithSingleElement, allowObjectExpectedValue }: { allowArrayWithSingleElement: boolean, allowObjectExpectedValue: boolean }
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValues<Actual>>> => {
    const isSingleElement = isMultiRemoteElement(multiRemoteSelector)
    const multiRemoteElements = isSingleElement ? [multiRemoteSelector] : multiRemoteSelector as WebdriverIO.MultiRemoteElement[]
    const { instances } = multiRemoteElements[0]
    const elementsPerInstance = getElementsPerInstance(multiRemoteElements, instances)

    const perInstanceValues = getPerInstanceValues(expectedValues, { allowObjectExpectedValue })
    // A single expected value is shared by every instance
    const expectedPerInstance: MultiRemoteValues<unknown> = perInstanceValues ?? Object.fromEntries(instances.map((name) => [name, expectedValues]))
    const instanceNamesMismatch = !!perInstanceValues && !hasSameInstanceNames(perInstanceValues, instances)

    // For $(), an array is only supported by matchers comparing a single element against an array (e.g. classes)
    const unsupportedArray = isSingleElement && !allowArrayWithSingleElement && Object.values(expectedPerInstance).some(Array.isArray)
    // For $$(), an expected array must have one entry per element of that instance
    const lengthMismatch = !isSingleElement && instances.some((name) => {
        const value = expectedPerInstance[name]
        return Array.isArray(value) && value.length !== elementsPerInstance[name].length
    })

    const actualPerInstance: MultiRemoteValuesWithArray<Actual> = {}
    const resultsPerInstance = await Promise.all(instances.map(async (instance) => {
        const isExpected = instance in expectedPerInstance
        const instanceValue = expectedPerInstance[instance]
        const elements = elementsPerInstance[instance]

        const results = await Promise.all(elements.map(async (element, index) => {
            const indexedExpected = isSingleElement || !Array.isArray(instanceValue) ? instanceValue : instanceValue[index]
            // Force per-element failure when: no expected value for this instance/index, or nested array (unsupported). Still compare to get the actual value.
            const forceElementFailure = !isExpected || unsupportedArray
                || (!isSingleElement && Array.isArray(instanceValue) && (index >= instanceValue.length || Array.isArray(indexedExpected)))

            const elementExpected = forceElementFailure ? undefined : indexedExpected as MaybeArray<Expected>
            const result = isSingleElement ? await singleElementCompare(element, elementExpected) : await singleElementCompare(element, elementExpected, index)
            return forceElementFailure ? { success: false, actual: result.actual } : result
        }))

        const actuals = results.map(({ actual }) => actual)
        if (isSingleElement) {
            actualPerInstance[instance] = actuals[0]
        } else {
            // Pad for display when that instance expects more entries than it has elements
            const expectedLength = Array.isArray(instanceValue) ? instanceValue.length : 0
            actualPerInstance[instance] = [...actuals, ...Array(Math.max(expectedLength - actuals.length, 0)).fill(undefined)]
        }
        return results
    }))

    // Expected as displayed in the failure message, per instance, and for $$() one entry per element
    const expected = isSingleElement ? expectedPerInstance : Object.fromEntries(Object.entries(expectedPerInstance).map(([name, value]) => {
        const count = elementsPerInstance[name]?.length ?? 0
        return [name, Array.isArray(value) || isArrayContainingMatcher(value) ? value : Array(Math.max(count, 1)).fill(value)]
    }))

    if (instanceNamesMismatch || unsupportedArray) {
        return { subject, success: !!isNot, abort: true, actual: actualPerInstance, context: { isSome }, expected }
    }
    if (lengthMismatch) {
        return { subject, success: !!isNot, actual: actualPerInstance, context: { isSome }, expected }
    }

    return { subject, success: computeSuccess(resultsPerInstance, { isNot, isSome }), actual: actualPerInstance, context: { isSome }, expected }
}

/**
 * Every group (all elements, or one group per multi-remote instance) must be non-empty and pass the check:
 * all elements pass, or with `some()` at least one element per group passes. With `.not`, the same applies to failing
 * elements and the returned `success` is inverted, since Jest inverts it again afterwards.
 */
const computeSuccess = (groups: CompareResult<unknown>[][], { isNot, isSome }: { isNot: boolean, isSome: boolean }): boolean => {
    const checkFn    = isSome ? isAtLeastOneTrue  : isAllTrue
    const checkNotFn = isSome ? isAtLeastOneFalse : isAllFalse

    const isNotEmpty = groups.length > 0 && groups.every((results) => results.length > 0)
    const assertionPasses = isNotEmpty && groups.every((results) => isNot ? checkNotFn(results) : checkFn(results))

    return isNot ? !assertionPasses : assertionPasses
}

const isAllTrue = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.success === true)
const isAllFalse = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.success === false)
const isAtLeastOneTrue = (results: CompareResult<unknown>[]): boolean => results.some((res) => res.success === true)
const isAtLeastOneFalse = (results: CompareResult<unknown>[]): boolean => results.some((res) => res.success === false)

