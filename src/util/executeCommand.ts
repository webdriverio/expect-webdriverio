import { isSomeWrapper } from '../matchers/modifiers/some.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, MaybeArray, WdioMultiRemoteElements, MaybeArrayOrMultiRemoteValuesWithArray, MultiRemoteValuesWithArray } from '../types.js'
import { awaitElementOrArray, isElement, isMultiRemoteElementLike, isMultiRemoteElements, isMultiRemoteElementsLike, isStrictlyElementArray } from './elementsUtil.js'
import { isMultiRemoteValues } from './multiRemoteUtils.js'
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
    strictConfiguration = { allowEmptyElements: false, allowArrayWithSingleElement: false }
} :{
    unresolvedElements: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements | unknown
    expectedValues: MaybeArrayOrMultiRemoteValues<Expected> | unknown
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected>, index?: number) => Promise<CompareResult<Actual>>
    context: { isNot: boolean, iteration: number },
    strategy?: StrategyType,
    strictConfiguration?: { allowEmptyElements?: boolean, allowArrayWithSingleElement?: boolean }
}
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValuesWithArray<Actual>>> {
    const isSome = isSomeWrapper(unresolvedElements)

    if (strategy === 'LegacyLooseMultipleElements') {
        if (isSome) {
            throw new Error('some(elements) works only when enabling `useToHaveTextStrictMultiElementsCompareStrategy`')
        } else if (isMultiRemoteElements(unresolvedElements)) {
            throw new Error('Multi-remote elements works only when enabling `useToHaveTextStrictMultiElementsCompareStrategy`')
        }
        return legacyMultipleElementResultsStrategy(unresolvedElements, expectedValues, singleElementCompare, isNot)
    }

    const actualReceived = isSome ? unresolvedElements.elements : unresolvedElements

    // Default new strategy for single & multiple element results, which is more consistent and less ambigious than the legacy strategy.
    return multipleElementResultsStrategy(actualReceived, expectedValues, singleElementCompare, { isNot, isSome, iteration }, strictConfiguration)
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
    const subject = selector ?? other
    if (!selector || isEmptyElements || isMultiRemoteElementLike(selector)) {
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
    { allowEmptyElements = false, allowArrayWithSingleElement = false } = {}
): Promise<StrategyResult<MaybeArrayOrMultiRemoteValues<Actual>>> => {
    const { selector, other, multiRemoteSelector } = await awaitElementOrArray(unresolvedElements)

    if (iteration > 0 && (isStrictlyElementArray(selector) || isMultiRemoteElementsLike(selector))) {
        // TODO dprevost adapt for Multi-remote?
        // WARNING: This synchronize the element's array with the latest refetched elements and so altering selector state!
        await refreshElementArray(selector)
    }

    const subject = multiRemoteSelector ?? selector ?? other

    // --- Empty / no element case ---
    if (!selector || (Array.isArray(selector) && selector.length === 0)) {
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
            abort: !allowEmptyElements && !isStrictlyElementArray(selector),
            context: { isSome },
        }
    }

    // --- Single element case ---
    if (isElement(selector)) {

        // Array of expected values is unsupported for a single element in the new strict strategy.
        const forceFailure = !allowArrayWithSingleElement && Array.isArray(expectedValues)

        const compareResult = await singleElementCompare(selector, forceFailure ? undefined : expectedValues as MaybeArray<Expected>)
        const success = forceFailure ? !!isNot : compareResult.success

        return { subject, success, actual: compareResult.actual, abort: forceFailure, context: { isSome } }
    }

    // --- Multiple elements & Multi-remote element(s) case ---
    const lengthMismatch = Array.isArray(expectedValues) && expectedValues.length !== selector.length

    let results: CompareResult<Actual>[] = []

    let multiRemoteActual: MultiRemoteValuesWithArray<Actual> | undefined
    let multiRemoteExpected: MultiRemoteValues<Expected> | undefined
    // --- Multi-remote $() single element case ---
    if (multiRemoteSelector && !Array.isArray(expectedValues)) {
        multiRemoteActual = {}

        // eslint-disable-next-line unicorn/prefer-ternary
        if (isMultiRemoteValues(expectedValues, multiRemoteSelector.instances)) {
            multiRemoteExpected = expectedValues
        } else {
            multiRemoteExpected = multiRemoteSelector.instances.reduce((acc, instance) => {
                acc[instance] = expectedValues as Expected
                return acc
            }, {} as MultiRemoteValues<Expected>)
        }

        results = await Promise.all(
            Object.keys(multiRemoteExpected).map(async (instance) => {
                if (!multiRemoteExpected)  {throw new Error('multiRemoteExpected is undefined')}

                const expectValue = multiRemoteExpected[instance]

                // TODO: non-existing multi-remote element should probably be a element with error and not to throw??
                let element: WebdriverIO.Element
                try {
                    element = multiRemoteSelector.getInstance(instance)
                } catch (error) {
                    if (error instanceof Error && error.message.includes('Multiremote object has no instance named')) {
                        if (!multiRemoteActual) {throw new Error('multiRemoteActual is undefined')}
                        multiRemoteActual[instance] = undefined as Actual

                        return { success: false, actual: undefined as Actual }
                    }
                    throw error
                }

                const result = await singleElementCompare(element, expectValue as Expected)
                if (!multiRemoteActual) {throw new Error('multiRemoteActual is undefined')}
                multiRemoteActual[instance] = result.actual
                return result
            })
        )
    } else if (isMultiRemoteElementsLike(selector)) { // TODO dprevost we need to support MultiRemoteElementArray
        // --- Multi-remote $$() multiple elements case ---
        multiRemoteActual = {}
        // Await is required of the asynchronous forEach of MultiRemoteElementArray
        await selector.forEach(async (element, index) => {
            element = element as WebdriverIO.MultiRemoteElement
            const instanceResults = await Promise.all(
                element.instances.map(async (instance) => {
                    if (!multiRemoteActual) { throw new Error('multiRemoteActual is undefined') }
                    if (!multiRemoteActual[instance])  { multiRemoteActual[instance] = [] }
                    const typedActual = multiRemoteActual[instance] as Actual[]

                    let elementInstance: WebdriverIO.Element
                    try {
                        elementInstance = element.getInstance(instance)
                    } catch (error) {
                        if (error instanceof Error && error.message.includes('Multiremote object has no instance named')) {
                            if (!multiRemoteActual) {throw new Error('multiRemoteActual is undefined')}
                            typedActual.push(undefined as Actual)

                            return { success: false, actual: undefined as Actual }
                        }
                        throw error
                    }

                    const instanceValue = isMultiRemoteValues(expectedValues, element.instances) ? expectedValues[instance] : expectedValues
                    const indexedExpected = Array.isArray(instanceValue) ? instanceValue[index] : instanceValue

                    const result = await singleElementCompare(elementInstance, indexedExpected, index)
                    typedActual.push(result.actual)
                    return  result
                })
            )
            results.push(...instanceResults)
        })
    } else {
        // --- Multiple elements $$() case ---
        const settled = await Promise.allSettled(
            Array.from(selector).map(async (element: WebdriverIO.Element, index: number) => {
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

        results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<Actual>>).value)
    }

    // Pad actuals for display when expected has more entries than actual elements.
    if (Array.isArray(expectedValues) && expectedValues.length > selector.length) {
        results.push(...Array(expectedValues.length - selector.length).fill({ success: false, actual: undefined }))
    }

    /**
     * Length mismatch is an immediate structural failure (positive) / pass (.not): no need to
     * evaluate element results — the arrays can never match as-is.
     */
    if (lengthMismatch) {
        return { subject, success: !!isNot, actual: results.map(({ actual }) => actual), context: { isSome } }
    }

    const isNotEmpty = results.length > 0
    const checkFn    = isSome ? isAtLeastOneTrue  : isAllTrue
    const checkNotFn = isSome ? isAtLeastOneFalse : isAllFalse

    const success = isNot
        ? !(isNotEmpty && checkNotFn(results))
        : isNotEmpty && checkFn(results)

    return { subject, success, actual: multiRemoteActual ?? results.map(({ actual }) => actual), context: { isSome }, expected: multiRemoteExpected }
}

const isAllTrue = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.success === true)
const isAllFalse = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.success === false)
const isAtLeastOneTrue = (results: CompareResult<unknown>[]): boolean => results.some((res) => res.success === true)
const isAtLeastOneFalse = (results: CompareResult<unknown>[]): boolean => results.some((res) => res.success === false)

