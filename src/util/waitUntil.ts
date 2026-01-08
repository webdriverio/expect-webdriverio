import { DEFAULT_OPTIONS } from '../constants.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type ConditionResult = { success: boolean; results: boolean[] }

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval, etc
 */
export const waitUntil = async (
    condition: () => Promise<boolean | ConditionResult>,
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {}
): Promise<boolean> => {
    // single attempt
    if (wait === 0) {
        const  result = await condition()
        if (result instanceof Boolean || typeof result === 'boolean') {
            return isNot !== result
        }
        const { results } = result
        if (results.length === 0) {return false}
        return results.every((result) => isNot !== result)
    }

    const start = Date.now()
    let error: unknown
    let result: boolean | ConditionResult = false

    while (Date.now() - start <= wait) {
        try {
            result = await condition()
            error = undefined
            if (typeof result === 'boolean' ? result : result.success) {
                break
            }
        } catch (err) {
            error = err
        }
        await sleep(interval)
    }

    if (error) {
        throw error
    }

    if (typeof result === 'boolean') {
        return isNot !== result
    }

    const { results } = result
    if (results.length === 0) {return false}
    return results.every((result) => isNot !== result)

}
