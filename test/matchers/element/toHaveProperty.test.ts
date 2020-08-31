import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty'

describe('toHaveElementProperty', () => {
    test('ignore case of stringified value', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function (): string {
            this._attempts++
            return 'iphone'
        }

        const result = await toHaveElementProperty(
            el, 'value', 'iPhone',
            { wait: 0, ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })
})
