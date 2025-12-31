import type { Browser } from 'webdriverio'
import type { CompareResult } from '../utils'
import { compareText } from '../utils'

export const toArray = <T>(value: T | T[] | MaybeArray<T>): T[] => (Array.isArray(value) ? value : [value])

export type MaybeArray<T> = T | T[]

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value)
}

export const compareMultiRemoteText = (
    actual: MaybeArray<string>,
    expected: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions,
): CompareResult<string>[] => {
    if (!Array.isArray(actual) && typeof actual !== 'string') {
        return [{
            value: actual,
            result: false,
            expected
        }]
    }
    if (Array.isArray(expected) && expected.length !== actual.length) {
        // TODO: review in the future to support partial multi remote comparisons
        return [{
            value: `Multi-value length mismatch expected ${expected.length} but got ${actual.length}`,
            result: false,
            expected
        }]
    }

    const actualArray = toArray(actual)

    // Use array or fill to match actual length when expected is a single value
    const expectedArray = Array.isArray(expected) ? expected : Array(actualArray.length).fill(expected, 0, actualArray.length)

    const results: CompareResult<string>[] = []
    for (let i = 0; i < actualArray.length; i++) {
        const actualText = actualArray[i]
        const expectedText = expectedArray[i]
        results.push(compareText(actualText, expectedText, options))
    }

    return results
}

export const isMultiremote = (browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser): browser is WebdriverIO.MultiRemoteBrowser => {
    return (browser as WebdriverIO.MultiRemoteBrowser).isMultiremote === true
}

export const getInstancesWithExpected = <T>(browsers: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser, expectedValues: T): Record<string, { browser: Browser; expectedValue: T; }>  => {
    if (isMultiremote(browsers)) {
        if (Array.isArray(expectedValues)) {
            if (expectedValues.length !== browsers.instances.length) {
                throw new Error(`Expected values length (${expectedValues.length}) does not match number of browser instances (${browsers.instances.length}) in multiremote setup.`)
            }
        }
        // TODO dprevost add support for object like { default: 'title', browserA: 'titleA', browserB: 'titleB' } later

        const browsersWithExpected = browsers.instances.reduce((acc, instance, index) => {
            const browser = browsers.getInstance(instance)
            const expectedValue = Array.isArray(expectedValues) ? expectedValues[index] : expectedValues
            acc[instance] = { browser, expectedValue }
            return acc
        }, {} as Record<string,  { browser: WebdriverIO.Browser, expectedValue: T }>)
        return browsersWithExpected
    }

    return { default: { browser: browsers, expectedValue: expectedValues } }
}
