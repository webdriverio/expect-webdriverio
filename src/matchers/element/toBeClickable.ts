import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeClickableFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'clickable'

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => {
            try {
                return el.isClickable()
            } catch {
                return false
            }
        }, options)
        return result
    })
}

export function toBeClickable(...args: any) {
    return runExpect.call(this, toBeClickableFn, args)
}
