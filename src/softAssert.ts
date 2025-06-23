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
     */
    public addFailure(error: Error, matcherName: string): void {
        const testId = this.getCurrentTestId()
        if (!testId) {
            throw error // If no test context, throw the error immediately
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

        const failures = this.failureMap.get(testId) || []
        failures.push({ error, matcherName, location })
        this.failureMap.set(testId, failures)
    }

    /**
     * Get all failures for a specific test
     */
    public getFailures(testId?: string): SoftFailure[] {
        const id = testId || this.getCurrentTestId()
        if (!id) {
            return []
        }
        return this.failureMap.get(id) || []
    }

    /**
     * Clear failures for a specific test
     */
    public clearFailures(testId?: string): void {
        const id = testId || this.getCurrentTestId()
        if (id) {
            this.failureMap.delete(id)
        }
    }

    /**
     * Throw an aggregated error if there are failures for the current test
     */
    public assertNoFailures(testId?: string): void {
        const id = testId || this.getCurrentTestId()
        if (!id) {
            return
        }

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