import type { Services } from '@wdio/types'
import type { Frameworks } from '@wdio/types'
import { SoftAssertService } from './softAssert.js'

export interface SoftAssertionServiceOptions {
    autoAssertOnTestEnd?: boolean;
}

/**
 * WebdriverIO service to integrate soft assertions into the test lifecycle
 */
export class SoftAssertionService implements Services.ServiceInstance {
    private softAssertService: SoftAssertService
    public options: SoftAssertionServiceOptions

    constructor(
        serviceOptions?: SoftAssertionServiceOptions,
    ) {
        this.softAssertService = SoftAssertService.getInstance()
        this.options = {
            autoAssertOnTestEnd: true,
            ...serviceOptions
        }
    }

    /**
     * Hook before a test starts
     */
    beforeTest(test: Frameworks.Test) {
        const testId = this.getTestId(test)
        this.softAssertService.setCurrentTest(testId, test.title, test.file)
    }

    /**
     * Hook before a Cucumber step starts
     */
    beforeStep(step: Frameworks.PickleStep, scenario: Frameworks.Scenario) {
        const stepId = `${scenario.uri || ''}:${scenario.name || ''}:${step.text || ''}`
        this.softAssertService.setCurrentTest(stepId, step.text, scenario.uri)
    }

    /**
     * Hook after a test completes
     */
    afterTest(test: Frameworks.Test, _: unknown, result: Frameworks.TestResult) {
        // Only assert failures if:
        // 1. The test hasn't yet failed for another reason
        // 2. Auto-assertion is enabled in the configuration
        if (!result.error && this.options.autoAssertOnTestEnd) {
            try {
                const testId = this.getTestId(test)
                this.softAssertService.assertNoFailures(testId)
            } catch (error) {
                // Update the test result with our aggregated error
                result.error = error
                result.passed = false
            }
        }
        this.softAssertService.clearCurrentTest()
    }

    /**
     * Hook after a Cucumber step completes
     */
    afterStep(step: Frameworks.PickleStep, scenario: Frameworks.Scenario, result: { passed: boolean, error?: Error }) {
        // Only assert failures if the step hasn't already failed for another reason
        if (result.passed) {
            try {
                const stepId = `${scenario.uri || ''}:${scenario.name || ''}:${step.text || ''}`
                this.softAssertService.assertNoFailures(stepId)
            } catch (error) {
                // Update the step result with our aggregated error
                result.error = error as Error
                result.passed = false
            }
        }
        this.softAssertService.clearCurrentTest()
    }

    /**
     * Generate a unique test ID from a test object
     */
    private getTestId(test: Frameworks.Test): string {
        return `${test.file || ''}:${test.parent || ''}:${test.title || ''}`
    }
}
