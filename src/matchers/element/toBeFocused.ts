import { executeCommandBe } from '../../utils.js'

export function toBeFocused(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'focused'
    return executeCommandBe.call(this, received, el => el.isFocused(), options)
}
