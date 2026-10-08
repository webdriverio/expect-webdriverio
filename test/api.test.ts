import { describe, expect as vitestExpect, test } from 'vitest'
import { expect as expectLib } from 'expect'

import { expect, wdioCustomMatchers } from '../src/index.js'
import { asymmetricMatcherNames, inverseAsymmetricMatcherNames, wdioCustomMatcherNames } from '../src/api/index.js'

/**
 * The api has no imports of the matchers, so the lists are written by hand. These tests keep them equal to what `expect` has.
 */
describe('api', () => {
    // `expect.extend()` also adds each matcher to `expect` and `expect.not` as an asymmetric matcher
    const asymmetricKeys = (target: object) => Object.keys(target).filter((name) => !(name in wdioCustomMatchers))

    test('wdioCustomMatcherNames has each matcher that expect-webdriverio registers', () => {
        vitestExpect([...wdioCustomMatcherNames].sort()).toEqual(Object.keys(wdioCustomMatchers).sort())
    })

    test('asymmetricMatcherNames has each asymmetric matcher on expect', () => {
        const fromExpectLib = asymmetricKeys(expectLib.not)
        const expected = [...fromExpectLib, 'any', 'anything', 'oneOf', 'multiRemote']

        vitestExpect([...asymmetricMatcherNames].sort()).toEqual(expected.sort())
        asymmetricMatcherNames.forEach((name) => vitestExpect(expect[name]).toBeTypeOf('function'))
    })

    test('inverseAsymmetricMatcherNames has each asymmetric matcher on expect.not', () => {
        vitestExpect([...inverseAsymmetricMatcherNames].sort()).toEqual(asymmetricKeys(expect.not).sort())
    })
})
