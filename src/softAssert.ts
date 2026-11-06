import type { AssertionError } from 'node:assert'
import { getGlobalSingleton } from './util/globalSingleton.js'

interface SoftFailure {
    error: AssertionError | Error;
    matcherName: string;
    location?: string;
    frames: string[];
}

interface TestIdentifier {
    id: string;
    name?: string;
    file?: string;
}

const framesOf = (stack: unknown): string[] => typeof stack !== 'string' ? [] : stack.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '))
    .map((line) => line.slice('at '.length))

// Not a frame of the user code: `node_modules`, Node.js, and engine frames such as `Array.forEach (<anonymous>)`
const isUserFrame = (frame: string) => !frame.includes('node_modules') && !/\bnode:/.test(frame) && !/\((<anonymous>|index \d+)\)$/.test(frame)

/**
 * Captures the stack at the call of `fn`. V8 formats a stack when it is read, so a passing assertion does not format it.
 */
export const captureCaller = (fn: (...args: never[]) => unknown): { stack?: unknown } => {
    const caller: { stack?: unknown } = {}
    Error.captureStackTrace?.(caller, fn)
    return caller
}

/**
 * The frames that lead to the captured call: its direct caller, then the frames of the user code
 */
export const callerFrames = (capturedCaller: { stack?: unknown }): string[] | undefined => {
    const [caller, ...callers] = framesOf(capturedCaller.stack)
    return caller ? [caller, ...callers.filter(isUserFrame)] : undefined
}

/**
 * Soft assertion service to collect failures without stopping test execution
 */
export class SoftAssertService {
    /**
     * Fallback test ID used when no test context is set (e.g., in Cucumber steps).
     *
     * NOTE: usage of this fallback ID in parallel execution environments may result
     * in soft assertion failures from different tests being aggregated together.
     * Ensure proper test context is set in hooks whenever possible.
     */
    public static readonly GLOBAL_TEST_ID = '__global_soft_assert_context__'
    private failureMap: Map<string, SoftFailure[]> = new Map()
    private currentTest: TestIdentifier | null = null

    private constructor() { }

    /**
     * Get singleton instance, shared across every module instance of this package
     * loaded in the same process (see util/globalSingleton.ts).
     */
    public static getInstance(): SoftAssertService {
        return getGlobalSingleton('softAssertService', () => new SoftAssertService())
    }

    /**
     * Set the current test context
     */
    public setCurrentTest(testId: string, testName?: string, testFile?: string): void {
        this.currentTest = { id: testId, name: testName, file: testFile }
        if (!this.failureMap.has(testId)) {
            this.failureMap.set(testId, [])
        }
    }

    /**
     * Clear the current test context
     */
    public clearCurrentTest(): void {
        this.currentTest = null
    }

    /**
     * Get current test ID
     */
    public getCurrentTestId(): string | null {
        return this.currentTest?.id || null
    }

    /**
     * Add a soft failure for the current test
     * If no test context is set, failures are stored under a global fallback ID
     * to ensure soft assertions work even when hooks haven't set the context
     */
    public addFailure(error: Error, matcherName: string, frames?: string[]): void {
        // Use current test ID or fallback to global ID for frameworks where
        // the test context might not be set (e.g., Cucumber without proper hook integration)
        const testId = this.getCurrentTestId() || SoftAssertService.GLOBAL_TEST_ID

        // Ensure the failure map has an entry for this test ID
        if (!this.failureMap.has(testId)) {
            this.failureMap.set(testId, [])
        }

        // Without the frames of the caller, use the first lines of the error stack that are not from this library
        const failureFrames = frames ?? framesOf(error.stack).filter((frame) => isUserFrame(frame) && !frame.includes('expect-webdriverio'))

        // We know the entry exists from the check above
        this.failureMap.get(testId)!.push({ error, matcherName, location: failureFrames[0] ?? '', frames: failureFrames })
    }

    /**
     * Get all failures for a specific test
     * Falls back to global test ID if no context is set
     */
    public getFailures(testId?: string): SoftFailure[] {
        const id = testId || this.getCurrentTestId() || SoftAssertService.GLOBAL_TEST_ID
        return this.failureMap.get(id) || []
    }

    /**
     * Clear failures for a specific test
     * Falls back to global test ID if no context is set
     */
    public clearFailures(testId?: string): void {
        const id = testId || this.getCurrentTestId() || SoftAssertService.GLOBAL_TEST_ID
        this.failureMap.delete(id)
    }

    /**
     * Throw an aggregated error if there are failures for the current test
     * Falls back to global test ID if no context is set
     */
    public assertNoFailures(testId?: string): void {
        const id = testId || this.getCurrentTestId() || SoftAssertService.GLOBAL_TEST_ID

        const failures = this.getFailures(id)
        if (failures.length === 0) {
            return
        }

        // Create a formatted error message with all failures
        let message = `${failures.length} soft assertion failure${failures.length > 1 ? 's' : ''}:\n\n`

        failures.forEach((failure, index) => {
            message += `${index + 1}) ${failure.matcherName}: ${failure.error.message}\n`
            failure.frames.forEach((frame) => {
                message += `   at ${frame}\n`
            })
            message += '\n'
        })

        // Clear failures for this test to prevent duplicate reporting
        this.clearFailures(id)

        // Throw an aggregated error
        const error = new Error(message)
        error.name = 'SoftAssertionsError'
        throw error
    }
}
