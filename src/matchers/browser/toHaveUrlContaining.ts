import { runExpect } from '../../util/expectAdapter'
import { toHaveUrlFn } from './toHaveUrl'

function toHaveUrlContainingFn(browser: WebdriverIO.BrowserObject, url: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveUrlFn.call(this, browser, url, {
        ...options,
        containing: true
    })
}

export function toHaveUrlContaining(...args: any): any {
    return runExpect.call(this, toHaveUrlContainingFn, args)
}
