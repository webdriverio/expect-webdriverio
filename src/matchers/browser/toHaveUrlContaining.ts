import { runExpect } from '../../util/expectAdapter'
import { toHaveUrlFn } from './toHaveUrl'

function toHaveUrlContainingFn(browser: WebdriverIO.BrowserObject, title: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveUrlFn.call(this, browser, title, {
        ...options,
        containing: true
    })
}

export function toHaveUrlContaining(...args: any): any {
    return runExpect.call(this, toHaveUrlContainingFn, args)
}
