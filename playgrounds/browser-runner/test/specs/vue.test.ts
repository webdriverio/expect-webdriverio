import { $, expect } from '@wdio/globals'
import { render } from '@testing-library/vue'
import Component from '../../components/Component.vue'
import { some } from 'expect-webdriverio'

describe('Vue Component Testing', () => {

    describe('when button clicked', () => {
        beforeEach(async () => {
            const { getByText } = render(Component)

            const button = await $(getByText('increment'))
            await button.click()
        })

        describe('single element support', () => {
            it('to exists', async () => {
                await expect($('p=Times clicked: 1')).toExist()
                await expect(await $('p=Times clicked: 1')).toExist()
                await expect($('p=Times clicked: 2')).not.toExist()
            })

            it('to have text', async () => {
                await expect($('p=Times clicked: 1')).toHaveText('Times clicked: 1')
                await expect(await $('p=Times clicked: 1')).toHaveText('Times clicked: 1')
                await expect($('p=Times clicked: 1')).toHaveText(['Times clicked: 1', 'Times clicked: 0'])
                // TODO oneOf matcher is not working with toHaveText, need to investigate why
                //await expect(await $('p=Times clicked: 1')).toHaveText(expect.oneOf('Times clicked: 1', 'Times clicked: 0'))
            })

            it.skip('to have attribute', async () => {
                await expect($('p=Times clicked: 1')).toHaveAttribute('class')
                await expect($('p=Times clicked: 1')).toHaveAttribute('class', undefined, { wait: 0 })
                await expect($('p=Times clicked: 1')).toHaveAttribute('class', expect.anything(), { wait: 0 })
            })
        })

        describe('multi-element support', () => {
            it('to exists', async () => {
                await expect($$('p=Times clicked: 1')).toExist()
                await expect(await $$('p=Times clicked: 2')).not.toExist()
            })

            it('to have text', async () => {
                await expect($$('p=Times clicked: 1')).toHaveText('Times clicked: 1')
                await expect(await $$('p=Times clicked: 1')).toHaveText(['Times clicked: 1', 'Times clicked: 0'])
            })

            it('to have some text', async () => {
                await expect(some($$('p=Times clicked: 1'))).toHaveText('Times clicked: 1',  { featureFlags: { 'useToHaveTextStrictMultiElementsCompareStrategy': true } })
                // TODO oneOf matcher is not working with toHaveText, need to investigate why
                //await expect(await $('p=Times clicked: 1')).toHaveText(expect.oneOf('Times clicked: 1', 'Times clicked: 0'))
            })

            it.skip('to have attribute', async () => {
                await expect($$('p=Times clicked: 1')).toHaveAttribute('class')
                await expect(await $$('p=Times clicked: 1')).toHaveAttribute('class', undefined, { wait: 0 })
                await expect($$('p=Times clicked: 1')).toHaveAttribute('class', expect.anything(), { wait: 0 })
                await expect($$('p=Times clicked: 1')).toHaveAttribute('class', expect.anything(), { wait: 0 })
            })
        })

        // TODO to fix
        it.skip('should support tailwindcss', async () => {
            const elem = await $('p=Times clicked: 1')
            await expect(elem).toHaveStyle({ color: 'rgba(217,119,6,1)' })
        })
    })
})
