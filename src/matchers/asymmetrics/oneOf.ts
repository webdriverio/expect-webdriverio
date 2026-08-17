import type { HTMLOptions, StringOptions } from 'expect-webdriverio'
import { compareTextWithArray } from '../../utils.js'
import { WdioAsymmetricMatchers } from './asymmetricsUtils.js'

const ONE_OF_TAG = 'expect-webdriverio.oneOf'
const ONE_OF_SYMBOL = Symbol.for(ONE_OF_TAG)

/**
 * oneOf matcher is used to check if a string matches any of the provided strings or regular expressions.
 * StringOptions is injected by the matcher for customization of the matching behavior.
 * @see oneOfWithContextMatcher
 */
export class OneOfMatcher extends WdioAsymmetricMatchers<Array<string | RegExp | AsymmetricMatcher<string> | null>> {
    readonly [ONE_OF_SYMBOL] = true
    // TODO support HTML options
    public options: StringOptions | HTMLOptions = {}

    constructor(...sample: Array<string | RegExp | AsymmetricMatcher<string> | null>) {
        super(sample)
    }

    private setOptions(options: StringOptions): OneOfMatcher {
        this.options = options
        return this
    }

    public asymmetricMatch(actual: unknown): boolean {
        if (actual === null) {
            return this.sample.includes(null)
        } else if (typeof actual !== 'string') {
            return false
        }

        return compareTextWithArray(actual, this.sample.filter(s => s !== null), this.options).success
    }

    public withOptions(options: StringOptions): OneOfMatcher {
        // When `toHave` Matchers want to injects their global options into the asymmetric matcher,
        // we need to clone it to avoid mutating the original matcher instance if reuses in multiple assertions with different options.
        return new OneOfMatcher(...this.sample).setOptions(options)
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

export function oneOf(...sample: Array<string | RegExp | AsymmetricMatcher<string> | null>): OneOfMatcher {
    return new OneOfMatcher(...sample)
}

export function isOneOfMatcher(oneOfMatcher: unknown): oneOfMatcher is OneOfMatcher {
    return oneOfMatcher instanceof OneOfMatcher || (oneOfMatcher as OneOfMatcher)?.[ONE_OF_SYMBOL] === true
}
