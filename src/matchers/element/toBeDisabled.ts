import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeDisabledFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}): any {
    this.expectation = this.expectation || 'disabled'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)
        return result
    })
}

export function toBeDisabled(...args: any): any {
    return runExpect.call(this, toBeDisabledFn, args)
}
