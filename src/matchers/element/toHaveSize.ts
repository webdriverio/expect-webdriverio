import type { RectReturn } from '@wdio/protocols'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareObject,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray,
} from '../../utils.js'
import type { AssertionResult, CommandOptions, NumberMatcher as PublicNumberMatcher } from '../../publicTypes/options.js'
import { isNumber, validateNumberMatcher } from '../../util/numberOptionsUtil.js'
import { isMultiRemoteMatcher } from '../../util/multiRemoteUtils.js'
import { multiRemote } from '../asymmetrics/multiRemote.js'
import { isAsymmetricMatcher } from '../../util/asymmetricMatcherUtil.js'

export type Size = Pick<RectReturn, 'width' | 'height'>
/** A number or a `NumberMatcher` for each field, or an asymmetric matcher, e.g. `expect.objectContaining()` */
type ExpectedSize = { width: number | PublicNumberMatcher, height: number | PublicNumberMatcher } | AsymmetricMatcher<unknown>

const SIZE_FIELDS = ['width', 'height']

/** A size: a plain object or a class instance, not an asymmetric matcher (e.g. `expect.objectContaining()`) */
const isSizeObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value) && !isAsymmetricMatcher(value)

/**
 * A field, as the value of `toHaveWidth`: a number stays as is, and `validateNumberMatcher()` takes the rest: a range,
 * `expect.oneOf()` with numbers and an asymmetric matcher become a `NumberMatcher`, and another value throws, e.g. a string,
 * `NaN` or a list matcher
 */
const withNumberMatcher = (value: unknown): unknown =>
    isNumber(value) ? value : validateNumberMatcher(value as PublicNumberMatcher)

/**
 * A number range on a field, e.g. `{ width: { gte: 50 }, height: 50 }`, becomes a `NumberMatcher`, as in `toHaveWidth`:
 * in one size, in the sizes of `$$()`, and in the values of `expect.multiRemote()`
 */
const withNumberMatcherFields = (expected: unknown): unknown => {
    if (Array.isArray(expected)) {
        return expected.map(withNumberMatcherFields)
    }
    if (isMultiRemoteMatcher(expected)) {
        return multiRemote(Object.fromEntries(Object.entries(expected.sample).map(([name, value]) => [name, withNumberMatcherFields(value)])))
    }
    if (isSizeObject(expected)) {
        return Object.fromEntries(Object.entries(expected).map(([field, value]) =>
            [field, SIZE_FIELDS.includes(field) ? withNumberMatcher(value) : value]))
    }
    return expected
}
async function condition(el: WebdriverIO.Element, size: Size | undefined): Promise<CompareResult<Size | null>> {
    const actualSize = await el.getSize()

    return compareObject(actualSize, size)
}

/**
 * Element $()
 */
export async function toHaveSize(
    received: WdioElementMaybePromise,
    expectedValue: ExpectedSize,
    options?: CommandOptions
): Promise<AssertionResult>

/**
 * Elements $$()
 */
export async function toHaveSize(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<ExpectedSize>,
    options?: CommandOptions
): Promise<AssertionResult>

/**
 * Multi-remote $() or $$(): one size for every instance, or one size per instance with `expect.multiRemote()`
 * (a plain object is always a literal size)
 */
export async function toHaveSize(
    received: WdioMultiRemoteElements,
    expectedValue: MaybeArray<ExpectedSize> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<ExpectedSize>>,
    options?: CommandOptions
): Promise<AssertionResult>

export async function toHaveSize(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<ExpectedSize> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<ExpectedSize>>,
    options: CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'size', verb = 'have', isNot, matcherName = 'toHaveSize' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedSize = withNumberMatcherFields(expectedValue)

    const { success: pass, actual: actualSize, subject: el, context: { isSome, matchingIndexes } = {}, expected } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedSize,
                singleElementCompare: (element, size: Size | undefined) => condition(element, size),
                context: { isNot, iteration },
                strictConfiguration: { allowObjectExpectedValue: true }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        expected ?? wrapExpectedWithArray(el, actualSize, expectedSize),
        actualSize,
        { isNot, isSome, matchingIndexes },
        verb,
        expectation,
        '',
        options
    )

    const result: AssertionResult = {
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
