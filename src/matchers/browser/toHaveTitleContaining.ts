import { toHaveTitle } from './toHaveTitle'

export function toHaveTitleContaining(browser: WebdriverIO.Browser, title: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveTitle.call(this, browser, title, {
        ...options,
        containing: true
    })
}
