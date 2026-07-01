
export const isNumber = (value: unknown): value is number => typeof value === 'number'
const isDefined = (value: unknown): boolean =>  value !== undefined && value !== null

export function validateNumberOptions(expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher, commandOptions: ExpectWebdriverIO.CommandOptions = {}): { numberMatcher: NumberMatcher, commandOptions: ExpectWebdriverIO.CommandOptions } {
    if (isNumber(expectedValue)) {
        return { numberMatcher: new NumberMatcher({ eq: expectedValue }), commandOptions }
    } else if (!expectedValue || (typeof expectedValue.eq !== 'number' && typeof expectedValue.gte !== 'number' && typeof expectedValue.lte !== 'number')) {
        throw new Error(`Invalid NumberOptions. Received: ${JSON.stringify(expectedValue)}`)
    } else {
        const { eq, gte, lte, ...restCommandOptions } = expectedValue
        return { numberMatcher: new NumberMatcher({ eq, gte, lte }), commandOptions: { ...commandOptions, ...restCommandOptions } }
    }
}

/**
 * Using a class to univerally handle number matching and stringification the same way everywhere and with Global Apis like equal() toString() and toJSON()
 */
export class NumberMatcher {
    constructor(private options: ExpectWebdriverIO.NumberOptions = {}) {}

    match(actual: number | undefined): boolean {
        if ( actual === undefined ) {
            return false
        }

        if (isNumber(this.options.eq)) {
            return actual === this.options.eq
        }

        if (isNumber(this.options.gte) && isNumber(this.options.lte)) {
            return actual >= this.options.gte && actual <= this.options.lte
        }

        if (isNumber(this.options.gte)) {
            return actual >= this.options.gte
        }

        if (isNumber(this.options.lte)) {
            return actual <= this.options.lte
        }

        return false
    }

    toString(): string {
        if (isNumber(this.options.eq)) {
            return String(this.options.eq)
        }

        if (isDefined(this.options.gte) && isDefined(this.options.lte)) {
            return `>= ${this.options.gte} && <= ${this.options.lte}`
        }

        if (isDefined(this.options.gte)) {
            return `>= ${this.options.gte}`
        }

        if (isDefined(this.options.lte))     {
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
    const isNumberMatcherA = a instanceof NumberMatcher
    const isNumberMatcherB = b instanceof NumberMatcher

    if (isNumberMatcherA && isNumber(b)) {
        return a.match(b)
    }

    if (isNumberMatcherB && isNumber(a)) {
        return b.match(a)
    }

    // Return undefined to let other testers handle it
    return undefined
}
