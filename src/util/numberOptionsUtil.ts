import { AsymmetricMatcher } from 'expect'
import { isMultiRemoteMatcher } from './multiRemoteUtils.js'

export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value)
export const isDefinedNotNumber = (value: unknown) => value !== undefined && !isNumber(value)
export const isDefinedNumberOrNonEmptyObject = (value: unknown): value is NonNullable<number | object> => typeof value === 'number' || (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0)

const NUMBER_MATCHER_KEYS = ['eq', 'gte', 'lte']

/**
 * Turn a number or a `NumberMatcher` into a `NumberMatcher` instance.
 * If `supportDefaultAsGteThen1` is true, `undefined` is treated as `{ gte: 1 }`.
 */
export function validateNumberMatcher(
    expectedValue: number | ExpectWebdriverIO.NumberMatcher | undefined,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): NumberMatcher {
    if (supportDefaultAsGteThen1 && expectedValue === undefined) {
        return new NumberMatcher({ gte: 1 })
    }
    if (isNumber(expectedValue)) {
        return new NumberMatcher({ eq: expectedValue })
    }
    if (
        !isDefinedNumberOrNonEmptyObject(expectedValue)
            || Object.keys(expectedValue).some((key) => !NUMBER_MATCHER_KEYS.includes(key))
            || isDefinedNotNumber(expectedValue.eq) || isDefinedNotNumber(expectedValue.gte) || isDefinedNotNumber(expectedValue.lte)
            || (expectedValue.eq === undefined && expectedValue.gte === undefined && expectedValue.lte === undefined)
    ) {
        throw new Error(`Invalid NumberMatcher. Received: ${JSON.stringify(expectedValue)}`)
    }

    const { eq, gte, lte } = expectedValue

    if (isNumber(gte) && isNumber(lte) && gte > lte) {
        throw new Error(`Invalid NumberMatcher range: 'gte' (${gte}) cannot be greater than 'lte' (${lte}).`)
    }

    return new NumberMatcher({ eq, gte, lte })
}

export function validateNumberMatcherArray(
    expectedValues: MaybeArray<number | ExpectWebdriverIO.NumberMatcher>
        | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>> | undefined,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): MaybeArray<NumberMatcher> | MultiRemoteValues<MaybeArray<NumberMatcher>> {
    // Per-instance numbers require `expect.multiRemote()`: a plain object is always a `NumberMatcher`
    if (isMultiRemoteMatcher(expectedValues)) {
        const perInstanceValues = expectedValues.sample as MultiRemoteValues<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>
        return Object.fromEntries(Object.entries(perInstanceValues).map(([instance, value]) =>
            [instance, validateNumberMatcherArray(value) as MaybeArray<NumberMatcher>]
        ))
    }
    if (Array.isArray(expectedValues)) {
        return expectedValues.map((value) => validateNumberMatcher(value, { supportDefaultAsGteThen1 }))
    }
    return validateNumberMatcher(expectedValues as number | ExpectWebdriverIO.NumberMatcher | undefined, { supportDefaultAsGteThen1 })
}

/**
 * Using a class to univerally handle number matching and stringification the same way everywhere and with Global Apis like equal() toString() and toJSON()
 */
export class NumberMatcher extends AsymmetricMatcher<number | ExpectWebdriverIO.NumberMatcher> {

    public sample: number | ExpectWebdriverIO.NumberMatcher
    constructor(sample: number | ExpectWebdriverIO.NumberMatcher) {
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
