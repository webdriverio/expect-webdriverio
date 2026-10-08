import { test, expect, describe, afterEach, beforeEach, vi } from 'vitest'
import { browser } from '@wdio/globals'
import { setDefaultOptions } from '../src/index.js'
import { DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../src/constants.js'
import { toHaveTitle } from '../src/matchers/browser/toHaveTitle.js'

vi.mock('@wdio/globals')

describe('Default Options', () => {
    const defaultOptions = { ...DEFAULT_OPTIONS }
    afterEach(() => {
        setDefaultOptions(defaultOptions)
    })

    describe(setDefaultOptions, () => {

        test('setDefaultOptions should update both DEFAULT_OPTIONS_TO_BE_DISPLAYED and DEFAULT_OPTIONS', () => {
            expect(DEFAULT_OPTIONS_TO_BE_DISPLAYED.wait).not.toBe(1234)
            expect(DEFAULT_OPTIONS.wait).not.toBe(1234)

            setDefaultOptions({ wait: 1234 })

            expect(DEFAULT_OPTIONS_TO_BE_DISPLAYED.wait).toBe(1234)
            expect(DEFAULT_OPTIONS.wait).toBe(1234)
        })
    })

    // Fake timers: the test does not depend on the speed of the runner. `waitUntil()` runs the condition, then waits
    // `interval`, until more than `wait` ms passed: with `{ wait: 500, interval: 100 }`, at 0, 100, ..., 500 ms
    // (6 times), and the matcher fails at 600 ms
    describe('a failing matcher with no options waits with the global options', () => {
        const matchers: ExpectWebdriverIO.MatcherContext & { toHaveTitle: typeof toHaveTitle } = { toHaveTitle }

        beforeEach(() => {
            vi.useFakeTimers()
            vi.mocked(browser.getTitle).mockResolvedValue('Other title')
        })

        afterEach(() => {
            vi.useRealTimers()
            vi.mocked(browser.getTitle).mockReset()
        })

        // Starts the matcher and moves the fake clock: check `isSettled()` before awaiting `result`, which never settles
        // when the matcher waits longer
        const runFor = async (ms: number, options?: ExpectWebdriverIO.StringOptions) => {
            let settled = false
            const result = matchers.toHaveTitle(browser, 'Expected title', options).finally(() => { settled = true })
            await vi.advanceTimersByTimeAsync(ms)
            return { isSettled: () => settled, result }
        }

        test('retries at each global interval, and fails after the global wait', async () => {
            setDefaultOptions({ wait: 500, interval: 100 })

            const { isSettled, result } = await runFor(599)
            expect(isSettled()).toBe(false)

            await vi.advanceTimersByTimeAsync(1)
            expect(isSettled()).toBe(true)
            expect((await result).pass).toBe(false)
            expect(browser.getTitle).toHaveBeenCalledTimes(6)
        })

        test('tries once with a global wait of 1 ms', async () => {
            setDefaultOptions({ wait: 1, interval: 100 })

            const { isSettled, result } = await runFor(100)

            expect(isSettled()).toBe(true)
            expect((await result).pass).toBe(false)
            expect(browser.getTitle).toHaveBeenCalledTimes(1)
        })

        test('uses the options of the call before the global options', async () => {
            setDefaultOptions({ wait: 500, interval: 100 })

            const { isSettled, result } = await runFor(100, { wait: 1 })

            expect(isSettled()).toBe(true)
            expect((await result).pass).toBe(false)
            expect(browser.getTitle).toHaveBeenCalledTimes(1)
        })
    })

})

