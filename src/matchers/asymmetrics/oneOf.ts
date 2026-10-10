import { compareText } from '../../util/compareText.js'
import { WdioAsymmetricMatchers } from './asymmetricsUtils.js'
import { stringOptionsName } from '../../util/stringOptionsName.js'
import type { HTMLOptions, StringOptions } from '../../publicTypes/options.js'
import type { AsymmetricMatcher } from '../../publicTypes/expectWebdriverIO.js'

const ONE_OF_TAG = 'expect-webdriverio.oneOf'
const ONE_OF_SYMBOL = Symbol.for(ONE_OF_TAG)

/**
 * oneOf matcher is used to check if a string matches any of the provided strings or regular expressions, or if a number
 * is one of the provided numbers.
 * StringOptions is injected by the matcher for customization of the matching behavior.
 * @see oneOfWithContextMatcher
 */
export class OneOfMatcher extends WdioAsymmetricMatchers<Array<string | number | RegExp | AsymmetricMatcher<string> | null>> {
    readonly [ONE_OF_SYMBOL] = true
    // The string options of the matcher; the HTML options (`includeSelectorTag`) are for `getHTML()`, not for the compare
    public options: StringOptions | HTMLOptions = {}

    constructor(...sample: Array<string | number | RegExp | AsymmetricMatcher<string> | null>) {
        super(sample)
    }

    /** The expected values */
    public get values(): Array<string | number | RegExp | AsymmetricMatcher<string> | null> {
        return this.sample
    }

    private setOptions(options: StringOptions): OneOfMatcher {
        this.options = options
        return this
    }

    public asymmetricMatch(actual: unknown): boolean {
        if (actual === null) {
            return this.sample.includes(null)
        } else if (typeof actual === 'number') {
            return this.sample.includes(actual)
        } else if (typeof actual !== 'string') {
            return false
        }

        return this.sample.some((expected) => expected !== null && typeof expected !== 'number' && compareText(actual, expected, this.options).success)
    }

    public withOptions(options: StringOptions): OneOfMatcher {
        // When `toHave` Matchers want to injects their global options into the asymmetric matcher,
        // we need to clone it to avoid mutating the original matcher instance if reuses in multiple assertions with different options.
        return new OneOfMatcher(...this.sample).setOptions(options)
    }

    // Allow pretty-print in failure messages without quote for a better generic message
    /** `trimmed`: the default `trim` changed the actual value, so the name says it */
    public toAsymmetricMatcher(trimmed = false) {
        const formattedSamples = this.sample
            .map((s) => (s instanceof RegExp || typeof s === 'number' ? s.toString() : `"${s}"`))
            .join(', ')

        // e.g. `oneOf<"a", "b">`, `containingIgnoringCaseOneOf<"a", "b">`
        const name = stringOptionsName(this.options, { trimmed })
        return `${name ? name + 'OneOf' : 'oneOf'}<${formattedSamples}>`
    }
}

export function oneOf(...sample: Array<string | number | RegExp | AsymmetricMatcher<string> | null>): OneOfMatcher {
    return new OneOfMatcher(...sample)
}

export function isOneOfMatcher(oneOfMatcher: unknown): oneOfMatcher is OneOfMatcher {
    return oneOfMatcher instanceof OneOfMatcher || (oneOfMatcher as OneOfMatcher)?.[ONE_OF_SYMBOL] === true
}
