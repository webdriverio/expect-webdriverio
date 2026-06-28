import { DEFAULT_OPTIONS } from '../constants'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval, etc
 */
export const waitUntil = async (
    condition: () => Promise<boolean>,
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {}
): Promise<boolean> => {
    // single attempt
    if (wait === 0) {
        return await condition()
    }

    let error: Error | undefined

    // wait for condition to be truthy
    try {
        const start = Date.now()
        while (true) {
            if (Date.now() - start > wait) {
                throw new Error('timeout')
            }

            try {
                const result = isNot !== (await condition())
                error = undefined
                if (result) {
                    break
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

        return !isNot
    } catch {
        if (error) {
            throw error
        }

        return isNot
    }
}
