import { describe, test, expect } from 'vitest'
import { compareNumbers, compareText, compareTextWithArray } from '../src/utils.js'

describe('utils', () => {
    describe('compareText', () => {
        test('should pass when strings match', () => {
            expect(compareText('foo', 'foo', {}).result).toBe(true)
        })

        test('should fail when strings do not match', () => {
            expect(compareText('foo', 'bar', {}).result).toBe(false)
        })

        test('should pass when trims away white space', () => {
            expect(compareText(' foo ', 'foo', {}).result).toBe(true)
        })

        test('should fail without trimming away white space', () => {
            expect(compareText(' foo ', 'foo ', { trim: false }).result).toBe(false)
        })

        test('should pass if same word but wrong case and using ignoreCase', () => {
            expect(compareText(' FOO ', 'foo', { ignoreCase: true }).result).toBe(true)
        })

        test('should pass if string contains expected and using containing', () => {
            expect(compareText('qwe_AsD_zxc', 'asd', { ignoreCase: true, containing: true }).result).toBe(true)
        })
    })

    describe('compareTextWithArray', () => {
        test('should pass if strings match in array', () => {
            expect(compareTextWithArray('foo', ['foo', 'bar'], {}).result).toBe(true)
        })

        test('should fail if string does not match in array', () => {
            expect(compareTextWithArray('foo', ['foot', 'bar'], {}).result).toBe(false)
        })

        test('should pass if white space and using trim', () => {
            expect(compareTextWithArray(' foo ', ['foo', 'bar'], { trim: true }).result).toBe(true)
        })

        test('should pass if wrong case and using ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', ['foO', 'bar'], { trim: true, ignoreCase: true }).result).toBe(true)
        })

        test('should pass if string contains and using containing', () => {
            expect(compareTextWithArray('qwe_AsD_zxc', ['foo', 'zxc'], { ignoreCase: true, containing: true }).result).toBe(true)
        })
    })

    describe('compareNumbers', () => {
        test('should work when equal', () => {
            const actual = 10
            const eq = 10
            expect(compareNumbers(actual, { eq })).toBe(true)
        })

        test('should pass when using gte and number is greater', () => {
            const actual = 10
            const gte = 5
            expect(compareNumbers(actual, { gte })).toBe(true)
        })

        test('should pass when using lte and number is lower', () => {
            const actual = 10
            const lte = 20
            expect(compareNumbers(actual, { lte })).toBe(true)
        })

        test('should pass when usin lte and gte and number is in between', () => {
            const actual = 10
            const lte = 20
            const gte = 1
            expect(compareNumbers(actual, { lte, gte })).toBe(true)
        })

        test('should fail when using lte and gte and is lte but not gte', () => {
            const actual = 10
            const lte = 20
            const gte = 15
            expect(compareNumbers(actual, { lte, gte })).toBe(false)
        })

        test('should fail when using lte and gte and is gte but not lte', () => {
            const actual = 10
            const lte = 9
            const gte = 1
            expect(compareNumbers(actual, { lte, gte })).toBe(false)
        })
    })
})
