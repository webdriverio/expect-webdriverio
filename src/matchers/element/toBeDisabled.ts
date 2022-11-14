import { getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toBeDisabledFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'disabled'

    received = await received
    const browser = await getBrowserObject(await received)

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)
        return result
    })
}

export function toBeDisabled(...args: any): any {
    return runExpect.call(this || {}, toBeDisabledFn, args)
}
