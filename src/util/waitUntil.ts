import { DEFAULT_OPTIONS } from '../constants.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type ConditionResult = { success: boolean; results: boolean[] }

/**
 * Wait for condition result to succeed (true) or to fail (false) when using `.not`.
 * For a success result with isNot the condition must return false since Jest's expect inverts the result later.
 *
 * @param condition function
 * @param isNot     when using `expect().not`, see https://jestjs.io/docs/expect#thisisnot
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
    let pass: boolean = false

    do {
        try {
            result = await condition()
            error = undefined
            if (isBoolean(result)) {
                pass = result
            } else {
                // Waiting for all to be true. Or all to be false when using `.not` (pass=false since inverted later by Jest)
                pass = isNot ? !isAllFalse(result.results) : isAllTrue(result.results)
            }

            // Waiting for the condition to succeed or to fail when using `.not`
            if (isNot ? !pass : pass) {
                break
            }

        } catch (err) {
            error = err
        }

        // No need to sleep again if time is already over
        if (canWait(start, wait)) {
            await sleep(interval)
        }
    } while (canWait(start, wait))

    if (error) { throw error }

    // When no results were found, ensure the waitUntil return failure even with `.not`
    if (!isBoolean(result) && result.results.length === 0) {
        // To fails with .not, we need pass=true, so it's inverted later by Jest's expect framework
        return isNot
    }

    return pass
}
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const isAllTrue = (results: boolean[]): boolean => results.every((res) => res === true)
const isAllFalse = (results: boolean[]): boolean => results.every((res) => res === false)
const canWait = (start: number, wait: number): boolean => (Date.now() - start) < wait
