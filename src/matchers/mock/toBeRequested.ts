import { waitUntil, enhanceError } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeRequestedFn(received: WebdriverIO.Mock, options: ExpectWebdriverIO.CommandOptions = {}): any {
    const isNot = this.isNot || false
    const { expectation = `called`, verb = 'be' } = this

    return browser.call(async () => {
        let actual

        const pass = await waitUntil(async () => {
            actual = received.calls.length
            return actual > 0
        }, isNot, options)

        const message = enhanceError('mock', 0, actual, this, verb, expectation, '', options)

        return {
            pass,
            message: (): string => message
        }
    })
}

export function toBeRequested(...args: any): any {
    return runExpect.call(this, toBeRequestedFn, args)
}

