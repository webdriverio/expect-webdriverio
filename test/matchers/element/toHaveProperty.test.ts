import { getExpectMessage, getReceived } from '../../__fixtures__/utils';
import { toHaveProperty } from '../../../src/matchers/element/toHaveProperty'

describe('toHaveProperty', () => {
    test('ignore case of stringified value', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return 'iphone'
        }

        const result = await toHaveProperty(el, 'value', 'iPhone', { wait: 0, ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })
})
