/// <reference types="../types/standalone.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'

import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'

export const matchers = new Map<string, RawMatcherFn>()
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

    Object.entries(m).forEach(([name, matcher]) => matchers.set(name, matcher))
    return extend(m)
}

type MatchersObject = Parameters<typeof expectLib.extend>[0]

expectLib.extend(filteredMatchers as MatchersObject)

// Extend the expect object with soft assertions
const expectWithSoft = expectLib as unknown as ExpectWebdriverIO.Expect

type SoftHelpers = {
    soft: <T = unknown>(actual: T) => ReturnType<typeof createSoftExpect>
    getSoftFailures: (testId?: string) => ReturnType<SoftAssertService['getFailures']>
    assertSoftFailures: (testId?: string) => void
    clearSoftFailures: (testId?: string) => void
}

const helperFactories: SoftHelpers = {
    soft:  <T = unknown>(actual: T) => createSoftExpect(actual),

    getSoftFailures: (testId?: string) =>
        SoftAssertService.getInstance().getFailures(testId),

    assertSoftFailures: (testId?: string) =>
        SoftAssertService.getInstance().assertNoFailures(testId),

    clearSoftFailures: (testId?: string) =>
        SoftAssertService.getInstance().clearFailures(testId)
}

for (const [name, fn] of Object.entries(helperFactories)) {
    if (!(name in expectWithSoft)) {
        Object.defineProperty(expectWithSoft, name, { value: fn })
    }
}

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
