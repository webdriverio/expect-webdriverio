import { describe, expect as vitestExpect, test } from 'vitest'

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

    // The functions of `expect` that are not asymmetric matchers. A new function of `expect` fails the test below,
    // so that someone checks whether it is an asymmetric matcher
    const expectApi = new Set(['extend', 'addEqualityTesters', 'assertions', 'hasAssertions', 'getState', 'setState', 'extractExpectedAssertionsErrors'])

    test('asymmetricMatcherNames has each asymmetric matcher on expect', () => {
        const functions = asymmetricKeys(expect).filter((name) => typeof (expect as unknown as Record<string, unknown>)[name] === 'function')

        vitestExpect([...asymmetricMatcherNames].sort()).toEqual(functions.filter((name) => !expectApi.has(name)).sort())
    })

    test('inverseAsymmetricMatcherNames has each asymmetric matcher on expect.not', () => {
        vitestExpect([...inverseAsymmetricMatcherNames].sort()).toEqual(asymmetricKeys(expect.not).sort())
    })
})
