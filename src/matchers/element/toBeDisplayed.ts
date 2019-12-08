import { executeCommandBe } from '../../utils'
import { runExpect, getContext } from '../../util/expectAdapter'

export function toBeDisplayed(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeDisplayedFn, arguments)
}

function toBeDisplayedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed'

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

export function toBeVisible (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions) {
    const context = getContext(this)
    context.expectation = 'visible'
    return toBeDisplayed.call(context, el, options)
}
