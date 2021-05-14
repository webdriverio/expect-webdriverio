import { executeCommandBe, aliasFn } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeDisplayedFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}): any {
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

export function toBeDisplayed(...args: any): any {
    return runExpect.call(this, toBeDisplayedFn, args)
}