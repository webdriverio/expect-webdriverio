import { describe, it, expect, vi } from 'vitest'
import { $$ } from '@wdio/globals'
import { SomeElementsWrapper } from '../../../src/matchers/modifiers/some'

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
})
