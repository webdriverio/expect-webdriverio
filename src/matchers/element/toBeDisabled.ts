import { browser } from '@wdio/globals'

import { executeCommandBe } from '../../utils'
import type { WdioElementMaybePromise } from '../../types'

export function toBeDisabled(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}): any {
    this.expectation = this.expectation || 'disabled'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)
        return result
    })
}
