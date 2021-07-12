import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty'

describe('toHaveElementProperty', () => {
    test('ignore case of stringified value', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function (): string {
            this._attempts++
            return 'iphone'
        }

        const result = await toHaveElementProperty(el, 'property', 'iPhone', { wait: 0, ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('should return true if values dont match and isNot=true', async () => {
        const el = await $('sel')
        el._value = function (): string {
            return 'iphone'
        }

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'foobar', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return false if values match and isNot=true', async () => {
        const el = await $('sel')
        el._value = function (): string {
            return 'iphone'
        }

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'iphone', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return false for null input', async () => {
        const el = await $('sel')
        el._value = function (): any {
            return undefined
        }

        const result = await toHaveElementProperty(el, 'property', 'iphone', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if value is null', async () => {
        const el = await $('sel')
        el._value = function (): any {
            return "Test Value"
        }

        const result = await toHaveElementProperty(el, 'property', null)
        expect(result.pass).toBe(true)
    })

    test('should return false if value is non-string', async () => {
        const el = await $('sel')
        el._value = function (): any {
            return 5
        }

        const result = await toHaveElementProperty(el, 'property', 'Test Value')
        expect(result.pass).toBe(false)
    })
})
