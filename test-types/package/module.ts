import { expect, wdioCustomMatchers, setDefaultOptions, SoftAssertionService } from 'expect-webdriverio'
import { some, multiRemote } from 'expect-webdriverio/api'

declare const el: WebdriverIO.Element
declare const els: WebdriverIO.ElementArray

export async function check() {
    await expect(el).toHaveText('text')
    await expect(some(els)).toBeDisplayed()
    await expect(el).toHaveText(multiRemote({ chrome: 'text' }))
    // @ts-expect-error an attribute name is a string
    await expect(el).toHaveAttribute(1)

    setDefaultOptions({ wait: 1000 })
    // @ts-expect-error `wait` is a number
    setDefaultOptions({ wait: '1000' })

    // @ts-expect-error `beforeTest` takes a `@wdio/types` test: fails when `@wdio/types` does not resolve
    new SoftAssertionService().beforeTest(1)

    return wdioCustomMatchers
}
