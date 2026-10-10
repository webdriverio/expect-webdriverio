import { expectTypeOf, test } from 'vitest'
import { expect as wdioExpect } from '../../src/index.js'
import type { ExpectedOf } from '../../src/publicTypes/expectWebdriverIO.js'
import type { compareStyle, compareTextOrOneOf } from '../../src/utils.js'
import type { validateNumberMatcher } from '../../src/util/numberOptionsUtil.js'
import type { MaybeArrayOrOneOf, MaybeOneOf } from '../../src/publicTypes/expectWebdriverIO.js'

/**
 * A matcher accepts what its compare function compares: the public type of the matcher and the parameter of the compare
 * function are the same `ExpectedOf<>` type. Checked by `tsc` (`pnpm run test:tsc`), as the types of `test/`.
 */
const element = {} as WebdriverIO.Element
const browser = {} as WebdriverIO.Browser
const networkMock = {} as WebdriverIO.Mock

test('strings', () => {
    expectTypeOf<Parameters<typeof compareTextOrOneOf>[1]>().toEqualTypeOf<MaybeArrayOrOneOf<ExpectedOf<'string'>> | undefined>()
    expectTypeOf(wdioExpect(element).toHaveText).parameter(0).toEqualTypeOf<MaybeOneOf<ExpectedOf<'string'>>>()
    expectTypeOf(wdioExpect(element).toHaveHTML).parameter(0).toEqualTypeOf<MaybeOneOf<ExpectedOf<'string'>>>()
    expectTypeOf(wdioExpect(browser).toHaveTitle).parameter(0).toEqualTypeOf<ExpectedOf<'string'>>()
    expectTypeOf(wdioExpect(browser).toHaveUrl).parameter(0).toEqualTypeOf<ExpectedOf<'string'>>()
})

test('style values', () => {
    expectTypeOf<Parameters<typeof compareStyle>[1]>().toEqualTypeOf<{ [key: string]: ExpectedOf<'style'> }>()
    expectTypeOf(wdioExpect(element).toHaveStyle).parameter(0).toEqualTypeOf<{ [key: string]: ExpectedOf<'style'> }>()
})

test('numbers', () => {
    expectTypeOf<Parameters<typeof validateNumberMatcher>[0]>().toEqualTypeOf<ExpectedOf<'number'> | undefined>()
    expectTypeOf(wdioExpect(element).toHaveWidth).parameter(0).toEqualTypeOf<ExpectedOf<'number'>>()
    expectTypeOf(wdioExpect(element).toHaveHeight).parameter(0).toEqualTypeOf<ExpectedOf<'number'>>()
    expectTypeOf(wdioExpect(networkMock).toBeRequestedTimes).parameter(0).toEqualTypeOf<ExpectedOf<'number'>>()
})

test('sizes', () => {
    expectTypeOf(wdioExpect(element).toHaveSize).parameter(0).toEqualTypeOf<ExpectedOf<'size'>>()
})
