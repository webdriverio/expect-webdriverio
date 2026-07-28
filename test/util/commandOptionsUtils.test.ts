import { describe, it, expect } from 'vitest'
import { isDefinedPlainObject } from '../../src/util/commandOptionsUtils.js'

describe('Command Options Utility Functions', () => {

    it('should return true for defined objects', () => {
        expect(isDefinedPlainObject({})).toBe(true)
        expect(isDefinedPlainObject({ a: 1 })).toBe(true)
    })

    it('should return false for non-objects', () => {
        expect(isDefinedPlainObject(null)).toBe(false)
        expect(isDefinedPlainObject(undefined)).toBe(false)
        expect(isDefinedPlainObject(123)).toBe(false)
        expect(isDefinedPlainObject('string')).toBe(false)
        expect(isDefinedPlainObject(true)).toBe(false)
    })

    it('should return false for arrays', () => {
        expect(isDefinedPlainObject([])).toBe(false)
        expect(isDefinedPlainObject([1, 2, 3])).toBe(false)
    })
})
