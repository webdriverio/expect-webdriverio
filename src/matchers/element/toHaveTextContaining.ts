import { runExpect } from '../../util/expectAdapter'
import { toHaveTextFn } from './toHaveText'

function toHaveTextContainingFn(el: WebdriverIO.Element, text: string | Array<string>, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveTextFn.call(this, el, text, {
        ...options,
        containing: true
    })
}

export function toHaveTextContaining(...args: any): any {
    return runExpect.call(this, toHaveTextContainingFn, args)
}
