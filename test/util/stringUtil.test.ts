import { describe, expect, test } from 'vitest'
import { isString, toJsonString } from '../../src/util/stringUtil'

describe('stringUtil', () => {
    describe(isString, () => {
        test('should return true for a string', () => {
            expect(isString('hello')).toBe(true)
            expect(isString('')).toBe(true)
        })

        test('should return false for non-string values', () => {
            expect(isString(123)).toBe(false)
            expect(isString(true)).toBe(false)
            expect(isString({})).toBe(false)
            expect(isString(null)).toBe(false)
            expect(isString(undefined)).toBe(false)
            expect(isString([])).toBe(false)
        })
    })

    describe(toJsonString, () => {
        test('should return the string as is if input is a string', () => {
            expect(toJsonString('hello')).toBe('hello')
        })

        test('should return JSON string if input is a serializable object', () => {
            const obj = { foo: 'bar', num: 123 }
            expect(toJsonString(obj)).toBe(JSON.stringify(obj))
        })

        test('should return string representation if JSON.stringify throws', () => {
            const circular: any = { foo: 'bar' }
            circular.self = circular

            expect(toJsonString(circular)).toBe('[object Object]')
            expect(toJsonString(BigInt(9007199254740991))).toBe('9007199254740991')
        })

        test('should return string representation for other types', () => {
            expect(toJsonString(123)).toBe('123')
            expect(toJsonString(true)).toBe('true')
            expect(toJsonString(null)).toBe('null')
        })

        test('should handle undefined correctly', () => {
            expect(toJsonString(undefined)).toBeUndefined()
        })
    })
})
