import { toHaveUrl } from './toHaveUrl.js'

export function toHaveUrlContaining(browser: WebdriverIO.Browser, url: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveUrl.call(this, browser, url, {
        ...options,
        containing: true
    })
}
