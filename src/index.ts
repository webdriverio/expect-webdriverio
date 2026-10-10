import './publicTypes/expectWebdriverIO.js'
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'
import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS, defaultOptionsList } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'
import { oneOf } from './matchers/asymmetrics/oneOf.js'
import { multiRemote } from './matchers/asymmetrics/multiRemote.js'
import { getGlobalSingleton } from './util/globalSingleton.js'
import type { MatchersObject } from './publicTypes/expectWebdriverIO.js'

interface SharedExpectSetup {
    wdioExpect: ExpectWebdriverIO.Expect
    wdioCustomMatchers: MatchersObject
}

// Builds the fully configured wdio `expect` exactly once, no matter how many module
// instances of this file end up loaded in the same process (see util/globalSingleton.ts).
// Running this more than once against the same underlying `expect` object would either
// throw (Object.defineProperty on an already-defined, non-configurable property) or
// silently double-wrap expectLib.extend - so every instance after the first just reuses
// the shared result instead of redoing this setup with its own local `expectLib`.
function createSharedExpectSetup(): SharedExpectSetup {
    const wdioCustomMatchers: MatchersObject = {}

    const extend = expectLib.extend
    expectLib.extend = (extendedMatchers) => {
        if (!extendedMatchers || typeof extendedMatchers !== 'object') {
            return
        }

        Object.entries(extendedMatchers).forEach(([name, matcher]) => {
            wdioCustomMatchers[name] = matcher
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
    // One function for the 2 signatures of the public type (strings, numbers)
    wdioExpect.oneOf = oneOf as ExpectWebdriverIO.Expect['oneOf']
    wdioExpect.multiRemote = multiRemote

    // Register soft assertions. `configurable: true` isn't for redefinition by us (this
    // function only ever runs once per process) - it guards against a rare mixed
    // CJS/ESM double-load of the `expect` package itself still resolving to the same
    // object, in which case a second, un-deduped setup pass would otherwise throw.
    Object.defineProperty(wdioExpect, 'soft', {
        configurable: true,
        value: <T = unknown>(actual: T) => createSoftExpect(wdioExpect, actual)
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

    return { wdioExpect, wdioCustomMatchers }
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

// Fully configured global expect instance with all the custom WDIO matchers, asymmetric matchers, and soft assertions
export const expect = sharedExpectSetup.wdioExpect

// Default options for the expect-webdriverio library
export const getDefaultOptions = (): DefaultOptions => DEFAULT_OPTIONS
export const setDefaultOptions = (options: Partial<DefaultOptions>): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Object.entries(options) as [keyof DefaultOptions, any][]).forEach(([key, value]) => {
        defaultOptionsList.forEach((option) => {
            if (key in option) {
                option[key] = value
            }
        })
    })
}

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

/**
 * The types of the global `ExpectWebdriverIO` namespace, also as exports of the module
 */
export type AfterAssertionHookParams = ExpectWebdriverIO.AfterAssertionHookParams
export type AssertionHookParams = ExpectWebdriverIO.AssertionHookParams
export type AssertionResult = ExpectWebdriverIO.AssertionResult
export type AsymmetricMatchers = ExpectWebdriverIO.AsymmetricMatchers
export type AsyncAssertionResult = ExpectWebdriverIO.AsyncAssertionResult
export type CommandOptions = ExpectWebdriverIO.CommandOptions
export type DefaultOptions = ExpectWebdriverIO.DefaultOptions
export type Expect = ExpectWebdriverIO.Expect
export type HTMLOptions = ExpectWebdriverIO.HTMLOptions
export type InverseAsymmetricMatchers = ExpectWebdriverIO.InverseAsymmetricMatchers
export type JsonCompatible = ExpectWebdriverIO.JsonCompatible
export type MatcherContext = ExpectWebdriverIO.MatcherContext
export type Matchers<R extends void | Promise<void>, T> = ExpectWebdriverIO.Matchers<R, T>
export type MatchersAndInverse<R extends void | Promise<void>, ActualT> = ExpectWebdriverIO.MatchersAndInverse<R, ActualT>
export type MultiRemotePartialMatcher<T> = ExpectWebdriverIO.MultiRemotePartialMatcher<T>
export type NumberMatcher = ExpectWebdriverIO.NumberMatcher
export type OneOfPartialMatcher<T> = ExpectWebdriverIO.OneOfPartialMatcher<T>
export type PartialMatcher<T> = ExpectWebdriverIO.PartialMatcher<T>
export type PartialMatcherAnything = ExpectWebdriverIO.PartialMatcherAnything
export type PromiseMatchers<T = unknown> = ExpectWebdriverIO.PromiseMatchers<T>
export type RequestedWith = ExpectWebdriverIO.RequestedWith
export type SnapshotServiceArgs = ExpectWebdriverIO.SnapshotServiceArgs
export type SoftFailure = ExpectWebdriverIO.SoftFailure
export type StringOptions = ExpectWebdriverIO.StringOptions
export type ToBeDisplayedOptions = ExpectWebdriverIO.ToBeDisplayedOptions
export type jsonArray = ExpectWebdriverIO.jsonArray
export type jsonObject = ExpectWebdriverIO.jsonObject
export type jsonPrimitive = ExpectWebdriverIO.jsonPrimitive
