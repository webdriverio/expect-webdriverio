import { isDefinedObject } from './commandOptionsUtils.js'

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
    if (supportDefaultAsGteThen1 && (expectedValue === undefined || (isDefinedObject(expectedValue) && expectedValue.eq === undefined && expectedValue.gte === undefined && expectedValue.lte === undefined))) {
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

// TODO dprevost to review
export function validateNumberArrayAndExtractOptions(
    expectedValues: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | undefined | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.CommandOptions,
    commandOptions: ExpectWebdriverIO.CommandOptions,
    { supportDefaultAsGteThen1 }: { supportDefaultAsGteThen1?: boolean } = {}
): { numberMatcher: MaybeArray<NumberMatcher>; commandOptions: ExpectWebdriverIO.CommandOptions } {
    if (Array.isArray(expectedValues)) {
        // TODO: deprecated NumberOptions as options in favor of ExpectedType and realy only on commandOptions param + overloaded function
        const allNumbers = expectedValues.map((value) => validateNumberAndExtractOptions(value, commandOptions, { supportDefaultAsGteThen1 }))
        return { numberMatcher: allNumbers.map( ({ numberMatcher }) =>  numberMatcher), commandOptions }
    }
    const { numberMatcher, commandOptions: numberCommandOptions } = validateNumberAndExtractOptions(expectedValues, commandOptions, { supportDefaultAsGteThen1 })
    return { numberMatcher: numberMatcher, commandOptions: numberCommandOptions }
}

/**
 * Using a class to univerally handle number matching and stringification the same way everywhere and with Global Apis like equal() toString() and toJSON()
 */
export class NumberMatcher {
    constructor(private options: ExpectWebdriverIO.NumberMatcher | ExpectWebdriverIO.NumberOptions) {}

    equals(other: unknown): boolean {
        if (isNumber(other)) {
            return this.match(other)
        }
        return false
    }

    match(expected: number | undefined): boolean {
        if ( expected === undefined ) {
            return false
        }

        if (isNumber(this.options.eq)) {
            return expected === this.options.eq
        }

        if (isNumber(this.options.gte) && isNumber(this.options.lte)) {
            return expected >= this.options.gte && expected <= this.options.lte
        }

        if (isNumber(this.options.gte)) {
            return expected >= this.options.gte
        }

        if (isNumber(this.options.lte)) {
            return expected <= this.options.lte
        }

        return false
    }

    toString(): string {
        if (isNumber(this.options.eq)) {
            return String(this.options.eq)
        }

        if (isNumber(this.options.gte) && isNumber(this.options.lte)) {
            return `>= ${this.options.gte} && <= ${this.options.lte}`
        }

        if (isNumber(this.options.gte)) {
            return `>= ${this.options.gte}`
        }

        if (isNumber(this.options.lte))     {
            return `<= ${this.options.lte}`
        }

        return 'Incorrect number options provided'
    }

    toJSON(): string | number {
        // Return the actual number for exact equality, so it serializes as 0 not "0"
        if (isNumber(this.options.eq)) {
            return this.options.eq
        }
        return this.toString()
    }
}

/**
 * Custom tester for number matchers to be used by the equal of expect during failure message generation
 */
export const numberMatcherTester = (a: unknown, b: unknown): boolean | undefined => {
    if (a instanceof NumberMatcher && isNumber(b)) {return a.match(b)}
    if (b instanceof NumberMatcher && isNumber(a)) {return b.match(a)}

    // Return undefined to let other testers handle it
    return undefined
}
