import { executeCommandBe } from '../../utils'

export function toBeDisplayedInViewport(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed in viewport'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isDisplayedInViewport().catch(() => false), options)
        return result
    })
}

export const toBeVisibleInViewport = toBeDisplayedInViewport
