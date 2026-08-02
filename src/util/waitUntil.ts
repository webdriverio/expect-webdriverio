import { DEFAULT_OPTIONS } from '../constants.js'
import type { StrategyResult } from './executeCommand.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval, etc
 */
export const waitUntil = async <T>(
    condition: (iteration: number) => Promise<StrategyResult<T>>,
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {}
): Promise<StrategyResult<T>> => {
    // single attempt
    if (wait === 0) {
        return await condition(0)
    }

    let error: Error | undefined

    // wait for condition to be truthy
    let result: StrategyResult<T> | undefined
    let iteration = 0
    try {
        const start = Date.now()
        while (true) {
            if (Date.now() - start > wait) {
                throw new Error('timeout')
            }

            try {
                result = await condition(iteration++)
                const passed = isNot !== result?.success
                error = undefined
                if (passed) {
                    break
                } else if (result?.abort) {
                    return { ...result, success: isNot }
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

        return  { ...result, success: !isNot }
    } catch {
        if (error) {
            throw error
        }

        return { ...result, subject: result?.subject, success: isNot, actual: result?.actual }
    }
}
