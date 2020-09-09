import { toBeRequestedWithFn } from './toBeRequestedWith'
import { runExpect } from '../../util/expectAdapter'

function toBeRequestedWithResponseFn(
    received: WebdriverIO.Mock,
    response: any,
    options: ExpectWebdriverIO.CommandOptions = {}
): any {
    return toBeRequestedWithFn.call(this, received, { response }, options)
}

export function toBeRequestedWithResponse(...args: any): any {
    console.warn('expect(...).toBeRequestedWithResponse is deprecated and will be removed in next release. Use toBeRequestedWith instead.')
    return runExpect.call(this, toBeRequestedWithResponseFn, args)
}
