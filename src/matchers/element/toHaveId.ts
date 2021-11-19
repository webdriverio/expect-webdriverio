import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveIdFn(el: WebdriverIO.Element, id: string, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    return toHaveAttributeAndValueFn.call(this, el, 'id', id, options, driver)
}

export function toHaveId(...args: any): any {
    return runExpect.call(this, toHaveIdFn, args)
}
