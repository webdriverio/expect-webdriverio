import { expect, wdioCustomMatchers, setDefaultOptions, SoftAssertionService } from 'expect-webdriverio'
import { some, multiRemote, wdioCustomMatcherNames } from 'expect-webdriverio/api'

declare const el: WebdriverIO.Element
declare const els: WebdriverIO.ElementArray
declare const NsSoftAssertionService: typeof ExpectWebdriverIO.SoftAssertionService

export async function check() {
    await expect(el).toHaveText('text')
    await expect(some(els)).toBeDisplayed()
    await expect(el).toHaveText(multiRemote({ chrome: 'text' }))
    // The Jest matchers of the export, which a framework adapter must not hide (`@wdio/jasmine-framework` v10 types the global `expect`)
    await expect({ a: 1 }).toHaveProperty('a')
    await expect(Promise.resolve(1)).resolves.toBe(1)
    // @ts-expect-error an attribute name is a string
    await expect(el).toHaveAttribute(1)

    setDefaultOptions({ wait: 1000 })
    // @ts-expect-error `wait` is a number
    setDefaultOptions({ wait: '1000' })

    // @ts-expect-error `beforeTest` takes a `@wdio/types` test: fails when `@wdio/types` does not resolve
    new SoftAssertionService().beforeTest(1)
    new SoftAssertionService({ autoAssertOnTestEnd: false })
    // @ts-expect-error the service takes only its options, not the capabilities and the config
    new SoftAssertionService({}, {}, {})
    // @ts-expect-error the global namespace type is the same as the export
    new NsSoftAssertionService({}, {}, {})

    // @ts-expect-error the list has only the names of the matchers
    wdioCustomMatcherNames.includes('toBeCustom')

    return wdioCustomMatchers
}
