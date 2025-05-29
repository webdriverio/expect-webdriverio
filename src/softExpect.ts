import { expect, matchers } from './index.js'
import { SoftAssertService } from './softAssert.js'

/**
 * Creates a soft assertion wrapper using lazy evaluation
 * Only creates matchers when they're actually accessed
 */
const createSoftExpect = <T = unknown>(actual: T): ExpectWebdriverIO.Matchers<Promise<void>, T> => {
    const softService = SoftAssertService.getInstance()

    // Use a simple proxy that creates matchers on-demand
    return new Proxy({} as ExpectWebdriverIO.Matchers<Promise<void>, T>, {
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

            // Handle matchers
            if (matchers.has(propName)) {
                return createSoftMatcher(actual, propName, softService)
            }

            // For any other properties, return undefined
            return undefined
        }
    })
}

/**
 * Creates a soft .not proxy
 */
const createSoftNotProxy = <T>(actual: T, softService: SoftAssertService) => {
    return new Proxy({} as ExpectWebdriverIO.Matchers<Promise<void>, T>, {
        get(target, prop) {
            const propName = String(prop)
            if (matchers.has(propName)) {
                return createSoftMatcher(actual, propName, softService, 'not')
            }
            return undefined
        }
    })
}

/**
 * Creates a soft chain proxy (resolves/rejects)
 */
const createSoftChainProxy = <T>(actual: T, chainType: string, softService: SoftAssertService) => {
    return new Proxy({} as ExpectWebdriverIO.Matchers<Promise<void>, T>, {
        get(target, prop) {
            const propName = String(prop)
            if (matchers.has(propName)) {
                return createSoftMatcher(actual, propName, softService, chainType)
            }
            return undefined
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
    return async (...args: unknown[]) => {
        try {
            // Build the expectation chain
            let expectChain = expect(actual)

            if (prefix === 'not') {
                expectChain = expectChain.not
            } else if (prefix === 'resolves') {
                expectChain = expectChain.resolves
            } else if (prefix === 'rejects') {
                expectChain = expectChain.rejects
            }

            return await ((expectChain as unknown) as Record<string, (...args: unknown[]) => Promise<ExpectWebdriverIO.AssertionResult>>)[matcherName](...args)

        } catch (error) {
            // Record the failure
            const fullMatcherName = prefix ? `${prefix}.${matcherName}` : matcherName
            softService.addFailure(error as Error, fullMatcherName)

            // Return a passing result to continue execution
            return {
                pass: true,
                message: () => `Soft assertion failed: ${fullMatcherName}`
            }
        }
    }
}

export default createSoftExpect
