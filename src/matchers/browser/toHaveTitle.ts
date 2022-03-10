import { runExpect } from '../../util/expectAdapter'
import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveTitleFn(browser: WebdriverIO.Browser, title: string, options: ExpectWebdriverIO.StringOptions = {}): any {
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

export function toHaveTitle(...args: any): any {
    return runExpect.call(this || {}, toHaveTitleFn, args)
}
