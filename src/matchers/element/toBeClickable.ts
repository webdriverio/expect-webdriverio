
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeClickableFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}): any {
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

export function toBeClickable(...args: any) {
    return runExpect.call(this || {}, toBeClickableFn, args)
}
