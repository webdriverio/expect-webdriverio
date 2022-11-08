import { getFirstElement, getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toBeDisplayedFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed'

    const el = await getFirstElement(received)
    const browser = getBrowserObject(el)

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => {
            try {
                return el.isDisplayed()
            } catch {
                return false
            }
        }, options)
        return result
    })
}

export function toBeDisplayed(...args: any): any {
    return runExpect.call(this || {}, toBeDisplayedFn, args)
}
