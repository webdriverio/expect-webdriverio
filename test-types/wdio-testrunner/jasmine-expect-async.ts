import { expectTypeOf } from 'vitest'
import { browser, $ } from '@wdio/globals'

describe('WebdriverIO testrunner with Jasmine and `expect-webdriverio/jasmine`', () => {
    describe('`expectAsync`', () => {
        it('should have the WDIO matchers', async () => {
            expectTypeOf(expectAsync(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
        })

        it('should have the Jasmine async matchers', async () => {
            expectTypeOf(expectAsync(Promise.resolve(true)).toBeResolvedTo(true)).toEqualTypeOf<PromiseLike<void>>()
        })
    })
})
