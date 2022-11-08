import { getFirstElement, getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toBeEnabledFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'enabled'

    const el = await getFirstElement(received)
    const browser = getBrowserObject(el)

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isEnabled(), options)
        return result
    })
}

export function toBeEnabled(...args: any): any {
    return runExpect.call(this || {}, toBeEnabledFn, args)
}
