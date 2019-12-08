import { runExpect } from '../../util/expectAdapter'
import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveTitle(browser: WebdriverIO.BrowserObject, title: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveTitleFn, arguments)
}

function toHaveTitleFn(browser: WebdriverIO.BrowserObject, title: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'title', verb = 'have' } = this

    return browser.call(async () => {
        let actual
        const pass = await waitUntil(async () => {
            actual = await browser.getTitle()

            return compareText(actual, title, options).result
        }, isNot, options)

        const message = enhanceError('window', title, actual, this, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}
