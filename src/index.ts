/// <reference types="../types/expect-webdriverio.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'
import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS, defaultOptionsList } from './constants.js'
import createSoftExpect from './softExpect.js'
import { SoftAssertService } from './softAssert.js'

/**
 * Contains only the custom WDIO matchers to be used with `expect.extend()`.
 */
export const wdioCustomMatchers: MatchersObject = {}

/**
 * @deprecated use `wdioCustomMatchers` instead. To remove in v6
 */
export const matchers = new Map<string, RawMatcherFn>()

const filteredMatchers: MatchersObject = {}
const extend = expectLib.extend

// filter out matchers that aren't a function
Object.keys(wdioMatchers).forEach(matcher => {
    if (typeof wdioMatchers[matcher as keyof typeof wdioMatchers] === 'function') {
        filteredMatchers[matcher] = wdioMatchers[matcher as keyof typeof wdioMatchers] as RawMatcherFn
    }
})

expectLib.extend = function (this: ExpectWebdriverIO.Expect, allMatchers) {
    if (!allMatchers || typeof allMatchers !== 'object') {
        return
    }

    Object.entries(allMatchers).forEach(([name, matcher]) => {
        wdioCustomMatchers[name] = matcher
        matchers.set(name, matcher)
    })
    extend(allMatchers)
}

expectLib.extend(filteredMatchers)

/**
 * Override expect(element) to add some modifiers
 */
const wdioExpect = ((actual: unknown, ...args: Array<unknown>) => {
    // @ts-expect-error
    const expectation = expectLib(actual, ...args)

    Object.defineProperty(expectation, 'some', {
        value: {},
        writable: true,
        enumerable: true,
        configurable: true
    })

    Object.keys(wdioCustomMatchers).forEach((name) => {
        // @ts-expect-error
        const originalMatcher = expectation[name]

        // @ts-expect-error -- Wrap the matcher so we can inject context
        expectation.some[name] = (...matcherArgs: unknown[]) => {

            // @ts-expect-error
            expectLib.setState({ isSome: true })

            try {
                // 2. Call original matcher
                return originalMatcher.apply(expectation, matcherArgs)
            } finally {
                // @ts-expect-error
                // 3. Cleanup: Always remove the flag to prevent pollution
                expectLib.setState({ isSome: false })
            }

        }
    })

    return expectation
}) as unknown as ExpectWebdriverIO.Expect
// Re-attach properties/methods of the original expect function to the new wdioExpect function
Object.assign(wdioExpect, expectLib)

// Extend the expect object with soft assertions
const expectWithSoft = wdioExpect as unknown as ExpectWebdriverIO.Expect
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

export const expect = wdioExpect

// Default options for the expect-webdriverio library
export const getDefaultOptions = (): ExpectWebdriverIO.DefaultOptions => DEFAULT_OPTIONS
export const setDefaultOptions = (options: Partial<ExpectWebdriverIO.DefaultOptions>): void => {
    Object.entries(options).forEach(([key, value]) => {
        defaultOptionsList.forEach((option) => {
            if (key in option) {
                // @ts-ignore
                option[key] = value
            }
        })
    })
}

export const setFeatureFlags = (featureFlags: Partial<ExpectWebdriverIO.FeatureFlags>): void => {
    Object.entries(featureFlags).forEach(([ffName, ffValue]) => {
        defaultOptionsList.forEach((option) => {
            const featureFlags = option.featureFlags
            // @ts-ignore
            featureFlags[ffName] = ffValue
        })
    })
}

/** @deprecated use setDefaultOptions instead. Will be removed in v6.0.0 */
export const setOptions = setDefaultOptions
/** @deprecated use `getDefaultOptions` instead, will be removed in v6.0.0 */
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
