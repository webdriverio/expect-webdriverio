import type { CompareResult, StrategyResult } from './executeCommand.js'
import { isMultiRemoteValues } from './multiRemoteUtils.js'

export async function executeBrowserCommand<Actual, Expected>( {
    browser,
    expectedValue,
    compare,
    multiRemoteCompare,
} :{
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    expectedValue: MaybeArrayOrMultiRemoteValues<Expected> | Expected | unknown
    compare: (browser: WebdriverIO.Browser, expectedValue: Expected | unknown, index?: number) => Promise<CompareResult<Actual>>
    multiRemoteCompare: (browser: WebdriverIO.MultiRemoteBrowser, expectedValue: ArrayOrMultiRemoteValues<Expected> | unknown, index?: number) => Promise<CompareResult<Actual>[]>
}
): Promise<StrategyResult<ArrayOrMultiRemoteValues<Actual> | Actual>> {

    let results: CompareResult<ArrayOrMultiRemoteValues<Actual>> | CompareResult<Actual>
    let subject: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser = browser
    let expected: MaybeArrayOrMultiRemoteValues<Expected> | unknown = expectedValue

    if (browser.isMultiremote) {
        let multiRemoteBrowser: WebdriverIO.MultiRemoteBrowser = browser

        let forceFailure = false
        if (isMultiRemoteValues(expectedValue, browser.instances)) {
            let browserNames = Object.keys(expectedValue)

            if (browserNames.some(name => !browser.instances.includes(name))) {
                // Force failure when expecting a browser that is not part of the multiremote instance
                forceFailure = true
                browserNames = browserNames.filter(name => browser.instances.includes(name))
            }

            // TODO should we do strict check and select a subset only when using the expect.objectContaining() matcher?
            multiRemoteBrowser = browser.unstable_select(browserNames)
            expected = Object.values(expectedValue)
        } else if (!Array.isArray(expectedValue)) {
            expected = Array(browser.instances.length).fill(expectedValue)
        }

        const arrayResults = await multiRemoteCompare(multiRemoteBrowser, expected)
        subject = multiRemoteBrowser

        const actuals = arrayResults.map(result => result.actual)

        let actual: ArrayOrMultiRemoteValues<Actual> | Actual = actuals
        if (isMultiRemoteValues(expectedValue, browser.instances) && actual.length === browser.instances.length) {
            // Build a multi-remote actual value object when the expected value is a multi-remote object, so we have a nicer error message
            actual = Object.fromEntries(browser.instances.map((name, index) => [name, actuals[index]]))
            expected = expectedValue
        } else if (Array.isArray(expectedValue) && actual.length !== expectedValue.length) {
            // Force failure when the number of actual values does not match the number of expected values for array strict comparison
            forceFailure = true
        }

        const success = !forceFailure && arrayResults.every(result => result.success)

        return { actual, success, subject, expected }
    } else if (isMultiRemoteValues(expectedValue) || Array.isArray(expectedValue)) {
        // TODO review if this is accurate!
        throw new Error('Expected value object or array is not supported for a single browser instance. Use a string, RegExp or asymmetric matcher instead.')
    } else {
        results = await compare(browser, expectedValue)
    }
    return { ...results, subject, expected }
}
