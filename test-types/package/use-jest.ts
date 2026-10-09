declare const el: WebdriverIO.Element

// The custom matchers and the custom option of `custom.ts`, as a user adds them
export async function checkCustom() {
    void expect(1).toBeCustomWdio('a')
    await expect(el).toBeCustomElement()
    await expect(el).not.toBeCustomElement()
    // @ts-expect-error the custom matcher is only on an element
    await expect('text').toBeCustomElement()
    await expect(el).toHaveText(expect.toBeCustomAsymmetric('a'))
    await expect(el).not.toHaveText(expect.toBeCustomAsymmetric('a'))
    await expect(el).toHaveText('a', { customOption: 'value', ignoreCase: true })
    await expect(el).toBeDisplayed({ customOption: 'value' })
    // @ts-expect-error the custom option is a string
    await expect(el).toHaveText('a', { customOption: 1 })
    // The matchers of the package stay
    await expect(el).toHaveText('a')
}
