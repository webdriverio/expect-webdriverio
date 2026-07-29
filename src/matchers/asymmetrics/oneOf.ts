import type { StringOptions } from 'expect-webdriverio'
import { compareTextWithArray } from '../../utils.js'
import { WdioAsymmetricMatchers } from './asymmetricsUtils.js'

/**
 * oneOf matcher is used to check if a string matches any of the provided strings or regular expressions.
 * StringOptions is injected by the matcher for customization of the matching behavior.
 * @see oneOfWithContextMatcher
 */
export class OneOfMatcher extends WdioAsymmetricMatchers<Array<string | RegExp>> {
    // TODO support HTML options
    public options: StringOptions = {}

    constructor(...sample: Array<string | RegExp>) {
        super(sample)
    }

    public asymmetricMatch(actual: unknown): boolean {
        if (typeof actual !== 'string') {
            return false
        }
        return compareTextWithArray(actual, this.sample, this.options).result
    }

    public setOptions(options: StringOptions): void {
        this.options = options
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
            .map((s) => (s instanceof RegExp ? s.toString() : `"${s}"`))
            .join(', ')

        // 3. Combine prefix with 'OneOf' suffix if it's an array, otherwise keep casing clean
        if (isArray) {
            prefix = prefix ? prefix + 'OneOf' : 'oneOf'
        }

        // Return final structured matcher format
        return prefix ? `${prefix}<${formattedSamples}>` : formattedSamples
    }
}

export function oneOf(...sample: Array<string | RegExp>): OneOfMatcher {
    return new OneOfMatcher(...sample)
}

declare global {
    namespace ExpectWebdriverIO {
        interface AsymmetricMatchers {
            oneOf(...sample: Array<string | RegExp>): OneOfMatcher;
        }
    }
}
