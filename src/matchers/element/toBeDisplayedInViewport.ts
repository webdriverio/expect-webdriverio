import { executeCommandBe, aliasFn } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeDisplayedInViewportFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}): any {
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

export function toBeDisplayedInViewport(...args: any): any {
    return runExpect.call(this, toBeDisplayedInViewportFn, args)
}