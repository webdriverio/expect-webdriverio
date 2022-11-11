import { getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toBeClickableFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'clickable'

    const browser = getBrowserObject(await received)

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
