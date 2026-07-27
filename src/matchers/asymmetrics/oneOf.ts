import { compareTextWithArray } from '../../utils.js'
import { AsymmetricMatcher } from 'expect'

/**
 * Asymmetric Matcher for oneOf with context options, used in expect-webdriverio
 * Register only on the global expect instance, but superseed by oneOfWithContextMatcher.asymmetricMatch(actual, options) when called inside wdio matchers for more flexibility and context options.
 * @see oneOfWithContextMatcher
 */
export class OneOfMatcher extends AsymmetricMatcher<Array<string | RegExp>> {
    public sample: Array<string | RegExp>
    constructor(...sample: Array<string | RegExp>) {
        super(sample)
        this.sample = sample
    }

    /**
     * Defined but mostly unused, and superseed by oneOfWithContextMatcher.asymmetricMatch(actual, options) inside wdio matchers for more flexibility and context options.
     * @see oneOfWithContextMatcher.asymmetricMatch
     */
    public asymmetricMatch(actual: unknown): boolean {
        if (typeof actual !== 'string') {
            return false
        }
        const result = compareTextWithArray(actual, this.sample, {})
        return result.result
    }

    public toString() {
        return `wdio.OneOfMatcher( ${this.sample.map((s) => (s instanceof RegExp ? s.toString() : s)).join(', ')})`
    }
}

export function oneOf(actual: unknown, sample: Array<string | RegExp>) {
    const matcher = new OneOfMatcher(...sample)
    return {
        pass: matcher.asymmetricMatch(actual),
        message: () => `expected ${actual} to be one of ${JSON.stringify(sample)}`,
    }
}

// TypeScript Global Type Augmentations
declare module 'expect' {
    interface AsymmetricMatchers {
        oneOf(...sample: Array<string | RegExp>): OneOfMatcher;
    }
}

declare global {
    namespace ExpectWebdriverIO {
        interface AsymmetricMatchers {
            oneOf(...sample: Array<string | RegExp>): OneOfMatcher;
        }
    }
}
