import { equals } from '../jasmineUtils.js'
import { isListMatcher } from './asymmetricMatcherUtil.js'
import { isSomeWrapper } from '../matchers/modifiers/some.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, MaybeArray, WdioElements, WdioMultiRemoteElements, MaybeArrayOrMultiRemoteValuesWithArray, MultiRemoteValuesWithArray } from '../types.js'
import { awaitElementOrArray, isElement, isMultiRemoteElement, isMultiRemoteElementArray, isStrictlyElementArray } from './elementsUtil.js'
import { getElementsPerInstance, getPerInstanceValues, hasSameInstanceNames } from './multiRemoteUtils.js'
import { refreshElementArray } from './refetchElements.js'

export type CompareResult<Actual> = {
    success: boolean
    actual: Actual
    /** The value that the matcher compared, after the string options (`trim`, `ignoreCase`, `replace`), if it is one value */
    compared?: unknown
}
export type MultiRemoteCompareResult<Actual> = { success: boolean; actual: Actual, multiRemoteBrowserName: string }
export type StrategyResult<Actual, Subject = WebdriverIO.Element | WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Browser | unknown, Expected = unknown> = {
    subject: Subject;
    expected?: Expected;
    abort?: boolean;
    /**
     * - isSome: `some()` was used
     * - matchingIndexes: for `$$()`, the indexes of the elements that matched, with the matcher's own comparison
     *   (string options, each class...): the failure message of `.not` highlights them
     */
    context?: { isSome: boolean, matchingIndexes?: number[] };
    /**
     * Whether each element or instance matched, with the matcher's own comparison, in the shape of `actual`: a boolean
     * for one element or browser, an array for `$$()`, per-instance values for multi-remote. Not set on a structural
     * failure. The failure message uses it to show an element that passed as no difference.
     */
    verdict?: unknown;
} & CompareResult<Actual | MultiRemoteValues<Actual> | undefined>

/**
 * Fetch element(s) and route them to the appropriate comparison strategy.
 *
 * @param unresolvedElements awaited or non-awaited element(s) to be resolved and compared
 * @param singleElementCompare compare a single element with expected value(s)
 * @param isNot indicates if the assertion is inverted (e.g., using `.not`)
 * @param configuration configuration options for the strategy
 * @returns An object containing the subject, success status, actual values, and results of the comparison
 */
