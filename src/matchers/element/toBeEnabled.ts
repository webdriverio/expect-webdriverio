import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toBeEnabled(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeEnabledFn, arguments)
}

function toBeEnabledFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'enabled'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isEnabled(), options)
        return result
    })
}
