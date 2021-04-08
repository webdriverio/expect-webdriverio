import { compareText } from '../src/utils'

describe('utils', () => {
    describe('compareText', () => {
        test('string match', () => {
            expect(compareText('foo', 'foo', {}).result).toBe(true)
        })

        test('string does not match', () => {
            expect(compareText('foo', 'bar', {}).result).toBe(false)
        })

        test('trim', () => {
            expect(compareText(' foo ', 'foo', {}).result).toBe(true)
        })

        test('without trim', () => {
            expect(compareText(' foo ', 'foo ', { trim: false }).result).toBe(false)
        })

        test('ignoreCase', () => {
            expect(compareText(' FOO ', 'foo', { ignoreCase: true }).result).toBe(true)
        })

        test('containing', () => {
            expect(compareText('qwe_AsD_zxc', 'asd', { ignoreCase: true, containing: true }).result).toBe(true)
        })
    })
})
