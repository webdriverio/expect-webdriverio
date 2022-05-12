import { executeCommandBe } from '../../utils'

export function toBeDisplayed(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}): any {
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
