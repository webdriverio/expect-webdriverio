import type { CompareResult, MultiRemoteCompareResult, StrategyResult } from './executeCommand.js'
import { isMultiRemoteValues } from './multiRemoteUtils.js'

export async function executeBrowserCommand<Actual, Expected>( {
    browser,
    expectedValue,
    compare,
} :{
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    expectedValue: MaybeArrayOrMultiRemoteValues<Expected> | Expected | unknown
    compare: (browser: WebdriverIO.Browser, expectedValue: Expected | unknown, index?: number) => Promise<CompareResult<Actual>>
}
): Promise<StrategyResult<ArrayOrMultiRemoteValues<Actual | undefined> | Actual | undefined>> {

    let expected: MaybeArrayOrMultiRemoteValues<Expected> | unknown = expectedValue
    let forceFailure = false

    if (browser.isMultiremote) {
        let multiRemoteExpectedValues: unknown[]

        if (isMultiRemoteValues(expectedValue, browser.instances)) {
            let browserNames = Object.keys(expectedValue)

            if (browserNames.length !== browser.instances.length) {
                forceFailure = true
            }
            if (browserNames.some(name => !browser.instances.includes(name))) {
                // Force failure when expecting a browser that is not part of the multiremote instance
                forceFailure = true
                browserNames = browserNames.filter(name => browser.instances.includes(name))
            }

            multiRemoteExpectedValues = Object.values(expectedValue)
            expected = expectedValue
        } else {
            if (Array.isArray(expectedValue)) {
                // Array of expected values is not supported only oneOf
                forceFailure = true
            }

            // A single expected value must be replicated for each browser instance
            multiRemoteExpectedValues = Array(browser.instances.length).fill(expectedValue)
            expected = browser.instances.reduce((acc, name) => {
                acc[name] = expectedValue
                return acc
            }, {} as Record<string, unknown>)
        }

        const arrayResults = await Promise.all(
            // Iterating through instance is a must else order of results may not match the order of browser instances
            browser.instances.map(async (name, index) => {
                let singleBrowser: WebdriverIO.Browser
                try {
                    singleBrowser = browser.getInstance(name)
                } catch {
                    // Invalid browser name
                    return { success: false, actual: undefined, multiRemoteBrowserName: name } satisfies MultiRemoteCompareResult<undefined>
                }

                const results = await compare(singleBrowser, multiRemoteExpectedValues[index])
                return { ...results, multiRemoteBrowserName: name } satisfies MultiRemoteCompareResult<Actual>
            })
        )

        const actual = arrayResults.reduce((acc, result) => {
            acc[result.multiRemoteBrowserName] = result.actual
            return acc
        },  {} as Record<string, Actual | undefined>)

        // Force failure if expected and actual multi-remote results do not match in length
        if (Object.keys(actual).length !== multiRemoteExpectedValues.length) {
            forceFailure = true
        }

        const success = !forceFailure && arrayResults.every(result => result.success)

        return { actual, success, subject: browser, expected }
    }

    if (isMultiRemoteValues(expectedValue) || Array.isArray(expectedValue)) {
        forceFailure = true
    }
    const results = await compare(browser, expectedValue)

    return { ...results, success: forceFailure ? false : results.success, subject: browser, expected }
}
