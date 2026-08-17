/// <reference types="../types/expect-webdriverio.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'
import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS, defaultOptionsList } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'
import { oneOf } from './matchers/asymmetrics/oneOf.js'
import { some as wdioSome } from './matchers/modifiers/some.js'
import packageJson from '../package.json' with { type: 'json' }

const wdioExpect = expectLib as unknown as ExpectWebdriverIO.Expect & { __wdio_version?: string }

const MATCHERS_VERSION = packageJson.version

// Warn if a different version already decorated expect
if ((wdioExpect.__wdio_version && wdioExpect.__wdio_version !== MATCHERS_VERSION) || (!wdioExpect.__wdio_version && wdioExpect.soft !== undefined)) {
    if (wdioExpect.__wdio_version) {
        console.warn(
            `[expect-webdriverio] Conflict: Initializing v${MATCHERS_VERSION}, but v${wdioExpect.__wdio_version} is already loaded.`
        )
    } else {
        console.warn(
            `[expect-webdriverio] Conflict: Initializing v${MATCHERS_VERSION}, but an older version of expect-webdriverio is already loaded.`
        )
    }
}
wdioExpect.__wdio_version = MATCHERS_VERSION

/**
 * Contains the custom WDIO matchers, registered through `expect.extend()`.
 * 1. Wdio custom matchers like `expect(element).toBeDisplayed()`
 * 2. Other User defined matchers registered through `expect.extend()`
 *
 * Does NOT include the default matchers from the `expect` library, like `toBe`, `toEqual`, or wdio asymmetrics like `expect.oneOf()`
 */
export const wdioCustomMatchers: MatchersObject = {}

/**
 * @deprecated use `wdioCustomMatchers` instead. To remove in v6
 */
export const matchers = new Map<string, RawMatcherFn>()

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

// Register normal matchers like `expect(element).toBeDisplayed()`
wdioExpect.extend(filteredWdioMatchers)
// Register asymmetric matchers like `expect.oneOf(...)`
wdioExpect.oneOf = oneOf

// Register only if was not already registered!
if (wdioExpect.soft === undefined) {
    // Register soft assertions
    Object.defineProperty(wdioExpect, 'soft', {
        value: <T = unknown>(actual: T) => createSoftExpect(actual)
    })

    // Add soft assertions utility methods
    Object.defineProperty(wdioExpect, 'getSoftFailures', {
        value: (testId?: string) => SoftAssertService.getInstance().getFailures(testId)
    })

    Object.defineProperty(wdioExpect, 'assertSoftFailures', {
        value: (testId?: string) => SoftAssertService.getInstance().assertNoFailures(testId)
    })

    Object.defineProperty(wdioExpect, 'clearSoftFailures', {
        value: (testId?: string) => SoftAssertService.getInstance().clearFailures(testId)
    })
}

// Fully configured global expect instance with all the custom WDIO matchers, asymmetric matchers, and soft assertions
export const expect = wdioExpect
export const some = wdioSome

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
