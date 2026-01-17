import { DEFAULT_OPTIONS } from '../constants.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type ConditionResult = { success: boolean; results: boolean[] }

/**
 * Wait for condition result to succeed (true) even when isNot is also true.
 * For a success result with isNot the condition must return false since Jest's expect inverts the result later.
 *
 * @param condition function
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval
 */
export const waitUntil = async (
    condition: () => Promise<boolean | ConditionResult>,
    isNot: boolean | undefined,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval }
): Promise<boolean> => {
    isNot = isNot ?? false

    const start = Date.now()
    let error: unknown
    let result: boolean | ConditionResult = false

    do {
        try {
            result = await condition()
            error = undefined
            if (typeof result === 'boolean' ? result : result.success) {
                break
            }
        } catch (err) {
            error = err
        }

        // No need to sleep again if time is already over
        if (Date.now() - start < wait) {
            await sleep(interval)
        }
    } while (Date.now() - start < wait)

    if (error) { throw error }

    if (typeof result === 'boolean') {
        return result
    }

    const { results } = result

    if (results.length === 0) {
        // To fails when using .not, we need to send true so that Jest inverts it to false
        return isNot
    }

    // TODO dprevost: Should we consider moving that into a strategy pattern, so that if a matching does not need the same pattern he can change it?
    const allTrue = () => results.every((result) => result)
    const allFalse = () => results.every((result) => !result)

    // Needs to return true when all true, but with isNot, must be success=false when all false (failure=true when at least one true)
    return isNot ? !allFalse() : allTrue()
}
