import { runExpect } from '../../util/expectAdapter'
import { toHaveTitleFn } from './toHaveTitle'

function toHaveTitleContainingFn(browser: WebdriverIO.Browser, title: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveTitleFn.call(this, browser, title, {
        ...options,
        containing: true
    })
}

export function toHaveTitleContaining(...args: any): any {
    return runExpect.call(this, toHaveTitleContainingFn, args)
}
