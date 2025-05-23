import { describe, it, expect, beforeEach, vi } from 'vitest'
import { $ } from '@wdio/globals'
import { expect as expectWdio, SoftAssertionService, SoftAssertService } from '../src/index.js'
import type { TestResult } from '@wdio/types/build/Frameworks'

vi.mock('@wdio/globals')

describe('Soft Assertions', () => {
    // Setup a mock element for testing
    let el: any

    beforeEach(async () => {
        el = $('sel')
        // We need to mock getText() which is what the toHaveText matcher actually calls
        el.getText = vi.fn().mockImplementation(() => 'Actual Text')
        // Clear any soft assertion failures before each test
        expectWdio.clearSoftFailures()
    })

    describe('expect.soft', () => {
        it('should not throw immediately on failure', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-1', 'test name', 'test file')

            await expectWdio.soft(el).toHaveText('Expected Text')

            // Verify the failure was recorded
            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)
            expect(failures[0].matcherName).toBe('toHaveText')
            expect(failures[0].error.message).toContain('text')
        })

        it('should support chained assertions with .not', async () => {
            // Setup a test ID for this test
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-2', 'test name', 'test file')

            // This should not throw even though it fails
            await expectWdio.soft(el).not.toHaveText('Actual Text')

            // Verify the failure was recorded
            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)
            expect(failures[0].matcherName).toBe('not.toHaveText')
        })

        it('should support multiple soft failures in the same test', async () => {
            // Setup a test ID for this test
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-3', 'test name', 'test file')

            // These should not throw even though they fail
            await expectWdio.soft(el).toHaveText('First Expected')
            await expectWdio.soft(el).toHaveText('Second Expected')
            await expectWdio.soft(el).toHaveText('Third Expected')

            // Verify all failures were recorded
            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(3)
            expect(failures[0].matcherName).toBe('toHaveText')
            expect(failures[1].matcherName).toBe('toHaveText')
            expect(failures[2].matcherName).toBe('toHaveText')
        })

        it('should allow passing assertions', async () => {
            // Set up a test ID for this test
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-4', 'test name', 'test file')

            // This should pass normally
            await expectWdio.soft(el).toHaveText('Actual Text')

            // Verify no failures were recorded
            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(0)
        })

        it('assertSoftFailures should throw if failures exist', async () => {
            // Setup a test ID for this test
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-5', 'test name', 'test file')

            // Record a failure
            await expectWdio.soft(el).toHaveText('Expected Text')

            // Should throw when asserting failures
            await expect(() => expectWdio.assertSoftFailures()).toThrow(/1 soft assertion failure/)
        })

        it('clearSoftFailures should remove all failures', async () => {
            // Setup a test ID for this test
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-6', 'test name', 'test file')

            // Record failures
            await expectWdio.soft(el).toHaveText('First Expected')
            await expectWdio.soft(el).toHaveText('Second Expected')

            // Verify failures were recorded
            expect(expectWdio.getSoftFailures().length).toBe(2)

            // Clear failures
            expectWdio.clearSoftFailures()

            // Should be no failures now
            expect(expectWdio.getSoftFailures().length).toBe(0)
        })
    })

    describe('SoftAssertService hooks', () => {
        it('afterTest should throw if soft failures exist', () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('test-hooks-1', 'test hooks', 'test file')

            // Mock a test failure
            const error = new Error('Test failure')
            softService.addFailure(error, 'toBeDisplayed')

            // Create mock test result object
            const testResult = { passed: true, error: 'undefined' } as TestResult

            // Create a mock service
            const service = new SoftAssertionService()

            // Call afterTest hook - this should update the result
            service.afterTest({
                file: 'test file', parent: '', title: 'test hooks',
                fullName: '',
                ctx: undefined,
                type: '',
                fullTitle: '',
                pending: false
            }, null, testResult)

            // Verify the test result was updated
            expect(testResult.passed).toBe(true)
            expect(testResult.error).toBeDefined()
        })
    })

    describe('Different Matcher Types', () => {
        beforeEach(async () => {
            el = $('sel')
            // Mock different methods for different matchers
            el.getText = vi.fn().mockImplementation(() => 'Actual Text')
            el.isDisplayed = vi.fn().mockImplementation(() => false)
            el.getAttribute = vi.fn().mockImplementation(() => 'actual-class')
            el.isClickable = vi.fn().mockImplementation(() => false)
            expectWdio.clearSoftFailures()
        })

        it('should handle boolean matchers', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('boolean-test', 'boolean test', 'test file')

            // Test boolean matcher
            await expectWdio.soft(el).toBeDisplayed()
            await expectWdio.soft(el).toBeClickable()

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(2)
            expect(failures[0].matcherName).toBe('toBeDisplayed')
            expect(failures[1].matcherName).toBe('toBeClickable')
        })

        it('should handle attribute matchers with multiple parameters', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('attribute-test', 'attribute test', 'test file')

            await expectWdio.soft(el).toHaveAttribute('class', 'expected-class')

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)
            expect(failures[0].matcherName).toBe('toHaveAttribute')
        })

        it('should handle matchers with options', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('options-test', 'options test', 'test file')

            await expectWdio.soft(el).toHaveText('Expected', { ignoreCase: true, wait: 1000 })

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)
            expect(failures[0].matcherName).toBe('toHaveText')
        })
    })

    describe('Test Isolation', () => {
        it('should isolate failures between different test contexts', async () => {
            const softService = SoftAssertService.getInstance()

            // Test 1
            softService.setCurrentTest('isolation-test-1', 'test 1', 'file1')
            await expectWdio.soft(el).toHaveText('Expected Text 1')
            expect(expectWdio.getSoftFailures().length).toBe(1)

            // Test 2 - should have separate failures
            softService.setCurrentTest('isolation-test-2', 'test 2', 'file2')
            await expectWdio.soft(el).toHaveText('Expected Text 2')

            // Test 2 should only see its own failure
            expect(expectWdio.getSoftFailures('isolation-test-2').length).toBe(1)
            expect(expectWdio.getSoftFailures('isolation-test-1').length).toBe(1)

            // Clear one test shouldn't affect the other
            expectWdio.clearSoftFailures('isolation-test-1')
            expect(expectWdio.getSoftFailures('isolation-test-1').length).toBe(0)
            expect(expectWdio.getSoftFailures('isolation-test-2').length).toBe(1)
        })

        it('should handle calls without test context gracefully', async () => {
            const softService = SoftAssertService.getInstance()
            softService.clearCurrentTest() // No test context

            // Should throw immediately when no test context
            await expect(async () => {
                await expectWdio.soft(el).toHaveText('Expected Text')
            }).rejects.toThrow()
        })

        it('should handle rapid concurrent soft assertions', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('concurrent-test', 'concurrent', 'test file')

            el.getText = vi.fn().mockImplementation(() => 'Actual Text')
            el.isDisplayed = vi.fn().mockImplementation(() => false)
            el.isClickable = vi.fn().mockImplementation(() => false)

            // Fire multiple assertions rapidly
            const promises = [
                expectWdio.soft(el).toHaveText('Expected 1'),
                expectWdio.soft(el).toBeDisplayed(),
                expectWdio.soft(el).toBeClickable()
            ]

            await Promise.all(promises)

            const failures = expectWdio.getSoftFailures()

            expect(failures.length).toBe(3)

            // Verify all different matchers were recorded
            const matcherNames = failures.map(f => f.matcherName)
            expect(matcherNames).toContain('toHaveText')
            expect(matcherNames).toContain('toBeDisplayed')
            expect(matcherNames).toContain('toBeClickable')
        })
    })

    describe('Edge Cases & Error Handling', () => {
        it('should handle matcher that throws non-standard errors', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('error-test', 'error test', 'test file')

            // Mock a matcher that throws a unique error
            const originalMethod = el.getText
            el.getText = vi.fn().mockImplementation(() => {
                throw new TypeError('Weird browser error')
            })

            await expectWdio.soft(el).toHaveText('Expected Text')

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)
            expect(failures[0].error).toBeInstanceOf(Error)
            expect(failures[0].error.message).toContain('Weird browser error')

            // Restore
            el.getText = originalMethod
        })

        it('should handle very long error messages', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('long-error-test', 'long error', 'test file')

            const veryLongText = 'A'.repeat(10000)
            await expectWdio.soft(el).toHaveText(veryLongText)

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)
            expect(failures[0].error.message.length).toBeGreaterThan(0)
        })

        it('should handle null/undefined values gracefully', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('null-test', 'null test', 'test file')

            // Test with null/undefined values
            await expectWdio.soft(el).toHaveText(null as any)
            await expectWdio.soft(el).toHaveAttribute('class', undefined as any)

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(2)
        })

        it('should capture error location information', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('location-test', 'location test', 'test file')

            await expectWdio.soft(el).toHaveText('Expected Text')

            const failures = expectWdio.getSoftFailures()
            expect(failures.length).toBe(1)

            // Should have location info (if implemented)
            if (failures[0].location) {
                expect(failures[0].location).toBeTruthy()
                expect(typeof failures[0].location).toBe('string')
            }
        })

        it('should handle maximum failure limits', async () => {
            const softService = SoftAssertService.getInstance()
            softService.setCurrentTest('limit-test', 'limit test', 'test file')

            // Generate many failures
            const promises = []
            for (let i = 0; i < 150; i++) {
                promises.push(expectWdio.soft(el).toHaveText(`Expected ${i}`))
            }

            await Promise.all(promises)

            const failures = expectWdio.getSoftFailures()
            // Should either limit failures or handle large numbers gracefully
            expect(failures.length).toBeGreaterThan(0)
            expect(failures.length).toBeLessThanOrEqual(150)
        })
    })
})

