import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toBeFocused(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeFocusedFn, arguments)
}

function toBeFocusedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'focused'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isFocused(), options)
        return result
    })
}
