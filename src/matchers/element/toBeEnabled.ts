import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeEnabledFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}): any {
    this.expectation = this.expectation || 'enabled'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isEnabled(), options)
        return result
    })
}

export function toBeEnabled(...args: any): any {
    return runExpect.call(this, toBeEnabledFn, args)
}

