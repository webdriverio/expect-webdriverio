import { toHaveTitle } from './toHaveTitle.js'

export function toHaveTitleContaining(browser: WebdriverIO.Browser, title: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveTitle.call(this, browser, title, {
        ...options,
        containing: true
    })
}
