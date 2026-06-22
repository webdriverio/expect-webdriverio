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

// Jasmine's StringContaining mimic
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

// Jasmine's ObjectContaining mimic
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
                // @ts-expect-error silencing erro to keepe exact Jasmine 5.12 implementation
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
    stringContaining: (expected: string) => new StringContaining(expected),
    objectContaining: (sample: Record<string | symbol, any>) => new ObjectContaining(sample)
}
