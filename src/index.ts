/// <reference types="../types/expect-webdriverio.d.ts" />
import { expect as expectLib } from 'expect'
import type { WdioMatchersObject } from './types.js'
import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'

/**
 * Contains only the custom WDIO matchers to be used with `expect.extend()`.
 */
export const wdioCustomMatchers: WdioMatchersObject = new Map<string, RawMatcherFn>()

// @deprecated use `wdioCustomMatchers` instead
export const matchers = wdioCustomMatchers

const filteredMatchers = {}
const extend = expectLib.extend

// filter out matchers that aren't a function
Object.keys(wdioMatchers).forEach(matcher => {
    if (typeof wdioMatchers[matcher as keyof typeof wdioMatchers] === 'function') {
        filteredMatchers[matcher as keyof typeof filteredMatchers] = wdioMatchers[matcher as keyof typeof filteredMatchers]
    }
})

expectLib.extend = (m) => {
    if (!m || typeof m !== 'object') {
        return
    }

    Object.entries(m).forEach(([name, matcher]) => wdioCustomMatchers.set(name, matcher))
    return extend(m)
}

type MatchersObject = Parameters<typeof expectLib.extend>[0]

expectLib.extend(filteredMatchers as MatchersObject)

// Extend the expect object with soft assertions
const expectWithSoft = expectLib as unknown as ExpectWebdriverIO.Expect
Object.defineProperty(expectWithSoft, 'soft', {
    value: <T = unknown>(actual: T) => createSoftExpect(actual)
})

// Add soft assertions utility methods
Object.defineProperty(expectWithSoft, 'getSoftFailures', {
    value: (testId?: string) => SoftAssertService.getInstance().getFailures(testId)
})

Object.defineProperty(expectWithSoft, 'assertSoftFailures', {
    value: (testId?: string) => SoftAssertService.getInstance().assertNoFailures(testId)
})

Object.defineProperty(expectWithSoft, 'clearSoftFailures', {
    value: (testId?: string) => SoftAssertService.getInstance().clearFailures(testId)
})

export const expect = expectWithSoft

export const getConfig = (): ExpectWebdriverIO.DefaultOptions => DEFAULT_OPTIONS
export const setDefaultOptions = (options = {}): void => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            // @ts-ignore
            DEFAULT_OPTIONS[key] = value
        }
    })
}
export const setOptions = setDefaultOptions

/**
 * export snapshot utilities
 */
export { SnapshotService } from './snapshot.js'

/**
 * export soft assertion utilities
 */
export { SoftAssertService } from './softAssert.js'
export { SoftAssertionService, type SoftAssertionServiceOptions } from './softAssertService.js'

/**
 * export utils
 */
export * as utils from './utils.js'
