import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toBeDisabled(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeDisabledFn, arguments)
}

function toBeDisabledFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'disabled'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)
        return result
    })
}
