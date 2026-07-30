import { DEFAULT_OPTIONS } from '../constants.js'
import type { StrategyResult } from './executeCommand.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class ForceAbortError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ForceAbortError'
    }
}

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval, etc
 */
export const waitUntil = async <T>(
    condition: () => Promise<StrategyResult<T>>,
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {}
): Promise<StrategyResult<T>> => {
    // single attempt
    if (wait === 0) {
        return await condition()
    }

    let error: Error | undefined

    // wait for condition to be truthy
    let result: StrategyResult<T> | undefined
    try {
        const start = Date.now()
        while (true) {
            if (Date.now() - start > wait) {
                throw new Error('timeout')
            }

            try {
                result = await condition()
                const passed = isNot !== result?.success
                error = undefined
                if (passed) {
                    break
                } else if (result?.abort) {
                    throw new ForceAbortError('force abort')
                }
                await sleep(interval)
            } catch (err) {
                error = err
                await sleep(interval)
            }
        }

        if (error) {
            throw error
        }

        result.success = !isNot

        return result
    } catch {
        if (error && !(error instanceof ForceAbortError)) {
            throw error
        }

        return { subject: result?.subject, success: isNot, actual: result?.actual }
    }
}
