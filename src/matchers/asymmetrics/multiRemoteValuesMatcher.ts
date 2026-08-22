import { type StringOptions } from 'expect-webdriverio'
import { WdioAsymmetricMatchers } from './asymmetricsUtils.js'
import type { CompareResult } from '../../util/executeCommand.js'
// import { equals } from '../../jasmineUtils.js'
import { compareText, isAsymmetricMatcher } from '../../utils.js'

const MULTI_REMOTE_VALUES_TAG = 'expect-webdriverio.multiRemoteValues'
const MULTI_REMOTE_VALUES_SYMBOL = Symbol.for(MULTI_REMOTE_VALUES_TAG)

/**
 * MultiRemoteValues allows to provide one or more expected values for each browser instance in a multi-remote setup.
 * Example:
 * ```ts
 * {
 *   chrome: 'expected text for chrome',
 *   firefox: /expected text for firefox/i
 * }
 * ```
 */
export class MultiRemoteValuesMatcher extends WdioAsymmetricMatchers<Record<string, string | RegExp | AsymmetricMatcher<string>>> {
    readonly [MULTI_REMOTE_VALUES_SYMBOL] = true

    public options: StringOptions = {}
    public browserNames: string[] = []
    public values: (string | RegExp | AsymmetricMatcher<string>)[]
    public lastResults: CompareResult<string>[] = []

    constructor(sample: Record<string, string | RegExp | AsymmetricMatcher<string>>) {
        const browserNames = Object.keys(sample)
        const values = Object.values(sample)
        super(sample)
        this.browserNames = browserNames
        this.values = values
    }

    public setOptions(options: StringOptions): MultiRemoteValuesMatcher {
        this.options = options
        return this
    }

    public buildActual(actual: string[]): Record<string, string> {
        if (Array.isArray(actual)) {
            const actualValues: Record<string, string> = {}
            this.browserNames.forEach((browserName, index) => {
                actualValues[browserName] = actual[index]
            })
            return actualValues
        }
        throw new Error('Actual value is not an array. Please provide an array of actual values for each browser instance.')
    }

    public asymmetricMatch(actual: Record<string, string>): boolean {
        if (typeof actual !== 'object' || actual === null) {
            return false
        }

        return Object.entries(this.sample).every(([key, expectedVal]) => {
            const actualVal = actual[key]

            if (isStringCompare(expectedVal, this.options)) {
                const result = compareText(actualVal, expectedVal, this.options)
                this.lastResults.push(result)
                return result.success
            }

            throw new Error(`Expected value for browser "${key}" is not a string, RegExp or AsymmetricMatcher. Please provide a valid expected value.`)
            // return equals(actualVal, expectedVal)
        })
    }

    public withOptions(options: StringOptions): MultiRemoteValuesMatcher {
        // When `toHave` Matchers want to injects their global options into the asymmetric matcher,
        // we need to clone it to avoid mutating the original matcher instance if reuses in multiple assertions with different options.
        return new MultiRemoteValuesMatcher(this.sample).setOptions(options)
    }

    // Allow pretty-print in failure messages without quote for a better generic message
    toString(): string {
        return `${this.sample}`
    }

    // Pretty-prints the expected map in test failures
    // Must return a string representation to satisfy pretty-format requirements
    toAsymmetricMatcher(): string {
        return JSON.stringify(this.sample, null, 2)
    }
}

export const isMultiRemoteValuesMatcher = (value: unknown): value is MultiRemoteValuesMatcher => {
    return value instanceof MultiRemoteValuesMatcher || (!!value && typeof value === 'object' && (value as MultiRemoteValuesMatcher)[MULTI_REMOTE_VALUES_SYMBOL] === true)
}

export const isStringCompare = (actual: unknown, options?: StringOptions): actual is string | RegExp | AsymmetricMatcher<string> => {
    return options?.asString || typeof actual === 'string' || actual instanceof RegExp || isAsymmetricMatcher(actual)
}
