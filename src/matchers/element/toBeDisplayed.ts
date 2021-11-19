import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeDisplayedFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'displayed'

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
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
