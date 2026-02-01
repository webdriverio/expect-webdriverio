import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveChildren } from '../../../src/matchers/element/toHaveChildren.js'

vi.mock('@wdio/globals')

describe('toHaveChildren', () => {
    test('no value', async () => {
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, undefined, { wait: 0, beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveChildren',
            options: { wait: 0, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveChildren',
            options: { wait: 0, beforeAssertion, afterAssertion },
            result
        })
    })

    test('If no options passed in + children exists', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, {})
        expect(result.pass).toBe(true)
    })

    test('exact number value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, 2, { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('exact value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, { eq: 2, wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('gte value', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, { gte: 2, wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('exact value - failure', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, { eq: 3, wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('lte value - failure', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.call({}, el, { lte: 1, wait: 0 })
        expect(result.pass).toBe(false)
    })

    test('.not exact value - failure - pass should be true', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.bind({ isNot: true })(el, { eq: 2, wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have children

Expected [not]: 2
Received      : 2`)

    })

    test('.not exact value - success - pass should be false', async () => {
        const el = await $('sel')

        const result = await toHaveChildren.bind({ isNot: true })(el, { eq: 3, wait: 1 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })
})
