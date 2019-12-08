
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toBeClickable(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeClickableFn, arguments)
}

function toBeClickableFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'clickable'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => {
            try {
                return el.isClickable()
            } catch {
                return false
            }
        }, options)
        return result
    })
}
