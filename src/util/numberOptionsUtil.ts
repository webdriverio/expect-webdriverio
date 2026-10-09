import { AsymmetricMatcher } from 'expect'
import { isMultiRemoteMatcher } from './multiRemoteUtils.js'
import { isOneOfMatcher } from '../matchers/asymmetrics/oneOf.js'
import type { NumberMatcher as PublicNumberMatcher } from '../publicTypes/options.js'
import type { ExpectedOf } from '../publicTypes/expectWebdriverIO.js'

export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value)
export const isDefinedNotNumber = (value: unknown) => value !== undefined && !isNumber(value)
export const isDefinedNumberOrNonEmptyObject = (value: unknown): value is NonNullable<number | object> => typeof value === 'number' || (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0)

const NUMBER_MATCHER_KEYS = ['eq', 'gte', 'lte']

/**
 * Turn a number or a `NumberMatcher` into a `NumberMatcher` instance.
 * If `supportDefaultAsGteThen1` is true, `undefined` is treated as `{ gte: 1 }`.
 */
export function validateNumberMatcher(
    // The type of the public number matchers: a matcher accepts what this function compares (type tests in test-types/)
    expectedValue: ExpectedOf<'number'> | undefined,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): NumberMatcher {
    if (supportDefaultAsGteThen1 && expectedValue === undefined) {
        return new NumberMatcher({ gte: 1 })
    }
    if (isNumber(expectedValue)) {
        return new NumberMatcher({ eq: expectedValue })
    }
    // `expect.oneOf(100, 200)`: one of these numbers, which a range cannot say
    if (isOneOfMatcher(expectedValue)) {
        const { values } = expectedValue
        if (values.length === 0 || !values.every(isNumber)) {
            throw new Error(`Invalid NumberMatcher. Received: ${JSON.stringify(expectedValue)}`)
        }
        return new NumberMatcher({ oneOf: values })
    }
    // Left: a range. The type guard of `expect.oneOf()` names its class, so the public `oneOf` type stays in the union
    const range = expectedValue as PublicNumberMatcher | undefined
    if (
        !isDefinedNumberOrNonEmptyObject(range)
            || Object.keys(range).some((key) => !NUMBER_MATCHER_KEYS.includes(key))
            || isDefinedNotNumber(range.eq) || isDefinedNotNumber(range.gte) || isDefinedNotNumber(range.lte)
            || (range.eq === undefined && range.gte === undefined && range.lte === undefined)
    ) {
        throw new Error(`Invalid NumberMatcher. Received: ${JSON.stringify(expectedValue)}`)
    }

    const { eq, gte, lte } = range

    if (isNumber(gte) && isNumber(lte) && gte > lte) {
        throw new Error(`Invalid NumberMatcher range: 'gte' (${gte}) cannot be greater than 'lte' (${lte}).`)
    }

    return new NumberMatcher({ eq, gte, lte })
}

export function validateNumberMatcherArray(
    expectedValues: MaybeArray<ExpectedOf<'number'>>
        | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<ExpectedOf<'number'>>> | undefined,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): MaybeArray<NumberMatcher> | MultiRemoteValues<MaybeArray<NumberMatcher>> {
    // Per-instance numbers require `expect.multiRemote()`: a plain object is always a `NumberMatcher`
    if (isMultiRemoteMatcher(expectedValues)) {
        const perInstanceValues = expectedValues.sample as MultiRemoteValues<MaybeArray<number | PublicNumberMatcher>>
        return Object.fromEntries(Object.entries(perInstanceValues).map(([instance, value]) =>
            [instance, validateNumberMatcherArray(value) as MaybeArray<NumberMatcher>]
        ))
    }
    if (Array.isArray(expectedValues)) {
        return expectedValues.map((value) => validateNumberMatcher(value, { supportDefaultAsGteThen1 }))
    }
    return validateNumberMatcher(expectedValues as number | PublicNumberMatcher | undefined, { supportDefaultAsGteThen1 })
}

/** The bounds of a valid `PublicNumberMatcher`, after `validateNumberMatcher()` */
type NumberBounds = { eq?: number, gte?: number, lte?: number, oneOf?: number[] }

/**
 * Using a class to univerally handle number matching and stringification the same way everywhere and with Global Apis like equal() toString() and toJSON()
 */
export class NumberMatcher extends AsymmetricMatcher<number | NumberBounds> {

    public sample: number | NumberBounds
    constructor(sample: number | NumberBounds) {
        super(sample)
        this.sample = sample
    }

    asymmetricMatch(actual: number | undefined): boolean {
        if ( actual === undefined ) {
            return false
        }

        if (isNumber(this.sample)) {
            return actual === this.sample
        }

        if (this.sample.oneOf) {
            return this.sample.oneOf.includes(actual)
        }

        if (isNumber(this.sample.eq)) {
            return actual === this.sample.eq
        }

        if (isNumber(this.sample.gte) && isNumber(this.sample.lte)) {
            return actual >= this.sample.gte && actual <= this.sample.lte
        }

        if (isNumber(this.sample.gte)) {
            return actual >= this.sample.gte
        }

        if (isNumber(this.sample.lte)) {
            return actual <= this.sample.lte
        }

        return false
    }

    toAsymmetricMatcher(): string {
        if (isNumber(this.sample)) {
            return `${this.sample}`
        }

        if (this.sample.oneOf) {
            return `oneOf<${this.sample.oneOf.join(', ')}>`
        }

        if (isNumber(this.sample.eq)) {
            return `${this.sample.eq}`
        }

        if (isNumber(this.sample.gte) && isNumber(this.sample.lte)) {
            return `>= ${this.sample.gte} && <= ${this.sample.lte}`
        }

        if (isNumber(this.sample.gte)) {
            return `>= ${this.sample.gte}`
        }

        if (isNumber(this.sample.lte))     {
            return `<= ${this.sample.lte}`
        }

        return 'Incorrect number options provided'
    }

    // Not used by default, just a fallback!
    public toString() {
        return this.toAsymmetricMatcher()
    }

    // When paired with Jasmine!
    public jasmineToString() {
        return this.toString()
    }
}
