import type { AssertionError } from 'node:assert'

interface SoftFailure {
    error: AssertionError | Error;
    matcherName: string;
    location?: string;
}

interface TestIdentifier {
    id: string;
    name?: string;
    file?: string;
}

/**
 * Soft assertion service to collect failures without stopping test execution
 */
export class SoftAssertService {
    private static instance: SoftAssertService
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
     * Get singleton instance
     */
    public static getInstance(): SoftAssertService {
        if (!SoftAssertService.instance) {
            SoftAssertService.instance = new SoftAssertService()
        }
        return SoftAssertService.instance
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
    public addFailure(error: Error, matcherName: string): void {
        // Use current test ID or fallback to global ID for frameworks where
        // the test context might not be set (e.g., Cucumber without proper hook integration)
        const testId = this.getCurrentTestId() || SoftAssertService.GLOBAL_TEST_ID

        // Ensure the failure map has an entry for this test ID
        if (!this.failureMap.has(testId)) {
            this.failureMap.set(testId, [])
        }

        // Extract stack information to get file and line number
        const stackLines = error.stack?.split('\n') || []
        let location = ''

        // Find the first non-expect-webdriverio line in the stack
        for (const line of stackLines) {
            if (line && !line.includes('expect-webdriverio') && !line.includes('node_modules')) {
                location = line.trim()
                break
            }
        }

        // We know the entry exists from the check above
        this.failureMap.get(testId)!.push({ error, matcherName, location })
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
            if (failure.location) {
                message += `   at ${failure.location}\n`
            }
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
