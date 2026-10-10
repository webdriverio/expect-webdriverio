import { test, expect } from 'vitest'
import { expect as expectExport, utils, wdioCustomMatchers } from '../src/index.js'

test('index', () => {
    expect(expectExport).toBeDefined()
    expect(utils.compareText).toBeDefined()

    expect(Object.keys(wdioCustomMatchers).length).toEqual(41)
})

test('the public utils keep their members, also when a helper moves to another module', () => {
    expect(Object.keys(utils).sort()).toEqual([
        'compareObject',
        'compareStyle',
        'compareText',
        'compareTextOrOneOf',
        'enhanceError',
        'executeCommandBe',
        'getAsymmetricMatcherValue',
        'getStringAsymmetricMatcherValue',
        'isArrayContainingMatcher',
        'isAsymmetricMatcher',
        'isInversedStringContainingMatcher',
        'isInversedStringMatchingMatcher',
        'isJasmineStringAsymmetricMatcher',
        'isStringContainingMatcherLike',
        'isStringMatchingMatcherLike',
        'toArray',
        'waitUntil',
        'wrapExpectedWithArray',
    ])
})
