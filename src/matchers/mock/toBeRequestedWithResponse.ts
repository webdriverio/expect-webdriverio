import { waitUntil, enhanceError } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { equals } from '../../jasmineUtils'

function toBeRequestedWithResponseFn(received: WebdriverIO.Mock, response: any, options: ExpectWebdriverIO.CommandOptions = {}): any {
    const isNot = this.isNot || false
    const { expectation = 'called', verb = 'be' } = this

    return browser.call(async () => {
        let actual
        const pass = await waitUntil(async () => {
            if (received.calls.length === 0) {
                return isNot
            }

            if (isNot) {
                return !received.calls.reduce(
                    (res, mock) => res || equals(mock?.body, response),
                    false
                )
            }

            return Boolean(received.calls.find((mock) => {
                actual = mock?.body
                return !isNot === equals(mock?.body, response)
            }))
        })

        const message = enhanceError('mock', response, actual, this, verb, expectation, '', options)
        return {
            pass,
            message: (): string => message
        }
    })
}

export function toBeRequestedWithResponse(...args: any): any {
    return runExpect.call(this, toBeRequestedWithResponseFn, args)
}

