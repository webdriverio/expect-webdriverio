/// <reference types="../types/expect-webdriverio.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'
import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS, defaultOptionsList } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'
import { oneOf } from './matchers/asymmetrics/oneOf.js'
import { getGlobalSingleton } from './util/globalSingleton.js'

interface SharedExpectSetup {
    wdioExpect: ExpectWebdriverIO.Expect
    wdioCustomMatchers: MatchersObject
    matchers: Map<string, RawMatcherFn>
}

// Builds the fully configured wdio `expect` exactly once, no matter how many module
// instances of this file end up loaded in the same process (see util/globalSingleton.ts).
// Running this more than once against the same underlying `expect` object would either
// throw (Object.defineProperty on an already-defined, non-configurable property) or
// silently double-wrap expectLib.extend - so every instance after the first just reuses
// the shared result instead of redoing this setup with its own local `expectLib`.
function createSharedExpectSetup(): SharedExpectSetup {
    const wdioCustomMatchers: MatchersObject = {}
    const matchers = new Map<string, RawMatcherFn>()

    const extend = expectLib.extend
    expectLib.extend = (extendedMatchers) => {
        if (!extendedMatchers || typeof extendedMatchers !== 'object') {
            return
        }

        Object.entries(extendedMatchers).forEach(([name, matcher]) => {
            wdioCustomMatchers[name] = matcher
            matchers.set(name, matcher)
        })
        return extend(extendedMatchers)
    }

    const filteredWdioMatchers: MatchersObject = {}
    // Filter out matchers that aren't a function
    Object.entries(wdioMatchers).forEach(([matcher, value]) => {
        if (typeof value === 'function') {
            filteredWdioMatchers[matcher] = value as RawMatcherFn
        }
    })

    const wdioExpect = expectLib as unknown as ExpectWebdriverIO.Expect

    // Register normal matchers like `expect(element).toBeDisplayed()`
    wdioExpect.extend(filteredWdioMatchers)
    // Register asymmetric matchers like `expect.oneOf(...)`
    wdioExpect.oneOf = oneOf

    // Register soft assertions. `configurable: true` isn't for redefinition by us (this
    // function only ever runs once per process) - it guards against a rare mixed
    // CJS/ESM double-load of the `expect` package itself still resolving to the same
    // object, in which case a second, un-deduped setup pass would otherwise throw.
    Object.defineProperty(wdioExpect, 'soft', {
        configurable: true,
        value: <T = unknown>(actual: T) => createSoftExpect(actual)
    })

    // Add soft assertions utility methods
    Object.defineProperty(wdioExpect, 'getSoftFailures', {
        configurable: true,
        value: (testId?: string) => SoftAssertService.getInstance().getFailures(testId)
    })

    Object.defineProperty(wdioExpect, 'assertSoftFailures', {
        configurable: true,
        value: (testId?: string) => SoftAssertService.getInstance().assertNoFailures(testId)
    })

    Object.defineProperty(wdioExpect, 'clearSoftFailures', {
        configurable: true,
        value: (testId?: string) => SoftAssertService.getInstance().clearFailures(testId)
    })

    return { wdioExpect, wdioCustomMatchers, matchers }
}

const sharedExpectSetup = getGlobalSingleton('expect', createSharedExpectSetup)

/**
 * Contains the custom WDIO matchers, registered through `expect.extend()`.
 * 1. Wdio custom matchers like `expect(element).toBeDisplayed()`
 * 2. Other User defined matchers registered through `expect.extend()`
 *
 * Does NOT include the default matchers from the `expect` library, like `toBe`, `toEqual`, or wdio asymmetrics like `expect.oneOf()`
 */
export const wdioCustomMatchers = sharedExpectSetup.wdioCustomMatchers

/**
 * @deprecated use `wdioCustomMatchers` instead. To remove in v6
 */
export const matchers = sharedExpectSetup.matchers

// Fully configured global expect instance with all the custom WDIO matchers, asymmetric matchers, and soft assertions
export const expect = sharedExpectSetup.wdioExpect

// Default options for the expect-webdriverio library
export const getDefaultOptions = (): ExpectWebdriverIO.DefaultOptions => DEFAULT_OPTIONS
export const setDefaultOptions = (options: Partial<ExpectWebdriverIO.DefaultOptions>): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Object.entries(options) as [keyof ExpectWebdriverIO.DefaultOptions, any][]).forEach(([key, value]) => {
        defaultOptionsList.forEach((option) => {
            if (key in option) {
                option[key] = value
            }
        })
    })
}

export const setFeatureFlags = (featureFlags: Partial<ExpectWebdriverIO.FeatureFlags>): void => {
    (Object.entries(featureFlags) as [keyof ExpectWebdriverIO.FeatureFlags, boolean][]).forEach(([ffName, ffValue]) => {
        defaultOptionsList.forEach((option) => {
            option.featureFlags[ffName] = ffValue
        })
    })
}

/** @deprecated since v6.0.0, use setDefaultOptions instead. Will be removed in v8.0.0 */
export const setOptions = setDefaultOptions
/** @deprecated since v6.0.0, use `getDefaultOptions` instead, will be removed in v8.0.0 */
export const getConfig = getDefaultOptions

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
