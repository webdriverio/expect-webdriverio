import { executeCommandBe } from '../../utils'

export function toBeDisplayed(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isDisplayed().catch(() => false), options)
        return result
    })
}

export function toBeVisible (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'visible'
    return toBeDisplayed.call(this, el, options)
}
