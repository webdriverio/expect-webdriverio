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
        }]
    }
    if (Array.isArray(expected) && expected.length !== actual.length) {
        // TODO: review in the future to support partial multi remote comparisons
        return [{
            value: `Multi-value length mismatch expected ${expected.length} but got ${actual.length}`,
            result: false,
        }]
    }

    const actualArray = toArray(actual)
    const expectedArray = toArray(expected)

    const results: CompareResult<string>[] = []
    for (let i = 0; i < actualArray.length; i++) {
        const actualText = actualArray[i]
        const expectedText = expectedArray[i]
        results.push(compareText(actualText, expectedText, options))
    }

    return results
}
