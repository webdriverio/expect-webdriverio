import { describe, it, expect, vi } from 'vitest'
import { $$ } from '@wdio/globals'
import { isSomeWrapper, SomeElementsWrapper, some } from '../../../src/matchers/modifiers/some'

vi.mock('@wdio/globals')

describe('SomeElementsWrapper', () => {
    it('should create a SomeElementsWrapper instance', () => {
        const elements = $$('div')
        const wrapper = new SomeElementsWrapper(elements)

        expect(wrapper).toBeInstanceOf(SomeElementsWrapper)
    })

    it('should have the elements property', () => {
        const elements = $$('div')
        const wrapper = new SomeElementsWrapper(elements)

        expect(wrapper.elements).toEqual(elements)
    })

    describe('some', () => {
        it('should return a SomeElementsWrapper', () => {
            const elements = $$('div')
            expect(some(elements)).toBeInstanceOf(SomeElementsWrapper)
        })
    })

    describe('isSomeWrapper', () => {
        it('should return true for a SomeElementsWrapper instance (instanceof path)', () => {
            const wrapper = new SomeElementsWrapper($$('div'))
            expect(isSomeWrapper(wrapper)).toBe(true)
        })

        it('should return true for a plain object carrying the symbol (cross-module path)', () => {
            // Simulates a SomeElementsWrapper created by a different module copy
            const SOME_SYMBOL = Symbol.for('expect-webdriverio.some')
            const crossModuleValue = { [SOME_SYMBOL]: true, elements: [] }
            expect(isSomeWrapper(crossModuleValue)).toBe(true)
        })

        it('should return false when the symbol is present but set to false', () => {
            const SOME_SYMBOL = Symbol.for('expect-webdriverio.some')
            const value = { [SOME_SYMBOL]: false, elements: [] }
            expect(isSomeWrapper(value)).toBe(false)
        })

        it('should return false for null', () => {
            expect(isSomeWrapper(null)).toBe(false)
        })

        it('should return false for undefined', () => {
            expect(isSomeWrapper(undefined)).toBe(false)
        })

        it('should return false for a plain object without the symbol', () => {
            expect(isSomeWrapper({ elements: [] })).toBe(false)
        })

        it('should return false for a primitive value', () => {
            expect(isSomeWrapper('some string')).toBe(false)
        })
    })

    it('should return false for instanceof but true for symbol across module copies', async () => {
        const { SomeElementsWrapper, isSomeWrapper } = await import('../../../src/matchers/modifiers/some')

        // Clear the registry so the next import gets a fresh constructor
        vi.resetModules()

        const { SomeElementsWrapper: SomeElementsWrapperB } = await import('../../../src/matchers/modifiers/some')

        const crossModuleWrapper = new SomeElementsWrapperB([])

        // instanceof fails — different constructor across module copies
        expect(crossModuleWrapper instanceof SomeElementsWrapper).toBe(false)

        // isSomeWrapper still succeeds — Symbol.for() is global and shared
        expect(isSomeWrapper(crossModuleWrapper)).toBe(true)
    })
})
