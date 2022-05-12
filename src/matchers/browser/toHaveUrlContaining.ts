import { toHaveUrl } from './toHaveUrl'

export function toHaveUrlContaining(browser: WebdriverIO.Browser, url: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveUrl.call(this, browser, url, {
        ...options,
        containing: true
    })
}
