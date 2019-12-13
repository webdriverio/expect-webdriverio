import { executeCommandBe, aliasFn } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toBeDisplayed(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeDisplayedFn, arguments)
}

function toBeDisplayedFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
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

export function toBeVisible(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    return aliasFn.call(this, toBeDisplayed, { expectation: 'visible' }, el, options)
}
