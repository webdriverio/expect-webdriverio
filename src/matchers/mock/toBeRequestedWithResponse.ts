import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import type { Mock } from 'webdriverio'

import { toBeRequestedWithFn } from './toBeRequestedWith'
import { runExpect } from '../../util/expectAdapter'

function toBeRequestedWithResponseFn(
    received: Mock,
    response: any,
    options: ExpectWebdriverIO.CommandOptions = {},
    driver?: WebdriverIO.Browser
): any {
    return toBeRequestedWithFn.call(this, received, { response }, options, driver)
}

export function toBeRequestedWithResponse(...args: any): any {
    console.warn('expect(...).toBeRequestedWithResponse is deprecated and will be removed in next release. Use toBeRequestedWith instead.')
    return runExpect.call(this, toBeRequestedWithResponseFn, args)
}
