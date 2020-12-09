import { compareText,compareTextWithArray } from '../src/utils'

describe('utils', () => {
    describe('compareText', () => {
        test('string match', () => {
            expect(compareText('foo', 'foo', {}).result).toBe(true)
        })

        test('string does not match', () => {
            expect(compareText('foo', 'bar', {}).result).toBe(false)
        })

        test('trim', () => {
            expect(compareText(' foo ', 'foo', { trim: true }).result).toBe(true)
        })

        test('ignoreCase', () => {
            expect(compareText(' FOO ', 'foo', { trim: true, ignoreCase: true }).result).toBe(true)
        })

        test('containing', () => {
            expect(compareText('qwe_AsD_zxc', 'asd', { ignoreCase: true, containing: true }).result).toBe(true)
        })
    })
    describe('compareTextWithArray', () => {
        test('string match in array', () => {
            expect(compareTextWithArray('foo', ['foo', 'bar'], {}).result).toBe(true)
        })

        test('string does not match in array', () => {
            expect(compareTextWithArray('foo', ['foot', 'bar'], {}).result).toBe(false)
        })

        test('trim', () => {
            expect(compareTextWithArray(' foo ', ['foo', 'bar'], { trim: true }).result).toBe(true)
        })

        test('ignoreCase', () => {
            expect(compareTextWithArray(' FOO ', ['foO', 'bar'], { trim: true, ignoreCase: true }).result).toBe(true)
        })

        test('ignoreCase and string does not match in array', () => {
            expect(compareTextWithArray(' FOO ', ['foOO', 'bar'], { trim: true, ignoreCase: true }).result).not.toBe(true)
        })

        test('containing', () => {
            expect(compareTextWithArray('qwe_AsD_zxc', ['foo', 'zxc'], { ignoreCase: true, containing: true }).result).toBe(true)
        })

        test('not containing', () => {
            expect(compareTextWithArray('qwe_AsD_zxc', ['foo', 'zxcc'], { ignoreCase: true, containing: true }).result).not.toBe(true)
        })
    })
})
