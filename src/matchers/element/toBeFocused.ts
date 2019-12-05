import { executeCommandBe } from '../../utils'

export function toBeFocused(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'focused'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isFocused(), options)
        return result
    })
}
