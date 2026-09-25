import { AsymmetricMatcher } from 'expect'
import { isDefinedPlainObject } from './commandOptionsUtils.js'
import { isMultiRemoteMatcher } from './multiRemoteUtils.js'

export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value)
export const isDefinedNotNumber = (value: unknown) => value !== undefined && !isNumber(value)
export const isDefinedNumberOrNonEmptyObject = (value: unknown): value is NonNullable<number | object> => typeof value === 'number' || (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0)
/**
 * Utility to parse legacy `NumberOptions` and modern `NumberMatcher` into standard matcher
 * criteria and command options for expect-webdriverio matchers.
 *
 * If `supportDefaultAsGteThen1` is true, `undefined` is treated as `{ gte: 1 }`.
 * An empty object `{}` is also temporarily treated as `{ gte: 1 }` for backward compatibility,
 * but this behavior will be removed in a future release.
 *
 * Legacy properties extracted from `NumberOptions` take priority and are merged into
 * the final `commandOptions` object so they are not overridden by `DEFAULT_OPTIONS`.
 */
export function validateNumberAndExtractOptions(
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher | undefined,
    commandOptions: ExpectWebdriverIO.CommandOptions,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): { numberMatcher: NumberMatcher; commandOptions: ExpectWebdriverIO.CommandOptions } {
    let defaultExpectedValue: NumberMatcher | undefined = undefined
    if (supportDefaultAsGteThen1 && (expectedValue === undefined || (isDefinedPlainObject(expectedValue) && expectedValue.eq === undefined && expectedValue.gte === undefined && expectedValue.lte === undefined))) {
        defaultExpectedValue = new NumberMatcher({ gte: 1 })
    } else if (isNumber(expectedValue)) {
        return { numberMatcher: new NumberMatcher({ eq: expectedValue }), commandOptions }
    } else if (
        !isDefinedNumberOrNonEmptyObject(expectedValue) || isDefinedNotNumber(expectedValue.eq) ||  isDefinedNotNumber(expectedValue.gte) || isDefinedNotNumber(expectedValue.lte)
            || (expectedValue.eq === undefined && expectedValue.gte === undefined && expectedValue.lte === undefined)
    ) {
        throw new Error(`Invalid NumberMatcher. Received: ${JSON.stringify(expectedValue)}`)
    }

    const { eq, gte, lte, ...restCommandOptions } = expectedValue ?? {}

    if (isNumber(gte) && isNumber(lte) && gte > lte) {
        throw new Error(`Invalid NumberMatcher range: 'gte' (${gte}) cannot be greater than 'lte' (${lte}).`)
    }

    return {
        numberMatcher: defaultExpectedValue ?? new NumberMatcher({ eq, gte, lte }),
        // Ensure DEFAULT_OPTIONS are applied first, then any command options from the legacy number options.
        commandOptions: { ...commandOptions, ...restCommandOptions }
    }
}

/** Legacy `NumberOptions` keys, see `validateNumberAndExtractOptions` */
const NUMBER_OPTIONS_KEYS = ['eq', 'gte', 'lte', 'wait', 'interval', 'message', 'beforeAssertion', 'afterAssertion', 'featureFlags']

/**
 * Multi-remote: one number (or NumberMatcher, or array of them for `$$()`) per instance, as opposed to a `NumberMatcher` or
 * legacy `NumberOptions`. Either `expect.multiRemote({ chrome: 2, firefox: { gte: 1 } })` or its plain object shorthand.
 * Not relying on the instance names so that unknown or misspelled ones fail strictly instead of being misread as options.
 *
 * A plain object with only option keys is a `NumberOptions`, even if instances are named like them (e.g. `eq`): such instances
 * require `expect.multiRemote()`. An object mixing option keys and other keys is neither, so it throws instead of silently
 * dropping the other keys (e.g. `{ eq: 2, firefox: 3 }` with instances `eq` and `firefox`).
 */
export const isPerInstanceNumbers = (value: unknown): value is MultiRemoteValues<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>> | MultiRemoteMatcherLike => {
    if (isMultiRemoteMatcher(value)) {
        return true
    }
    if (!isDefinedPlainObject(value) || value instanceof AsymmetricMatcher || Array.isArray(value)) {
        return false
    }
    const keys = Object.keys(value)
    const optionKeys = keys.filter((key) => NUMBER_OPTIONS_KEYS.includes(key))
    if (optionKeys.length > 0 && optionKeys.length < keys.length) {
        throw new Error(`Ambiguous expected value ${JSON.stringify(value)}: it mixes NumberOptions keys (${optionKeys.join(', ')}) with other keys. For one value per multi-remote instance, use expect.multiRemote().`)
    }
    return keys.length > 0 && optionKeys.length === 0
}

type MultiRemoteMatcherLike = { sample: MultiRemoteValues<unknown> }

export function validateNumberArrayAndExtractOptions(
    expectedValues: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | MultiRemoteValues<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>
        | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>> | undefined | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.CommandOptions,
    commandOptions: ExpectWebdriverIO.CommandOptions,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): { numberMatcher: MaybeArray<NumberMatcher> | MultiRemoteValues<MaybeArray<NumberMatcher>>; commandOptions: ExpectWebdriverIO.CommandOptions } {
    if (isPerInstanceNumbers(expectedValues)) {
        const perInstanceValues = (isMultiRemoteMatcher(expectedValues) ? expectedValues.sample : expectedValues) as MultiRemoteValues<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>
        // Plain per-instance NumberMatchers, the shorthand of `expect.multiRemote()` for number matchers
        const numberMatcher = Object.fromEntries(Object.entries(perInstanceValues).map(([instance, value]) =>
            [instance, validateNumberArrayAndExtractOptions(value, commandOptions).numberMatcher as MaybeArray<NumberMatcher>]
        ))
        return { numberMatcher, commandOptions }
    }
    if (Array.isArray(expectedValues)) {
        const allNumbers = expectedValues.map((value) => validateNumberAndExtractOptions(value, commandOptions, { supportDefaultAsGteThen1 }))
        return { numberMatcher: allNumbers.map( ({ numberMatcher }) =>  numberMatcher), commandOptions }
    }
    // Per-instance values (incl. `expect.multiRemote()`) are handled above
    return validateNumberAndExtractOptions(expectedValues as number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher | undefined, commandOptions, { supportDefaultAsGteThen1 })
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

export const isEmptyOrLegacyNumberOptions = (value: unknown): value is ExpectWebdriverIO.NumberOptions => {
    if (!isDefinedPlainObject(value)) { return false }
    const keys = Object.keys(value)
    return keys.length === 0 || keys.filter((key) => !['eq', 'gte', 'lte'].includes(key)).length > 0
}
