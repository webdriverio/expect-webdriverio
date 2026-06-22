interface AsymmetricTester {
    asymmetricMatch(actual: unknown, matchersUtil?: any): boolean;
    jasmineToString?(pp?: (val: any) => string): string;
}

// Helper mirroring Jasmine's internal hasProperty function
function hasProperty(obj: any, property: string | symbol): boolean {
    if (!obj || typeof obj !== 'object') {
        return false
    }
    if (Object.prototype.hasOwnProperty.call(obj, property)) {
        return true
    }
    return hasProperty(Object.getPrototypeOf(obj), property)
}

/**
 * Jasmine's StringMatching mimic
 * See https://github.com/jasmine/jasmine/blob/v5.13.0/src/core/asymmetric_equality/StringMatching.js
 * */
class StringMatching implements AsymmetricTester {
    regexp: RegExp

    constructor(expected: string | RegExp) {
        // Checking for string or RegExp instance mirroring Jasmine's internal check
        if (typeof expected !== 'string' && !(expected instanceof RegExp)) {
            throw new Error('Expected is not a String or a RegExp')
        }
        this.regexp = new RegExp(expected)
    }

    asymmetricMatch(actual: unknown): boolean {
        // Jasmine runs this.regexp.test(other);
        // Note: RegExp.prototype.test implicitly converts non-strings to a string (e.g. true -> "true")
        return this.regexp.test(actual as string)
    }

    jasmineToString(): string {
        return `<jasmine.stringMatching(${this.regexp})>`
    }
}

/**
 * Jasmine's StringContaining mimic
 * See https://github.com/jasmine/jasmine/blob/v5.13.0/src/core/asymmetric_equality/StringContaining.js
 * */
class StringContaining implements AsymmetricTester {
    expected: string
    constructor(expected: string) {
        if (typeof expected !== 'string') {
            throw new Error('Expected is not a string')
        }
        this.expected = expected
    }
    asymmetricMatch(actual: unknown) {
        return typeof actual === 'string' && actual.indexOf(this.expected) !== -1
    }
    jasmineToString() {
        return `<jasmine.stringContaining("${this.expected}")>`
    }
}

/**
 * Jasmine's ObjectContaining mimic
 * @see https://github.com/jasmine/jasmine/blob/v5.13.0/src/core/asymmetric_equality/ObjectContaining.js
 * */
class ObjectContaining implements AsymmetricTester {
    sample: Record<string | symbol, any>

    constructor(sample: Record<string | symbol, any>) {
        if (!sample || typeof sample !== 'object') {
            throw new Error(`You must provide an object to objectContaining, not '${sample}'.`)
        }
        this.sample = sample
    }

    asymmetricMatch(other: unknown, matchersUtil?: any): boolean {
        if (typeof this.sample !== 'object') {
            throw new Error(
                "You must provide an object to objectContaining, not '" +
          this.sample +
          "'."
            )
        }
        if (typeof other !== 'object') {
            return false
        }

        for (const property in this.sample) {
            if (
                // @ts-expect-error silencing error to keep exact Jasmine 5.12 implementation
                !hasProperty(other, property) || !matchersUtil.equals(this.sample[property], other[property])
            ) {
                return false
            }
        }

        return true
    }

    jasmineToString(pp?: (val: any) => string) {
        const stringifiedSample = pp ? pp(this.sample) : JSON.stringify(this.sample)
        return `<jasmine.objectContaining(${stringifiedSample})>`
    }
}

// Expose them via a namespace factory matching Jasmine's API syntax
export const jasmine = {
    stringMatching: (expected: string | RegExp) => new StringMatching(expected),
    stringContaining: (expected: string) => new StringContaining(expected),
    objectContaining: (sample: Record<string | symbol, any>) => new ObjectContaining(sample)
}