export async function executeCommandWithStrategy<Actual, Expected>( {
    unresolvedElements,
    expectedValues,
    singleElementCompare,
    context: { isNot = false, iteration },
    supportsArrayContaining = false,
    strictConfiguration = { allowEmptyElements: false }
} :{
    unresolvedElements: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements | unknown
    expectedValues: MaybeArrayOrMultiRemoteValues<Expected> | unknown
    // A method signature, so its parameters stay bivariant: each matcher types the expected value it compares
    singleElementCompare(awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number): Promise<CompareResult<Actual>>
    context: { isNot?: boolean, iteration: number },
    /** Compare collection snapshots using singleElementCompare(element, undefined). 'arrayOnly' rejects scalar subjects. */
    supportsArrayContaining?: boolean | 'arrayOnly',
    /**
     * - allowEmptyElements: an empty element set passes instead of failing (e.g. `.not.toExist()`)
     * - allowObjectExpectedValue: the expected value itself can be a plain object (e.g. styles), so for multi-remote a plain
     *   object is always a literal and per-instance values require `expect.multiRemote()`
     */
    strictConfiguration?: { allowEmptyElements?: boolean, allowObjectExpectedValue?: boolean }
}
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> {
    const isSome = isSomeWrapper(unresolvedElements)
    const actualReceived = isSome ? unresolvedElements.elements : unresolvedElements

    if (supportsArrayContaining && !isSome && isListMatcher(expectedValues)) {
        return arrayContainingStrategy(unresolvedElements, expectedValues, singleElementCompare, { isNot, iteration }, supportsArrayContaining)
    }

    return multipleElementResultsStrategy(actualReceived, expectedValues as MaybeArrayOrMultiRemoteValues<Expected> | undefined, singleElementCompare, { isNot, isSome, iteration }, strictConfiguration)
}

type SingleElementCompare<Actual, Expected> = (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>

/**
 * `arrayContaining` compares the values of all the elements at once (`equals(actual, expected)`), not each element:
 * - an empty `$$()` can pass, e.g. `arrayContaining([])`;
 * - `.not` comes only from `equals`, not from the elements;
 * - for `$()`, it compares an array-valued property of one element, unless `arrayOnly`.
 */
const arrayContainingStrategy = async <Actual, Expected>(
    unresolvedElements: unknown,
    expectedValues: unknown,
    singleElementCompare: SingleElementCompare<Actual, Expected>,
    { isNot, iteration }: { isNot: boolean, iteration: number },
    supportsArrayContaining: true | 'arrayOnly'
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> => {
    const { selector, elements, other } = await awaitElementOrArray(unresolvedElements)
    if (isMultiRemoteElementArray(elements)) {
        return multiRemoteArrayContainingStrategy(elements, expectedValues, singleElementCompare, iteration)
    }
    if (elements) {
        const actual = await compareWithoutExpected(await refreshOnRetry(elements, iteration), singleElementCompare)
        return {
            subject: elements,
            actual,
            success: equals(actual, expectedValues),
            abort: elements.length === 0 && !isStrictlyElementArray(elements),
        }
    }
    if (!isElement(selector) || supportsArrayContaining === 'arrayOnly') {
        return { subject: selector ?? other, actual: undefined, success: isNot, abort: true }
    }
    // A scalar element may itself have an array-valued property.
    // SAFETY: Opted-in matchers accept asymmetric expectations; only the collection's sample type differs from Expected.
    return { subject: selector, ...await singleElementCompare(selector, expectedValues as MaybeArray<Expected>) }
}

/**
 * `arrayContaining` on a multi-remote `$$()`: every instance's own collection of values must satisfy it.
 */
const multiRemoteArrayContainingStrategy = async <Actual, Expected>(
    elements: WebdriverIO.MultiRemoteElementArray,
    expectedValues: unknown,
    singleElementCompare: SingleElementCompare<Actual, Expected>,
    iteration: number
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> => {
    const currentElements = await refreshOnRetry(elements, iteration)

    if (currentElements.length === 0) {
        // See empty case of `multipleElementResultsStrategy`: retry, the elements are fetched again
        return { subject: elements, actual: undefined, success: false }
    }

    const { instances } = currentElements.parent
    const elementsPerInstance = getElementsPerInstance(currentElements, instances)
    const actual: MultiRemoteValues<Actual[]> = Object.fromEntries(await Promise.all(instances.map(async (instance) => {
        return [instance, await compareWithoutExpected(elementsPerInstance[instance], singleElementCompare)]
    })))

    return {
        subject: elements,
        actual,
        success: instances.every((instance) => equals(actual[instance], expectedValues)),
        expected: Object.fromEntries(instances.map((instance) => [instance, expectedValues])),
    }
}

/**
 * The value of each element, for the strategies that compare the whole collection.
 * Reuses each matcher's value extraction, including command-specific options. The error of the first element that
 * throws is thrown, in the order of the elements.
 */
const compareWithoutExpected = async <Actual, Expected>(
    elements: ArrayLike<WebdriverIO.Element>,
    singleElementCompare: SingleElementCompare<Actual, Expected>
): Promise<Actual[]> => {
    const settled = await Promise.allSettled(Array.from(elements).map((element, index) => singleElementCompare(element, undefined, index)))
    return settled.map((result) => {
        if (result.status === 'rejected') {
            throw result.reason
        }
        return result.value.actual
    })
}

/**
 * On a retry, fetch the elements of a `$$()` again.
 * WARNING: the element array is synchronized in place with the new elements, so the user's array changes!
 * A plain array cannot be fetched again, so it does not change.
 */
const refreshOnRetry = async <T>(elements: T, iteration: number): Promise<T> => {
    if (iteration > 0 && (isStrictlyElementArray(elements) || isMultiRemoteElementArray(elements))) {
        return await refreshElementArray(elements) as T
    }
    return elements
}

/**
 * Multiple element comparison strategy.
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
    singleElementCompare: SingleElementCompare<Actual, Expected>,
    { isNot, isSome, iteration }: { isNot: boolean; isSome: boolean; iteration: number },
    { allowEmptyElements = false, allowObjectExpectedValue = false } = {}
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValues<Actual>>> => {
    const { selector, other, multiRemoteSelector } = await awaitElementOrArray(unresolvedElements)

    // Only these arrays can be refetched
    const isRefetchable = isStrictlyElementArray(selector) || isMultiRemoteElementArray(selector)
    const currentElements: unknown = await refreshOnRetry(selector, iteration)

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
    const isUnexpectedPerInstanceValues = !multiRemoteSelector && !isMultiRemoteElementArray(selector)
        && getPerInstanceValues(expectedValues, { allowObjectExpectedValue }) !== undefined

    // --- Single element case ---
    if (isElement(selector)) {

        // An array of expected values is not supported for a single element: it fails the assertion, as in every matcher
        const forceFailure = Array.isArray(expectedValues) || isUnexpectedPerInstanceValues

        const compareResult = await singleElementCompare(selector, forceFailure ? undefined : expectedValues as MaybeArray<Expected>)
        const success = forceFailure ? !!isNot : compareResult.success

        return { subject, success, actual: compareResult.actual, abort: forceFailure, context: { isSome }, verdict: forceFailure ? undefined : compareResult.success, compared: forceFailure ? undefined : compareResult.compared }
    }

    // --- Multi-remote $() single element & $$() multiple elements cases ---
    if (multiRemoteSelector || isMultiRemoteElementArray(selector)) {
        return multiRemoteElementsResultsStrategy<Actual, Expected>(
            subject,
            multiRemoteSelector ?? selector as WebdriverIO.MultiRemoteElementArray,
            expectedValues,
            singleElementCompare,
            { isNot, isSome },
            { allowObjectExpectedValue }
        )
    }

    // --- Multiple elements $$() case ---
    // `selector` is a plain element array here: the multi-remote cases above already handled a `MultiRemoteElement` and a `MultiRemoteElementArray`.
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
    const matchingIndexes = results.flatMap(({ success }, index) => success ? [index] : [])
    const verdict = results.map(({ success }) => success)
    if (lengthMismatch) {
        return { subject, success: !!isNot, actual, context: { isSome, matchingIndexes }, verdict }
    }

    return { subject, success: computeSuccess([results], { isNot, isSome }), actual, context: { isSome, matchingIndexes }, verdict }
}

/**
 * Multi-remote strict strategy, for a `$()` single element or a `$$()` array (`MultiRemoteElementArray`, whose items
 * are `MultiRemoteElement` at runtime).
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
    multiRemoteSelector: WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElementArray,
    expectedValues: MaybeArrayOrMultiRemoteValues<Expected> | undefined,
    singleElementCompare: SingleElementCompare<Actual, Expected>,
    { isNot, isSome }: { isNot: boolean; isSome: boolean },
    { allowObjectExpectedValue }: { allowObjectExpectedValue: boolean }
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValues<Actual>>> => {
    const isSingleElement = isMultiRemoteElement(multiRemoteSelector)
    const instances = isSingleElement ? multiRemoteSelector.instances : multiRemoteSelector.parent.instances
    const elementsPerInstance = getElementsPerInstance(isSingleElement ? [multiRemoteSelector] : multiRemoteSelector, instances)

    const perInstanceValues = getPerInstanceValues(expectedValues, { allowObjectExpectedValue })
    // A single expected value is shared by every instance
    const expectedPerInstance: MultiRemoteValues<unknown> = perInstanceValues ?? Object.fromEntries(instances.map((name) => [name, expectedValues]))
    const instanceNamesMismatch = !!perInstanceValues && !hasSameInstanceNames(perInstanceValues, instances)

    // For $(), an array is not supported: it fails the assertion, as for a single element of one browser
    const unsupportedArray = isSingleElement && Object.values(expectedPerInstance).some(Array.isArray)
    // For $$(), an expected array must have one entry per element of that instance
    const lengthMismatch = !isSingleElement && instances.some((name) => {
        const value = expectedPerInstance[name]
        return Array.isArray(value) && value.length !== elementsPerInstance[name].length
    })

    const actualPerInstance: MultiRemoteValuesWithArray<Actual> = {}
    const verdictPerInstance: MultiRemoteValues<boolean | boolean[]> = {}
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
            verdictPerInstance[instance] = results[0]?.success
        } else {
            // Pad for display when that instance expects more entries than it has elements
            const padding = Math.max((Array.isArray(instanceValue) ? instanceValue.length : 0) - actuals.length, 0)
            actualPerInstance[instance] = [...actuals, ...Array(padding).fill(undefined)]
            verdictPerInstance[instance] = [...results.map(({ success }) => success), ...Array(padding).fill(false)]
        }
        return results
    }))

    // Expected as displayed in the failure message, per instance, and for $$() one entry per element
    const expected = isSingleElement ? expectedPerInstance : Object.fromEntries(Object.entries(expectedPerInstance).map(([name, value]) => {
        const count = elementsPerInstance[name]?.length ?? 0
        return [name, Array.isArray(value) || isListMatcher(value) ? value : Array(Math.max(count, 1)).fill(value)]
    }))

    if (instanceNamesMismatch || unsupportedArray) {
        return { subject, success: !!isNot, abort: true, actual: actualPerInstance, context: { isSome }, expected }
    }
    if (lengthMismatch) {
        return { subject, success: !!isNot, actual: actualPerInstance, context: { isSome }, expected, verdict: verdictPerInstance }
    }

    return { subject, success: computeSuccess(resultsPerInstance, { isNot, isSome }), actual: actualPerInstance, context: { isSome }, expected, verdict: verdictPerInstance }
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

