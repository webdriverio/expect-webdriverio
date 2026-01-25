import { expect } from './index.js'
import { SoftAssertService } from './softAssert.js'
import type { SyncExpectationResult } from 'expect'

const isPossibleMatcher = (propName: string) => propName.startsWith('to') && propName.length > 2

/**
 * Creates a soft assertion wrapper using lazy evaluation
 * Only creates matchers when they're actually accessed
 */
const createSoftExpect = <T = unknown>(actual: T): ExpectWebdriverIO.Matchers<Promise<void> | void, T> => {
    const softService = SoftAssertService.getInstance()

    // Use a simple proxy that creates matchers on-demand
    return new Proxy({} as ExpectWebdriverIO.Matchers<Promise<void> | void, T>, {
        get(target, prop) {
            const propName = String(prop)

            // Handle .not specially
            if (propName === 'not') {
                return createSoftNotProxy(actual, softService)
            }

            // Handle resolves/rejects (rarely used in WebdriverIO)
            if (propName === 'resolves' || propName === 'rejects') {
                return createSoftChainProxy(actual, propName, softService)
            }

            if (isPossibleMatcher(propName)) {
                // Support basic & wdio (and more) matchers that start with "to"
                return createSoftMatcher(actual, propName, softService)
            }
            return undefined
        }
    })
}

/**
 * Creates a soft .not proxy
 */
const createSoftNotProxy = <T>(actual: T, softService: SoftAssertService) => {
    return new Proxy({} as ExpectWebdriverIO.Matchers<Promise<void> | void, T>, {
        get(_target, prop) {
            const propName = String(prop)
            return isPossibleMatcher(propName) ? createSoftMatcher(actual, propName, softService, 'not') : undefined
        }
    })
}

/**
 * Creates a soft chain proxy (resolves/rejects)
 */
const createSoftChainProxy = <T>(actual: T, chainType: string, softService: SoftAssertService) => {
    return new Proxy({} as ExpectWebdriverIO.Matchers<Promise<void> | void, T>, {
        get(_target, prop) {
            const propName = String(prop)
            return isPossibleMatcher(propName) ? createSoftMatcher(actual, propName, softService, chainType) : undefined
        }
    })
}

/**
 * Creates a single soft matcher function
 */
const createSoftMatcher = <T>(
    actual: T,
    matcherName: string,
    softService: SoftAssertService,
    prefix?: string
) => {
    return (...args: unknown[]) => {
        try {
            // Build the expectation chain
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let expectChain: any = expect(actual)

            if (prefix === 'not') {
                expectChain = expectChain.not
            } else if (prefix === 'resolves') {
                expectChain = expectChain.resolves
            } else if (prefix === 'rejects') {
                expectChain = expectChain.rejects
            }

            // In case of matchers failures we jump into the catch block below
            const assertionResult: ExpectWebdriverIO.AsyncAssertionResult | SyncExpectationResult  = expectChain[matcherName](...args)

            // Handle async matchers, and allow to not be a promise for basic non-async matchers
            if ( assertionResult instanceof Promise) {
                return assertionResult.catch((error: Error) => handlingMatcherFailure(prefix, matcherName, softService, error))
            }
            return assertionResult

        } catch (error) {
            return handlingMatcherFailure(prefix, matcherName, softService, error as Error)
        }
    }
}

function handlingMatcherFailure(prefix: string | undefined, matcherName: string, softService: SoftAssertService, error: unknown) {
    // Record the failure
    const fullMatcherName = prefix ? `${prefix}.${matcherName}` : matcherName
    softService.addFailure(error as Error, fullMatcherName)

    // Return a passing result to continue execution
    return {
        pass: true,
        message: () => `Soft assertion failed: ${fullMatcherName}`
    }
}

export default createSoftExpect
