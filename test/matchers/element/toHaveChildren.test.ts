import { toHaveChildren } from '../../../src/matchers/element/toHaveChildren'

describe('toHaveChildren', () => {
    test('no value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, { wait: 0 })
        expect(result.pass).toBe(true)
    })

    test('no value - children are null', async () => {
        const el = await $('sel')
        // Mocks the selector as returning null
        el.$$ = jest.fn()

        const result = await toHaveChildren(el, { wait: 0 })
        expect(result.pass).toBe(false)
    })

    test('value exact - children are null', async () => {
        const el = await $('sel')
        // Mocks the selector as returning null
        el.$$ = jest.fn()

        const result = await toHaveChildren(el, 5, { wait: 0 })
        expect(result.pass).toBe(false)
    })

    test('exact number value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, 2, { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('exact value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, { eq: 2, wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('gte value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, { gte: 2, wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('exact value - failure', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, { eq: 3, wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('lte value - failure', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, { lte: 1, wait: 0 })
        expect(result.pass).toBe(false)
    })

    // There is 2 children so with isNot true should return false
    test('.not exact value - failure', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.bind({ isNot: true })(el, { eq: 2, wait: 0 })
        expect(result.pass).toBe(false)
    })

    // There is 2 children so with isNot true should return true
    test('.not exact value - success', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.bind({ isNot: true })(el, { eq: 3, wait: 1 })
        expect(result.pass).toBe(true)
    })
})
