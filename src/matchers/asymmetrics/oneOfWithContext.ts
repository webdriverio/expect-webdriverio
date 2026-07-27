import { compareTextWithArray } from '../../utils.js'
import { AsymmetricMatcher } from 'expect'

/**
 * Asymmetric Matcher for oneOf with context options, used in expect-webdriverio
 * Not registered on `expect` but instantiated inside matchers for more flexibility and context options.
 * @see oneOfWithContextMatcher
 */
export class OneOfWithContextMatcher extends AsymmetricMatcher<Array<string | RegExp>> {
    public sample: Array<string | RegExp>
    public options: ExpectWebdriverIO.StringOptions = {}
    constructor(sample: Array<string | RegExp>, options?: ExpectWebdriverIO.StringOptions) {
        super(sample)
        this.sample = sample
        this.options = options || {}
    }

    public asymmetricMatch(actual: unknown): boolean {
        if (typeof actual !== 'string') {
            return false
        }

        const result = compareTextWithArray(actual, this.sample, this.options)
        return result.result
    }

    // Not used by default, just a fallback!
    public toString() {
        return this.toAsymmetricMatcher()
    }

    // When paired with Jasmine!
    public jasmineToString() {
        return this.toString()
    }

    // Allow pretty-print in failure messages without quote for a better generic message
    public toAsymmetricMatcher() {
    // 1. Determine the prefix based on string options
        let prefix = ''

        if (this.options.containing) {
            prefix = 'containing'
        } else if (this.options.atStart) {
            prefix = 'startingWith'
        } else if (this.options.atEnd) {
            prefix = 'endingWith'
        } else if (typeof this.options.atIndex === 'number') {
            prefix = `matchingAtIndex<${this.options.atIndex}>`
        }

        // 2. Handle whether sample is an array (oneOf) or a single value
        const isArray = Array.isArray(this.sample)
        const samples = isArray ? this.sample : [this.sample]

        const formattedSamples = samples
            .map((s) => (s instanceof RegExp ? s.toString() : s))
            .join(', ')

        // 3. Combine prefix with 'OneOf' suffix if it's an array, otherwise keep casing clean
        if (isArray) {
            prefix = prefix ? prefix + 'OneOf' : 'oneOf'
        }

        // Return final structured matcher format
        return prefix ? `${prefix}<${formattedSamples}>` : formattedSamples
    }
}

export function oneOfWithContext(sample: Array<string | RegExp>, options?: ExpectWebdriverIO.StringOptions): OneOfWithContextMatcher {
    return new OneOfWithContextMatcher(sample, options)
}
