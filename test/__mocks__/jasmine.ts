interface AsymmetricTester {
    asymmetricMatch(actual: unknown): boolean;
    jasmineToString?(): string;
}

// Jasmine's StringContaining mimic (from https://github.com/jasmine/jasmine/blob/main/src/core/asymmetric_equality/StringContaining.js)
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
    getExpectedType() {
        return 'string'
    }
}

// Expose them via a namespace factory matching Jasmine's API syntax
export const jasmine = {
    stringContaining: (expected: string) => new StringContaining(expected)
}
