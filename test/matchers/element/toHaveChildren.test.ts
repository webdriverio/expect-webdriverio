import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveChildren } from '../../../src/matchers/element/toHaveChildren.js'

vi.mock('@wdio/globals')

describe('toHaveChildren', () => {
    test('no value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, { wait: 0 })
        expect(result.pass).toBe(true)
    })

    test('If no options passed in + children exists', async () => {
        const el = await $('sel')

        const result = await toHaveChildren(el, {})
        expect(result.pass).toBe(true)
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

    test('.not exact value - failure', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.bind({ isNot: true })(el, { eq: 2, wait: 0 })
        expect(result.pass).toBe(true)
    })

    test('.not exact value - success', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.bind({ isNot: true })(el, { eq: 3, wait: 1 })
        expect(result.pass).toBe(false)
    })
})
