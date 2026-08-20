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
    multiRemoteCompare: (browser: WebdriverIO.MultiRemoteBrowser, expectedValue: ArrayOrMultiRemoteValues<Expected> | unknown, index?: number) => Promise<CompareResult<ArrayOrMultiRemoteValues<Actual>>>
}
): Promise<StrategyResult<ArrayOrMultiRemoteValues<Actual> | Actual>> {

    let results: CompareResult<ArrayOrMultiRemoteValues<Actual>> | CompareResult<Actual>
    let subject: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser = browser
    let expected: MaybeArrayOrMultiRemoteValues<Expected> | unknown = expectedValue

    if (browser.isMultiremote) {
        let multiRemoteBrowser: WebdriverIO.MultiRemoteBrowser = browser

        if (isMultiRemoteValues(expectedValue)) {
            const browserNames = Object.keys(expectedValue)

            // TODO should we do strict check and select a subset only when using the expect.objectContaining() matcher?
            // @ts-expect-error working only with yalc
            multiRemoteBrowser = browser.select(browserNames)
            expected = Object.values(expectedValue)
        } else if (!Array.isArray(expectedValue)) {
            expected = Array(browser.instances.length).fill(expectedValue)
        }

        results = await multiRemoteCompare(multiRemoteBrowser, expected)
        subject = multiRemoteBrowser

        // Transform the actual values into an multi-remote values object for nicer error messages
        let actual: ArrayOrMultiRemoteValues<Actual> = results.actual
        if (isMultiRemoteValues(expectedValue) && Array.isArray(results.actual) && results.actual.length === browser.instances.length) {
            const actualArray = results.actual
            actual = Object.fromEntries(browser.instances.map((name, index) => [name, actualArray[index]]))
            expected = expectedValue
        }

        return { ...results, actual, subject, expected }
    } else if (isMultiRemoteValues(expectedValue) || Array.isArray(expectedValue)) {
        // TODO review if this is accurate!
        throw new Error('Expected value object or array is not supported for a single browser instance. Use a string, RegExp or asymmetric matcher instead.')
    } else {
        results = await compare(browser, expectedValue)
    }
    return { ...results, subject, expected }
}
