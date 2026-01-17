
export const isNumber = (value: unknown): value is number => typeof value === 'number'
const isDefined = (value: unknown): boolean =>  value !== undefined && value !== null

export function validateNumberOptions(expectedValue: number | ExpectWebdriverIO.NumberOptions): { numberMatcher: NumberMatcher, numberCommandOptions?: ExpectWebdriverIO.CommandOptions } {
    let numberOptions: ExpectWebdriverIO.NumberOptions
    if (isNumber(expectedValue)) {
        numberOptions = { eq: expectedValue } satisfies ExpectWebdriverIO.NumberOptions
        return { numberMatcher: new NumberMatcher(numberOptions) }
    } else if (!expectedValue || (typeof expectedValue.eq !== 'number' && typeof expectedValue.gte !== 'number' && typeof expectedValue.lte !== 'number')) {
        throw new Error(`Invalid NumberOptions. Received: ${JSON.stringify(expectedValue)}`)
    } else {
        const { eq, gte, lte, ...commandOptions } = expectedValue
        return { numberMatcher: new NumberMatcher( { eq, gte, lte }), numberCommandOptions: commandOptions }
    }

}

export function validateNumberOptionsArray(expectedValues: MaybeArray<number | ExpectWebdriverIO.NumberOptions>) {
    if (Array.isArray(expectedValues)) {
        // TODO: deprecated NumberOptions as options in favor of ExpectedType and realy only on commandOptions param + overloaded function
        const allNumbers = expectedValues.map((value) => validateNumberOptions(value))
        // Options in numberOptions are not supported when passing an array of expected values
        return { numberMatcher: allNumbers.map( ({ numberMatcher }) =>  numberMatcher), numberCommandOptions: undefined }
    }
    return validateNumberOptions(expectedValues)
}

/**
 * Using a class to univerally handle number matching and stringification the same way everywhere and with Global Apis like equal() toString() and toJSON()
 */
export class NumberMatcher {
    constructor(private options: ExpectWebdriverIO.NumberOptions = {}) {}

    equals(actual: number | undefined): boolean {
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
        return a.equals(b)
    }

    if (isNumberMatcherB && isNumber(a)) {
        return b.equals(a)
    }

    // Return undefined to let other testers handle it
    return undefined
}
