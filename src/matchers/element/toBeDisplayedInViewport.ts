import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeDisplayedInViewportFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'displayed in viewport'

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
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
