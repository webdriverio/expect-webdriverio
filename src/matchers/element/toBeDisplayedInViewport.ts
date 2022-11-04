import { getFirstElement, getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toBeDisplayedInViewportFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed in viewport'

    const el = await getFirstElement(received)
    const browser = getBrowserObject(el)

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => {
            try {
                return el.isDisplayedInViewport()
            } catch {
                return false
            }
        }, options)
        return result
    })
}

export function toBeDisplayedInViewport(...args: any): any {
    return runExpect.call(this || {}, toBeDisplayedInViewportFn, args)
}
