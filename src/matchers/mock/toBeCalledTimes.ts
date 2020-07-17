import { waitUntil, enhanceError } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { LOADIPHLPAPI } from 'dns'

function toBeCalledTimesFn(received: WebdriverIO.Mock, times: number, options: ExpectWebdriverIO.CommandOptions = {}): any {
    const isNot = this.isNot || false
    const { expectation = `called ${times} time${times !== 1 ? 's' : ''}`, verb = 'be' } = this

    return browser.call(async () => {
        let actual

        const pass = await waitUntil(async () => {
            actual = received.calls.length
            return actual === times
        }, isNot, options)

        const message = enhanceError('mock', times, actual, this, verb, expectation, '', options)

        return {
            pass,
            message: (): string => message
        }
    })
}

export function toBeCalledTimes(...args: any): any {
    return runExpect.call(this, toBeCalledTimesFn, args)
}

