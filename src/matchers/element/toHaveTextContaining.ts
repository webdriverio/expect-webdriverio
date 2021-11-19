import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { runExpect } from '../../util/expectAdapter'
import { toHaveTextFn } from './toHaveText'

function toHaveTextContainingFn(el: WebdriverIO.Element, text: string | Array<string>, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    return toHaveTextFn.call(this, el, text, {
        ...options,
        containing: true
    }, driver)
}

export function toHaveTextContaining(...args: any): any {
    return runExpect.call(this, toHaveTextContainingFn, args)
}
