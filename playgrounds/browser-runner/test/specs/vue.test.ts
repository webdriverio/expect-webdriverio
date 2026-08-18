import { render } from '@testing-library/vue'
import Component from '../../components/Component.vue'

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
                await expect(await $('p=Times clicked: 2')).not.toExist()
            })

            it('to be displayed', async () => {
                await expect($('p=Times clicked: 1')).toBeDisplayed()
                await expect(await $('p=Times clicked: 1')).toBeDisplayed()
                await expect($('p=Times clicked: 2')).not.toBeDisplayed()
                await expect(await $('p=Times clicked: 2')).not.toBeDisplayed()
            })

            it('non-existing', async () => {
                await expect($('non-existing')).not.toExist()
                await expect(await $('non-existing')).not.toExist()
                await expect($('non-existing')).not.toBeDisplayed()
                await expect(await $('non-existing')).not.toBeDisplayed()
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

            it('some elements are displayed', async () => {
                await expect(expect.some($$('p=Times clicked: 1'))).toBeDisplayed()
            })

            it('to have text', async () => {
                await expect($$('p=Times clicked: 1')).toHaveText('Times clicked: 1')
                await expect(await $$('p=Times clicked: 1')).toHaveText(['Times clicked: 1', 'Times clicked: 0'])
            })

            it('to have some text', async () => {
                // @ts-expect-error: Browser runner is not using the expect-webdriverio types per see, it needs to defined it's own types on top of Jest's `expect` augmented with it's own types!
                await expect(expect.some($$('p=Times clicked: 1'))).toHaveText('Times clicked: 1',  { featureFlags: { 'useToHaveTextStrictMultiElementsCompareStrategy': true } })
                await expect(await $('p=Times clicked: 1')).toHaveText(expect.oneOf('Times clicked: 1', 'Times clicked: 0'))
            })

            it('to have any text', async () => {
                await expect($$('p=Times clicked: 1')).toHaveText(expect.anything(),  { featureFlags: { 'useToHaveTextStrictMultiElementsCompareStrategy': true } })
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
