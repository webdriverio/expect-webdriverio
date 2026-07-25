import { describe, it, expect, vi } from 'vitest'
import { isStringOptions } from '../../src/util/commandOptionsUtils'
import { isStrictlyCommandOptions } from '../../src/util/commandOptionsUtils.js'

describe('Command Options Utility Functions', () => {

    describe('isStringOptions Type Guard', () => {

        // 1. Testing Requirement: Empty Objects
        describe('Empty Objects', () => {
            it('should return true for a completely empty object literal', () => {
                expect(isStringOptions({})).toBe(true)
            })
        })

        // 2. Testing Requirement: StringOptions Properties
        describe('StringOptions Properties', () => {
            it('should return true for objects containing valid StringOptions properties', () => {
                expect(isStringOptions({ ignoreCase: true })).toBe(true)
                expect(isStringOptions({ trim: false })).toBe(true)
                expect(isStringOptions({ containing: true })).toBe(true)
                expect(isStringOptions({ atStart: true })).toBe(true)
                expect(isStringOptions({ atEnd: false })).toBe(true)
                expect(isStringOptions({ atIndex: 2 })).toBe(true)
                expect(isStringOptions({ replace: ['foo', 'bar'] })).toBe(true)
                expect(isStringOptions({ asString: true })).toBe(true)
            })
        })

        // 3. Testing Requirement: Inherited CommandOptions & DefaultOptions Properties
        describe('Parent Interface Properties (CommandOptions & DefaultOptions)', () => {
            it('should return true for objects containing inherited properties', () => {
                expect(isStringOptions({ message: 'Custom Error Message' })).toBe(true)
                expect(isStringOptions({ wait: 5000 })).toBe(true)
                expect(isStringOptions({ interval: 200 })).toBe(true)
                expect(isStringOptions({ beforeAssertion: async () => { } })).toBe(true)
                expect(isStringOptions({ afterAssertion: async () => { } })).toBe(true)
            })

            it('should return true for a fully valid mixed configuration object', () => {
                const mixedOptions = {
                    trim: true,
                    wait: 1000,
                    message: 'Failed assertion'
                }
                expect(isStringOptions(mixedOptions)).toBe(true)
            })
        })

        // 4. Testing Requirement: Invalid Configurations & False Positives
        describe('Invalid Configurations & False Positives', () => {
            it('should return false for primitive types and null', () => {
                expect(isStringOptions('some-string-value')).toBe(false)
                expect(isStringOptions(123)).toBe(false)
                expect(isStringOptions(true)).toBe(false)
                expect(isStringOptions(null)).toBe(false)
                expect(isStringOptions(undefined)).toBe(false)
            })

            it('should return false for RegExp instances', () => {
                expect(isStringOptions(/test-regex/i)).toBe(false)
                expect(isStringOptions(new RegExp('test'))).toBe(false)
            })

            it('should return false for Asymmetric Matchers', () => {
                const mockAsymmetricMatcher = {
                    asymmetricMatch: vi.fn(),
                    toString: vi.fn()
                }
                expect(isStringOptions(mockAsymmetricMatcher)).toBe(false)
            })

            it('should return false for plain objects with all unrelated custom properties', () => {
                expect(isStringOptions({ customKey: 'not-an-option' })).toBe(false)
                expect(isStringOptions({ id: 'element-id', class: 'btn' })).toBe(false)
            })

            it('should return false for arrays and other object-type built-ins', () => {
                expect(isStringOptions(['trim', 'ignoreCase'])).toBe(false)
                expect(isStringOptions(new Date())).toBe(false)
            })

            it('should return false for objects containing valid options mixed with invalid/unrecognized keys', () => {
                expect(isStringOptions({ trim: true, invalidProperty: 'malicious-or-typo' })).toBe(false)
                expect(isStringOptions({ wait: 2000, href: '/path/to/element' })).toBe(false)
                expect(isStringOptions({ waitt: 1000 })).toBe(false) // Misspelled option key
            })
        })

        describe('Interface Exhaustiveness Guard', () => {
            it('should compile successfully only if all interface keys are covered', () => {
                // This object maps EVERY allowed key from your Set.
                // We cast it strictly to require all optional keys from the combined types.
                const typeCompletenessCheck: Required<
            ExpectWebdriverIO.StringOptions &
            ExpectWebdriverIO.CommandOptions &
            ExpectWebdriverIO.DefaultOptions
                > = {
                    // StringOptions
                    ignoreCase: true,
                    trim: true,
                    containing: true,
                    atStart: true,
                    atEnd: true,
                    atIndex: 1,
                    replace: ['searchPattern', 'replacementValue'],
                    asString: true,

                    // CommandOptions
                    message: '',

                    // DefaultOptions
                    wait: 0,
                    interval: 0,
                    beforeAssertion: async () => {},
                    afterAssertion: async () => {},
                    featureFlags: {}
                }

                // Run the runtime check against the fully-populated type asset
                expect(isStringOptions(typeCompletenessCheck)).toBe(true)
            })
        })
    })

    describe('isStrictlyCommandOptions Type Guard', () => {

        // 1. Testing Requirement: Empty Objects
        describe('Empty Objects', () => {
            it('should return false for a completely empty object literal - we do not need any backward compatibility for command options', () => {
                expect(isStrictlyCommandOptions({})).toBe(false)
            })
        })

        // 2. Testing Requirement: CommandOptions & DefaultOptions Properties
        describe('CommandOptions & DefaultOptions Properties', () => {
            it('should return true for objects containing valid base command options', () => {
                expect(isStrictlyCommandOptions({ message: 'Custom Error Message' })).toBe(true)
                expect(isStrictlyCommandOptions({ wait: 5000 })).toBe(true)
                expect(isStrictlyCommandOptions({ interval: 200 })).toBe(true)
                expect(isStrictlyCommandOptions({ beforeAssertion: async () => { } })).toBe(true)
                expect(isStrictlyCommandOptions({ afterAssertion: async () => { } })).toBe(true)
            })

            it('should return true for a fully valid mixed base configuration object', () => {
                const mixedOptions = {
                    wait: 1000,
                    message: 'Failed assertion',
                    interval: 50
                }
                expect(isStrictlyCommandOptions(mixedOptions)).toBe(true)
            })
        })

        // 3. Testing Requirement: Invalid Configurations & False Positives
        describe('Invalid Configurations & False Positives', () => {
            it('should return false for primitive types and null', () => {
                expect(isStrictlyCommandOptions('some-string-value')).toBe(false)
                expect(isStrictlyCommandOptions(123)).toBe(false)
                expect(isStrictlyCommandOptions(true)).toBe(false)
                expect(isStrictlyCommandOptions(null)).toBe(false)
                expect(isStrictlyCommandOptions(undefined)).toBe(false)
            })

            it('should return false for RegExp instances', () => {
                expect(isStrictlyCommandOptions(/test-regex/i)).toBe(false)
                expect(isStrictlyCommandOptions(new RegExp('test'))).toBe(false)
            })

            it('should return false for Asymmetric Matchers', () => {
                const mockAsymmetricMatcher = {
                    asymmetricMatch: vi.fn(),
                    toString: vi.fn()
                }
                expect(isStrictlyCommandOptions(mockAsymmetricMatcher)).toBe(false)
            })

            it('should return false for plain objects with unrelated custom properties', () => {
                expect(isStrictlyCommandOptions({ customKey: 'not-an-option' })).toBe(false)
                expect(isStrictlyCommandOptions({ id: 'element-id', class: 'btn' })).toBe(false)
            })

            it('should return false for arrays and other object-type built-ins', () => {
                expect(isStrictlyCommandOptions(['wait', 'message'])).toBe(false)
                expect(isStrictlyCommandOptions(new Date())).toBe(false)
            })

            it('should return false for extended options (like StringOptions keys)', () => {
            // String-specific options should fail a strict command-only option check
                expect(isStrictlyCommandOptions({ trim: true })).toBe(false)
                expect(isStrictlyCommandOptions({ ignoreCase: false })).toBe(false)
                expect(isStrictlyCommandOptions({ wait: 2000, trim: true })).toBe(false)
            })

            it('should return false for objects containing valid options mixed with unrecognized keys', () => {
                expect(isStrictlyCommandOptions({ wait: 2000, invalidProperty: 'malicious-or-typo' })).toBe(false)
                expect(isStrictlyCommandOptions({ message: 'error', href: '/path' })).toBe(false)
                expect(isStrictlyCommandOptions({ waitt: 1000 })).toBe(false) // Misspelled option key
            })
        })

        // 4. Exhaustiveness Guard to catch additions/deletions at compile time
        describe('Interface Exhaustiveness Guard', () => {
            it('should compile successfully only if all interface keys are covered', () => {
            // This object maps EVERY allowed key from COMMAND_OPTIONS_ALLOWED_KEY_LIST.
            // We cast it strictly to require all optional keys from the combined base types.
                const typeCompletenessCheck: Required<
                ExpectWebdriverIO.CommandOptions &
                ExpectWebdriverIO.DefaultOptions
                > = {
                    // CommandOptions
                    message: '',

                    // DefaultOptions
                    wait: 0,
                    interval: 0,
                    beforeAssertion: async () => {},
                    afterAssertion: async () => {},
                    featureFlags: {}
                }

                // Run the runtime check against the fully-populated type asset
                expect(isStrictlyCommandOptions(typeCompletenessCheck)).toBe(true)
            })
        })
    })
})
