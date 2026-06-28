import { describe, it, expect, vi } from 'vitest'
import { isStringOptions } from '../../src/util/commandOptionsUtils'

describe('isStringOptions Type Guard', () => {

    // 1. Testing Requirement: Empty Objects
    describe('Empty Objects', () => {
        it('should return true for a completely empty object literal', () => {
            expect(isStringOptions({})).toBe(true)
        })
    })

    // 2. Testing Requirement: StringOptions Properties
    describe('StringOptions Properties', () => {
        it('should return true for objects containing StringOptions properties', () => {
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
            expect(isStringOptions({ beforeAssertion: async () => {} })).toBe(true)
            expect(isStringOptions({ afterAssertion: async () => {} })).toBe(true)
        })

        it('should return true for a mixed configuration object', () => {
            const mixedOptions = {
                trim: true,
                wait: 1000,
                message: 'Failed assertion'
            }
            expect(isStringOptions(mixedOptions)).toBe(true)
        })
    })

    // 4. Testing Requirement: Non-Option Objects (Exclusions)
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
            // Mocking an asymmetric matcher object shape like expect.stringContaining()
            const mockAsymmetricMatcher = {
                asymmetricMatch: vi.fn(),
                toString: vi.fn()
            }
            expect(isStringOptions(mockAsymmetricMatcher)).toBe(false)
        })

        it('should return false for plain objects with unrelated custom properties', () => {
            expect(isStringOptions({ customKey: 'not-an-option' })).toBe(false)
            expect(isStringOptions({ id: 'element-id', class: 'btn' })).toBe(false)
        })
    })
})
