import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toBeDisplayedInViewport(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeDisplayedInViewportFn, arguments)
}

function toBeDisplayedInViewportFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed in viewport'

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

export const toBeVisibleInViewport = toBeDisplayedInViewport
