/// <reference types="../types/standalone.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'

import wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'

export const matchers = new Map<string, RawMatcherFn>()

const extend = expectLib.extend
expectLib.extend = (m) => {
    if (!m || typeof m !== 'object') {
        return
    }

    Object.entries(m).forEach(([name, matcher]) => matchers.set(name, matcher))
    return extend(m)
}

type MatchersObject = Parameters<typeof expectLib.extend>[0]

expectLib.extend(wdioMatchers as MatchersObject)

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
