import type { CompareResult, MultiRemoteCompareResult, StrategyResult } from './executeCommand.js'
import { hasSameInstanceNames, isMultiRemoteValues, isPerInstanceValues } from './multiRemoteUtils.js'

export async function executeBrowserCommand<Actual, Expected>( {
    browser,
    expectedValue,
    compare,
    isNot = false,
} :{
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    expectedValue: MaybeArrayOrMultiRemoteValues<Expected> | Expected | unknown
    compare: (browser: WebdriverIO.Browser, expectedValue: Expected | unknown, index?: number) => Promise<CompareResult<Actual>>
    /** Needed so a forced (structural) failure also fails under `.not`, since Jest inverts `success` afterwards */
    isNot?: boolean
}
): Promise<StrategyResult<ArrayOrMultiRemoteValues<Actual | undefined> | Actual | undefined>> {

    if (browser.isMultiremote) {
        const { instances } = browser

        // Browser expected values are never plain objects, so any plain object holds one value per instance
        const isPerInstance = isPerInstanceValues(expectedValue, instances)
        // Otherwise a single expected value is replicated for each browser instance
        const expected: MultiRemoteValues<unknown> = isPerInstance ? expectedValue : Object.fromEntries(instances.map((name) => [name, expectedValue]))

        // Structural failures: per-instance values not naming exactly the instances, or an array (unsupported, use `expect.oneOf()`)
        const forceFailure = (isPerInstance && !hasSameInstanceNames(expectedValue, instances))
            || Object.values(expected).some(Array.isArray)

        const arrayResults = await Promise.all(
            // Iterating through instance is a must else order of results may not match the order of browser instances
            instances.map(async (name) => {
                let singleBrowser: WebdriverIO.Browser
                try {
                    singleBrowser = browser.getInstance(name)!
                } catch {
                    // Invalid browser name
                    return { success: false, actual: undefined, multiRemoteBrowserName: name } satisfies MultiRemoteCompareResult<undefined>
                }

                // Look up by name: the user's key order may differ from `browser.instances` order.
                // On structural failure, still compare with `undefined` to get the actual value for the failure message.
                const isExpected = name in expected
                const results = await compare(singleBrowser, forceFailure || !isExpected ? undefined : expected[name])
                return { ...results, multiRemoteBrowserName: name } satisfies MultiRemoteCompareResult<Actual>
            })
        )

        const actual = arrayResults.reduce((acc, result) => {
            acc[result.multiRemoteBrowserName] = result.actual
            return acc
        },  {} as Record<string, Actual | undefined>)

        if (forceFailure) {
            return { actual, success: isNot, abort: true, subject: browser, expected }
        }
        const success = arrayResults.every(result => result.success)

        return { actual, success, subject: browser, expected }
    }

    // Per-instance values or an array (unsupported, use `expect.oneOf()`) can never match a single browser
    const forceFailure = isMultiRemoteValues(expectedValue) || Array.isArray(expectedValue)
    const results = await compare(browser, forceFailure ? undefined : expectedValue)

    if (forceFailure) {
        return { ...results, success: isNot, abort: true, subject: browser, expected: expectedValue }
    }
    return { ...results, subject: browser, expected: expectedValue }
}
